import express from 'express';
import cors from 'cors';
import { generateMessageVariations } from './services/gemini';
import { sendTextMessage } from './services/evolution';
import { getRandomDelay, sleep } from './utils/delay';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Armazena o estado do sistema se estiver rodando
let isRunning = false;
let killSwitch = false;

// Rota de status do Backend
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', running: isRunning });
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
