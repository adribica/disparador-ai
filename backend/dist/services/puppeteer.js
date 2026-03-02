"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeScreenshot = takeScreenshot;
const puppeteer_1 = __importDefault(require("puppeteer"));
async function takeScreenshot(htmlFilePath, companyName) {
    console.log(`[Puppeteer] Iniciando captura de tela para: ${companyName}`);
    // Inicia o browser em modo Headless
    // Usando argumentos otimizados para evitar problemas de memória/sandbox
    const browser = await puppeteer_1.default.launch({
        headless: true, // ou 'new' dependendo da versão do puppeteer
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security', // Para carregar CSS/JS local ou externo sem bloqueio de CORS
            '--font-render-hinting=none' // Melhora a renderização de fontes
        ]
    });
    try {
        const page = await browser.newPage();
        // Define o viewport HD
        await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
        // Abre a página gerada pelo "Stitch"
        const fileUrl = `file://${htmlFilePath}`;
        console.log(`[Puppeteer] Abrindo página: ${fileUrl}`);
        // waitUntil: 'networkidle0' faz o puppeteer esperar a rede ficar inativa (imagens/CSS baixados)
        await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 30000 });
        // Gera a screenshot base64 formatada
        console.log(`[Puppeteer] Tirando o screenshot...`);
        // Oculta barras de rolagem
        await page.addStyleTag({ content: 'body{overflow: hidden !important;}' });
        const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 90,
            fullPage: false // Apenas a viewport 1920x1080 (acima da dobra)
        });
        // Converte o buffer do Array de UInt8Array/Buffer pro formato base64 que as APIs gostam
        const base64Image = Buffer.from(screenshotBuffer).toString('base64');
        console.log(`[Puppeteer] Sucesso. Screenshot convertida para base64.`);
        return `data:image/jpeg;base64,${base64Image}`;
    }
    catch (e) {
        console.error(`[Puppeteer] Falha na renderização:`, e);
        throw e;
    }
    finally {
        // SEMPRE fecha o browser para liberar recursos RAM/CPU
        await browser.close();
    }
}
