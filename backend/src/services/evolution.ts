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

/**
 * Envia uma mensagem de mídia (Imagem Base64) usando a Evolution API v2.
 * Endpoint padrão: /message/sendMedia/{instanceName}
 * @param number O número de telefone no formato internacional.
 * @param base64 O arquivo em formato base64 nativo.
 * @param caption Texto que vai junto com a imagem (opcional).
 */
export async function sendMediaMessage(number: string, base64: string, caption: string = ''): Promise<boolean> {
    if (!isConfigured) {
        console.error('Falha no envio de mídia: Evolution API não configurada.');
        return false;
    }

    const cleanNumber = number.replace(/\D/g, ''); // Garante apenas dígitos
    const endpoint = `${apiURL}/message/sendMedia/${instanceName}`;

    // A Evolution API geralmente pede base64 puro ou mimetype. Vamos garantir que o formato está aceito.
    // O Puppeteer gera base64 puro (sem o cabeçalho data:image/png;base64,).
    // Precisa ter o cabeçalho se a API demandar, ou apenas definir mimetype abaixo.

    // Tratativa para o mimetype se o base64 vier purinho
    let finalBase64 = base64;
    if (!base64.startsWith('data:')) {
        finalBase64 = `data:image/png;base64,${base64}`;
    }

    try {
        const response = await axios.post(
            endpoint,
            {
                number: cleanNumber,
                mediaMessage: {
                    mediatype: "image",
                    caption: caption,
                    media: finalBase64 // ou filename com formato URL/Base64 dependendo da versão da evo.
                },
                options: {
                    delay: 2000 // Atraso de simulação
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': apiKey,
                },
                timeout: 30000, // 30 segundos (upload de base64 pode ser pesado)
            }
        );

        if (response.status === 200 || response.status === 201) {
            console.log(`[EVOLUTION API] Mídia enviada com sucesso para +${cleanNumber}`);
            return true;
        } else {
            console.warn(`[EVOLUTION API] Retorno inesperado na mídia: ${response.status}`, response.data);
            return false;
        }
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;
            console.error(`[EVOLUTION API] Erro no envio de mídia para +${cleanNumber}:`, axiosError.response?.data || axiosError.message);
        } else {
            console.error(`[EVOLUTION API] Erro desconhecido no envio de mídia para +${cleanNumber}:`, error);
        }
        return false;
    }
}
