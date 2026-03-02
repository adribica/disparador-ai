"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gemini_1 = require("./services/gemini");
const evolution_1 = require("./services/evolution");
const fileHandler_1 = require("./utils/fileHandler");
const delay_1 = require("./utils/delay");
async function engine() {
    console.log('=== Iniciando Disparador AI ===\n');
    // Passo 1: Leitura da mensagem base e obtenção das variações via Gemini
    const baseMessage = (0, fileHandler_1.readBaseMessage)();
    if (!baseMessage) {
        console.error('ERRO: Mensagem base não foi fornecida em data/message.txt');
        process.exit(1);
    }
    console.log('1. Conectando API LLM (Gemini) e gerando 5 variações exclusivas da mensagem base...');
    const messageVariations = await (0, gemini_1.generateMessageVariations)(baseMessage);
    console.log(`Sucesso! ${messageVariations.length} variações geradas.`);
    // Imprimir amostras para auditoria visível
    messageVariations.forEach((v, index) => {
        console.log(`[VARIAÇÃO ${index + 1}]: ${v.substring(0, 50)}...`);
    });
    console.log('');
    // Passo 2: Recuperação da lista de contatos
    console.log('2. Lendo a base de números...');
    const numbers = (0, fileHandler_1.readNumbersList)();
    if (numbers.length === 0) {
        console.warn('AVISO: Lista de números vazia. Preencha data/numbers.txt e execute de novo.');
        process.exit(0);
    }
    console.log(`Carregados ${numbers.length} número(s) para disparo.\n`);
    // Passo 3: Iteração principal
    console.log('3. Iniciando Motor de Disparo... (Pressione Ctrl+C para abortar)\n');
    let successCount = 0;
    let failCount = 0;
    for (let i = 0; i < numbers.length; i++) {
        const currentNumber = numbers[i] ?? '';
        if (!currentNumber)
            continue;
        // Sortear uma variação aleatória de forma limpa
        const randomIndex = Math.floor(Math.random() * messageVariations.length);
        const selectedMessage = messageVariations[randomIndex] ?? baseMessage;
        console.log(`[${i + 1}/${numbers.length}] Disparando para ${currentNumber}...`);
        const wasSent = await (0, evolution_1.sendTextMessage)(currentNumber, selectedMessage);
        if (wasSent) {
            console.log(`  -> Sucesso [Variação ${randomIndex + 1}]`);
            successCount++;
        }
        else {
            console.log(`  -> Falhou! Registrando erro.`);
            (0, fileHandler_1.logError)(currentNumber, 'Falha de comunicação/retorno da Evolution API. Verifique token e número.');
            failCount++;
        }
        // Se NÃO for o último número da lista, pause de forma aleatória
        if (i < numbers.length - 1) {
            // Configurável para um tempo entre 61s e 95s
            const delayMs = (0, delay_1.getRandomDelay)(61, 95);
            const delaySeconds = (delayMs / 1000).toFixed(1);
            console.log(`  -> Aguardando cooldown de segurança: ${delaySeconds}s (Anti-Spam)...\n`);
            await (0, delay_1.sleep)(delayMs);
        }
    }
    // Passo 4: Fim da execução
    console.log('\n=== Resumo do Processo ===');
    console.log(`Total disparado: ${numbers.length}`);
    console.log(`Entregas com sucesso estimadas: ${successCount}`);
    console.log(`Falhas anotadas no arquivo logs/errors.log: ${failCount}`);
    console.log('Finalizado.');
}
// Inicia aplicação
engine().catch(error => {
    console.error('\nFalha crítica na execução do Engine Principal:', error);
    process.exit(1);
});
