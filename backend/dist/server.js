"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gemini_1 = require("./services/gemini");
const evolution_1 = require("./services/evolution");
const delay_1 = require("./utils/delay");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Armazena o estado do sistema se estiver rodando
let isRunning = false;
let killSwitch = false;
// Rota de status do Backend
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', running: isRunning });
});
// Importando serviços da automação de prospecção (Stitch + Puppeteer)
const places_1 = require("./services/places");
const stitch_1 = require("./services/stitch");
const puppeteer_1 = require("./services/puppeteer");
const webhook_1 = require("./services/webhook");
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
        const companyData = await (0, places_1.enrichCompanyData)(companyName, city);
        console.log(`[PROSPECT FLOW] Dados enriquecidos: nicho ${companyData.types[0]}, cor ${companyData.primaryColor}`);
        // 1. Gera o site (Mock via Stitch API design instructions usando os dados extraídos)
        const htmlFilePath = await (0, stitch_1.generateSiteWithStitch)(companyData.name, city, companyData.primaryColor, companyData.types[0]);
        console.log(`[PROSPECT FLOW] Site gerado com sucesso: ${htmlFilePath}`);
        // 2. Tira Print HD da pagina gerada
        const screenshotBase64 = await (0, puppeteer_1.takeScreenshot)(htmlFilePath, companyData.name);
        console.log(`[PROSPECT FLOW] Screenshot capturado (${Math.round(screenshotBase64.length / 1024)} KB).`);
        // 3. Dispara as informações finais (Webhook pro n8n/evolution api)
        const dispatchSuccess = await (0, webhook_1.dispatchToN8n)(companyData.name, city, screenshotBase64);
        if (dispatchSuccess) {
            console.log(`[PROSPECT FLOW] Sucesso final! Lead orquestrado e enviado para vendas.`);
        }
        else {
            console.warn(`[PROSPECT FLOW] Falha no disparo final (n8n).`);
        }
        console.log(`======================================================\n`);
    }
    catch (e) {
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
        const messageVariations = await (0, gemini_1.generateMessageVariations)(baseMessage);
        console.log(`[API] ${messageVariations.length} variações geradas.`);
        let successCount = 0;
        let failCount = 0;
        for (let i = 0; i < numbers.length; i++) {
            if (killSwitch) {
                console.log('[API] Processo interrompido pelo usuário.');
                break;
            }
            const currentNumber = String(numbers[i] ?? '');
            if (!currentNumber)
                continue;
            const randomIndex = Math.floor(Math.random() * messageVariations.length);
            const selectedMessage = messageVariations[randomIndex] ?? baseMessage;
            console.log(`[API ${i + 1}/${numbers.length}] Disparando para ${currentNumber}...`);
            const wasSent = await (0, evolution_1.sendTextMessage)(currentNumber, selectedMessage);
            if (wasSent) {
                successCount++;
            }
            else {
                failCount++;
            }
            if (i < numbers.length - 1 && !killSwitch) {
                const delayMs = (0, delay_1.getRandomDelay)(61, 95);
                console.log(`[API] Aguardando cooldown: ${(delayMs / 1000).toFixed(1)}s`);
                await (0, delay_1.sleep)(delayMs);
            }
        }
        console.log(`[API] Fim do Processo. Sucesso: ${successCount} | Falhas: ${failCount}`);
    }
    catch (e) {
        console.error('[API] Erro interno:', e);
    }
    finally {
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
        console.log(`\n======================================================`);
        console.log(`[BULK PROSPECT] Iniciando automação para ${leads.length} leads...`);
        console.log(`[BULK PROSPECT] Rotacionando copy base no Gemini...`);
        const messageVariations = await (0, gemini_1.generateMessageVariations)(baseMessage);
        for (let i = 0; i < leads.length; i++) {
            if (killSwitch) {
                console.log('[BULK PROSPECT] Processo interrompido pelo usuário.');
                break;
            }
            const lead = leads[i];
            const { companyName, city, number } = lead;
            if (!companyName || !city || !number) {
                console.warn(`[BULK PROSPECT] Pulando lead inválido index ${i}`);
                continue;
            }
            console.log(`\n--- Processando lead ${i + 1}/${leads.length}: ${companyName} (${city}) ---`);
            // 1. Google Places
            const companyData = await (0, places_1.enrichCompanyData)(companyName, city);
            // 2. Stitch MCP
            const htmlFilePath = await (0, stitch_1.generateSiteWithStitch)(companyData.name, city, companyData.primaryColor, companyData.types[0]);
            // 3. Puppeteer
            const screenshotBase64 = await (0, puppeteer_1.takeScreenshot)(htmlFilePath, companyData.name);
            console.log(`[BULK PROSPECT] Screenshot OK.`);
            // 4. Disparo (Evolution API) - Primeiro a Mídia, depois o Texto
            const caption = `Confira a demonstração que criamos para *${companyData.name}*!`;
            console.log(`[BULK PROSPECT] Enviando imagem via Evolution API...`);
            const mediaSent = await (0, evolution_1.sendMediaMessage)(number, screenshotBase64, caption);
            if (mediaSent) {
                // Seleciona texto rotacionado pro follow up
                const randomIndex = Math.floor(Math.random() * messageVariations.length);
                const textFollowUp = messageVariations[randomIndex] ?? baseMessage;
                console.log(`[BULK PROSPECT] Aguardando 3s antes do texto rotacional...`);
                await (0, delay_1.sleep)(3000);
                await (0, evolution_1.sendTextMessage)(number, textFollowUp);
                console.log(`[BULK PROSPECT] Fluxo de mensagem OK para +${number}`);
            }
            else {
                console.log(`[BULK PROSPECT] Mídia falhou para +${number}, pulando texto.`);
            }
            // 5. Anti-Ban Seguro (se não for o último)
            if (i < leads.length - 1 && !killSwitch) {
                // Aumentando delay pois manda site (pode ser visto como spam mais pesado se repetido mto rapido)
                const delayMs = (0, delay_1.getRandomDelay)(45, 85);
                console.log(`[BULK PROSPECT] Aguardando cooldown de anti-ban: ${(delayMs / 1000).toFixed(1)}s`);
                await (0, delay_1.sleep)(delayMs);
            }
        }
        console.log(`[BULK PROSPECT] Processo Finalizado.`);
        console.log(`======================================================\n`);
    }
    catch (e) {
        console.error('[BULK PROSPECT] Erro interno:', e);
    }
    finally {
        isRunning = false;
    }
});
app.post('/api/stop', (req, res) => {
    if (!isRunning) {
        return res.status(400).json({ error: 'Nenhum processo em execução.' });
    }
    killSwitch = true;
    res.json({ message: 'Sinal de parada enviado. O envio cessará no próximo ciclo.' });
});
app.listen(PORT, () => {
    console.log(`Server Express(Backend Disparador) rodando na porta ${PORT} `);
});
