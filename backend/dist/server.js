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
        // 1. Gera o site (Mock via Stitch API design instructions)
        const htmlFilePath = await (0, stitch_1.generateSiteWithStitch)(companyName, city);
        console.log(`[PROSPECT FLOW] Site gerado com sucesso: ${htmlFilePath}`);
        // 2. Tira Print HD da pagina gerada
        const screenshotBase64 = await (0, puppeteer_1.takeScreenshot)(htmlFilePath, companyName);
        console.log(`[PROSPECT FLOW] Screenshot capturado (${Math.round(screenshotBase64.length / 1024)} KB).`);
        // 3. Dispara as informações finais (Webhook pro n8n/evolution api)
        const dispatchSuccess = await (0, webhook_1.dispatchToN8n)(companyName, city, screenshotBase64);
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
app.post('/api/stop', (req, res) => {
    if (!isRunning) {
        return res.status(400).json({ error: 'Nenhum processo em execução.' });
    }
    killSwitch = true;
    res.json({ message: 'Sinal de parada enviado. O envio cessará no próximo ciclo.' });
});
app.listen(PORT, () => {
    console.log(`Server Express (Backend Disparador) rodando na porta ${PORT}`);
});
