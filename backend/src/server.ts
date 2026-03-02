import express from 'express';
import cors from 'cors';
import { generateMessageVariations } from './services/gemini';
import { sendTextMessage, sendMediaMessage } from './services/evolution';
import { getRandomDelay, sleep } from './utils/delay';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: '*', // Permite a Vercel acessar a API local sem bloqueios de Origin (em dev/test stage)
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Armazena o estado do sistema se estiver rodando
let isRunning = false;
let killSwitch = false;

// Rota de status do Backend
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', running: isRunning });
});

// ==========================================
// SSE (Server-Sent Events) - Stream de Logs
// ==========================================
let clients: express.Response[] = [];

// Função auxiliar para disparar os eventos de log pro frontend em tempo real
const broadcastLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const logEntry = JSON.stringify({ message, type, timestamp: new Date().toISOString() });

    // Mostra no console local também
    if (type === 'error') console.error(message);
    else if (type === 'warning') console.warn(message);
    else console.log(message);

    // Envia aos navegadores conectados
    clients.forEach(client => {
        client.write(`data: ${logEntry}\n\n`);
    });
};

app.get('/api/logs', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});

// Importando serviços da automação de prospecção (Stitch + Puppeteer)
import { enrichCompanyData } from './services/places';
import { generateSiteWithStitch } from './services/stitch';
import { takeScreenshot } from './services/puppeteer';
import { dispatchToN8n } from './services/webhook';

// Endpoint para Acionar o fluxo de Prospecção (Stitch -> Puppeteer -> n8n)
app.post('/api/prospect', async (req, res) => {
    const { companyName, city } = req.body;

    if (!companyName || !city) {
        return res.status(400).json({ error: 'companyName e city são obrigatórios.' });
    }

    // Retorna HTTP 200 rápido para não prender o UX no Frontend, e continua rodando em background
    res.json({ message: 'Processo de prospecção iniciado em background.' });

    try {
        console.log(`\n======================================================`);
        console.log(`[PROSPECT FLOW] Iniciando para: ${companyName} (${city})`);

        // 0. Enriquecimento de Dados Dinâmico via Google Places
        const companyData = await enrichCompanyData(companyName, city);
        console.log(`[PROSPECT FLOW] Dados enriquecidos: nicho ${companyData.types[0]}, cor ${companyData.primaryColor}`);

        // 1. Gera o site (Mock via Stitch API design instructions usando os dados extraídos)
        const htmlFilePath = await generateSiteWithStitch(companyData.name, city, companyData.primaryColor, companyData.types[0]);
        console.log(`[PROSPECT FLOW] Site gerado com sucesso: ${htmlFilePath}`);

        // 2. Tira Print HD da pagina gerada
        const screenshotBase64 = await takeScreenshot(htmlFilePath, companyData.name);
        console.log(`[PROSPECT FLOW] Screenshot capturado (${Math.round(screenshotBase64.length / 1024)} KB).`);

        // 3. Dispara as informações finais (Webhook pro n8n/evolution api)
        const dispatchSuccess = await dispatchToN8n(companyData.name, city, screenshotBase64);

        if (dispatchSuccess) {
            console.log(`[PROSPECT FLOW] Sucesso final! Lead orquestrado e enviado para vendas.`);
        } else {
            console.warn(`[PROSPECT FLOW] Falha no disparo final (n8n).`);
        }
        console.log(`======================================================\n`);

    } catch (e) {
        console.error(`[PROSPECT FLOW] Erro fatal orquestrando fluxo de prospecção:`, e);
    }
});

// Endpoint principal para Iniciar o envio em massa
app.post('/api/start', async (req, res) => {
    if (isRunning) {
        return res.status(400).json({ error: 'Um processo de envio já está em execução.' });
    }

    const { numbers, baseMessage } = req.body;

    if (!Array.isArray(numbers) || numbers.length === 0 || !baseMessage) {
        return res.status(400).json({ error: 'É necessário enviar os arrays de numbers e a baseMessage.' });
    }

    isRunning = true;
    killSwitch = false;
    res.json({ message: 'Processo de envio iniciado em background.' });

    // Roda em Background sem prender o tempo limite HTTP (Netlify function não espera aqui)
    try {
        console.log(`[API] Solicitada geração de variações para mensagem base...`);
        const messageVariations = await generateMessageVariations(baseMessage);
        console.log(`[API] ${messageVariations.length} variações geradas.`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < numbers.length; i++) {
            if (killSwitch) {
                console.log('[API] Processo interrompido pelo usuário.');
                break;
            }

            const currentNumber = String(numbers[i] ?? '');
            if (!currentNumber) continue;

            const randomIndex = Math.floor(Math.random() * messageVariations.length);
            const selectedMessage = messageVariations[randomIndex] ?? baseMessage;

            console.log(`[API ${i + 1}/${numbers.length}] Disparando para ${currentNumber}...`);
            const wasSent = await sendTextMessage(currentNumber, selectedMessage);

            if (wasSent) {
                successCount++;
            } else {
                failCount++;
            }

            if (i < numbers.length - 1 && !killSwitch) {
                const delayMs = getRandomDelay(61, 95);
                console.log(`[API] Aguardando cooldown: ${(delayMs / 1000).toFixed(1)}s`);
                await sleep(delayMs);
            }
        }

        console.log(`[API] Fim do Processo. Sucesso: ${successCount} | Falhas: ${failCount}`);
    } catch (e) {
        console.error('[API] Erro interno:', e);
    } finally {
        isRunning = false;
    }
});

// NOVO ENDPOINT: Geração + Disparo Automático Nativo (Fase 7)
// Aceita uma copy e uma lista de { companyName, city, number }
app.post('/api/prospect/bulk', async (req, res) => {
    if (isRunning) {
        return res.status(400).json({ error: 'Um processo de envio já está em execução.' });
    }

    const { baseMessage, leads } = req.body;

    if (!Array.isArray(leads) || leads.length === 0 || !baseMessage) {
        return res.status(400).json({ error: 'É necessário enviar o array de leads e a baseMessage.' });
    }

    isRunning = true;
    killSwitch = false;
    res.json({ message: 'Processo inteligente de geração e disparo iniciado em background.' });

    try {
        broadcastLog(`\n======================================================`);
        broadcastLog(`[BULK PROSPECT] Iniciando automação para ${leads.length} leads...`);

        broadcastLog(`[BULK PROSPECT] Rotacionando copy base no Gemini...`);
        const messageVariations = await generateMessageVariations(baseMessage);

        for (let i = 0; i < leads.length; i++) {
            // Se estiver pausado, trava o loop aqui indefinidamente até soltarem
            while (isPaused && !killSwitch) {
                await sleep(2000);
            }

            if (killSwitch) {
                broadcastLog('[BULK PROSPECT] Processo INTERROMPIDO a pedido do usuário.', 'warning');
                break;
            }

            const lead = leads[i];
            const { companyName, city, number } = lead;

            if (!companyName || !city || !number) {
                broadcastLog(`[BULK PROSPECT] Pulando lead inválido index ${i}`, 'warning');
                continue;
            }

            broadcastLog(`\n--- Processando lead ${i + 1}/${leads.length}: ${companyName} (${city}) ---`);

            // 1. Google Places
            const companyData = await enrichCompanyData(companyName, city);

            // 2. Stitch MCP
            const htmlFilePath = await generateSiteWithStitch(companyData.name, city, companyData.primaryColor, companyData.types[0]);

            // 3. Puppeteer
            const screenshotBase64 = await takeScreenshot(htmlFilePath, companyData.name);
            broadcastLog(`[BULK PROSPECT] Screenshot OK.`);

            // 4. Disparo (Evolution API) - Primeiro a Mídia, depois o Texto
            const caption = `Confira a demonstração que criamos para *${companyData.name}*!`;

            broadcastLog(`[BULK PROSPECT] Enviando imagem via Evolution API...`);
            const mediaSent = await sendMediaMessage(number, screenshotBase64, caption);

            if (mediaSent) {
                // Seleciona texto rotacionado pro follow up
                const randomIndex = Math.floor(Math.random() * messageVariations.length);
                const textFollowUp = messageVariations[randomIndex] ?? baseMessage;

                broadcastLog(`[BULK PROSPECT] Aguardando 3s antes do texto rotacional...`);
                await sleep(3000);

                await sendTextMessage(number, textFollowUp);
                broadcastLog(`[BULK PROSPECT] Fluxo de mensagem OK para +${number}`, 'success');
            } else {
                broadcastLog(`[BULK PROSPECT] Mídia falhou para +${number}, pulando texto.`, 'error');
            }

            // 5. Anti-Ban Seguro (se não for o último)
            if (i < leads.length - 1 && !killSwitch) {
                // Aumentando delay pois manda site (pode ser visto como spam mais pesado se repetido mto rapido)
                const delayMs = getRandomDelay(45, 85);
                broadcastLog(`[BULK PROSPECT] Aguardando cooldown de anti-ban: ${(delayMs / 1000).toFixed(1)}s`, 'warning');
                await sleep(delayMs);
            }
        }
        broadcastLog(`[BULK PROSPECT] Processo Finalizado.`, 'success');
        broadcastLog(`======================================================\n`);
    } catch (e: any) {
        broadcastLog(`[BULK PROSPECT] Erro interno: ${e.message}`, 'error');
    } finally {
        isRunning = false;
    }
});

// NOVO ENDPOINT: Geração + Disparo de Teste Único (Fase 9)
// Aceita dados de 1 único lead para envio manual e validação (Sem gastar IA excessiva)
app.post('/api/prospect/single', async (req, res) => {
    const { companyName, city, number, baseMessage } = req.body;

    if (!companyName || !city || !number || !baseMessage) {
        return res.status(400).json({ error: 'Todos os campos (companyName, city, number, baseMessage) são obrigatórios.' });
    }

    // Retorna HTTP 200 rápido para não prender o UX no Frontend, e continua rodando em background
    res.json({ message: 'Teste individual iniciado. A mensagem deve chegar em breve.' });

    try {
        broadcastLog(`\n======================================================`);
        broadcastLog(`[SINGLE TEST] Testando lead: ${companyName} (${city}) para +${number}`);

        // 1. Google Places (Enriquecimento)
        const companyData = await enrichCompanyData(companyName, city);

        // 2. Stitch MCP (Mock HTML Local - Nao gasta creditos)
        const htmlFilePath = await generateSiteWithStitch(companyData.name, city, companyData.primaryColor, companyData.types[0]);

        // 3. Puppeteer Screenshot
        const screenshotBase64 = await takeScreenshot(htmlFilePath, companyData.name);
        broadcastLog(`[SINGLE TEST] Screenshot OK.`);

        // 4. Disparo (Evolution API)
        const caption = `[TESTE ANTI-GRAVITY]\nConfira a demonstração gerada para *${companyData.name}*!`;
        broadcastLog(`[SINGLE TEST] Enviando imagem teste via Evolution API...`);

        const mediaSent = await sendMediaMessage(number, screenshotBase64, caption);
        if (mediaSent) {
            broadcastLog(`[SINGLE TEST] Imagem enviada com sucesso, aguardando 2s para enviar texto base...`);
            await sleep(2000);
            await sendTextMessage(number, `*Mensagem Original:*\n\n${baseMessage}`);
            broadcastLog(`[SINGLE TEST] Fluxo de mensagem OK.`, 'success');
        } else {
            broadcastLog(`[SINGLE TEST] Falha no disparo da imagem de teste.`, 'error');
        }

        broadcastLog(`======================================================\n`);
    } catch (e: any) {
        broadcastLog(`[SINGLE TEST] Erro no teste individual: ${e.message}`, 'error');
    }
});

// Variável adicional para o controle de Pausa
let isPaused = false;

app.post('/api/stop', (req, res) => {
    if (!isRunning) {
        return res.status(400).json({ error: 'Nenhum processo em execução.' });
    }
    killSwitch = true;
    isPaused = false; // Tira do pause se estiver
    broadcastLog('[SISTEMA] Sinal de Parada Definitiva Recebido.', 'warning');
    res.json({ message: 'Sinal de parada enviado. O envio cessará no próximo passo.' });
});

app.post('/api/pause', (req, res) => {
    if (!isRunning) {
        return res.status(400).json({ error: 'Nenhum processo em execução para pausar.' });
    }
    isPaused = true;
    broadcastLog('[SISTEMA] ⏸️ Automação PAUSADA pelo usuário. Aguardando comando...', 'warning');
    res.json({ message: 'Sistema Pausado com sucesso.' });
});

app.post('/api/resume', (req, res) => {
    if (!isRunning || !isPaused) {
        return res.status(400).json({ error: 'Nenhum processo pausado para continuar.' });
    }
    isPaused = false;
    broadcastLog('[SISTEMA] ▶️ Automação RETOMADA.', 'success');
    res.json({ message: 'Sistema Retomado.' });
});

app.listen(PORT, () => {
    console.log(`Server Express(Backend Disparador) rodando na porta ${PORT} `);
});
