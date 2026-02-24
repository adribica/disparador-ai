import axios, { AxiosError } from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const apiURL = process.env.EVOLUTION_API_URL?.replace(/\/$/, ''); // Remove trailing slash
const apiKey = process.env.EVOLUTION_API_KEY;
const instanceName = process.env.EVOLUTION_INSTANCE_NAME;

// Helper variables
let isConfigured = true;
if (!apiURL || !apiKey || !instanceName) {
    console.warn('AVISO: Credenciais da Evolution API não estão totalmente configuradas no .env');
    isConfigured = false;
}

/**
 * Envia uma mensagem de texto usando a Evolution API v2.
 * Endpoint padrão: /message/sendText/{instanceName}
 * @param number O número de telefone no formato internacional.
 * @param text O texto da mensagem a ser enviada.
 * @param delay Opcional - tempo de simulação de digitação em milissegundos
 */
export async function sendTextMessage(number: string, text: string, delay: number = 1000): Promise<boolean> {
    if (!isConfigured) {
        console.error('Falha no envio: Evolution API não configurada.');
        return false;
    }

    const cleanNumber = number.replace(/\D/g, ''); // Garante apenas dígitos
    const endpoint = `${apiURL}/message/sendText/${instanceName}`;

    try {
        const response = await axios.post(
            endpoint,
            {
                number: cleanNumber,
                text: text,
                delay: delay,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                },
                timeout: 20000, // 20 segundos de timeout
            }
        );

        // Evolution API geralmente retorna sucesso com status 200/201
        if (response.status === 200 || response.status === 201) {
            console.log(`[EVOLUTION API] Mensagem enviada com sucesso para +${cleanNumber}`);
            return true;
        } else {
            console.warn(`[EVOLUTION API] Retorno inesperado: ${response.status}`, response.data);
            return false;
        }
    } catch (error) {
        // Tratar o erro de forma mais segura sem quebrar o loop principal
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`[EVOLUTION API] Erro no envio para +${cleanNumber}:`, axiosError.response?.data || axiosError.message);
        } else {
            console.error(`[EVOLUTION API] Erro desconhecido no envio para +${cleanNumber}:`, error);
        }
        return false;
    }
}
