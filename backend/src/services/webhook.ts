import axios from 'axios';

// Variável de ambiente com o webhook do n8n que o Adriano vai configurar lá
const DISPATCH_WEBHOOK_URL = process.env.N8N_WEBHOOK_PROSPECT_URL || '';

export async function dispatchToN8n(companyName: string, city: string, imageBase64: string): Promise<boolean> {

    // Se não tiver webhook configurado, a gente loga mas não crasha.
    if (!DISPATCH_WEBHOOK_URL) {
        console.warn(`[Webhook n8n] N8N_WEBHOOK_PROSPECT_URL não está configurada no .env! O envio seria simulado.`);
        console.log(`[Webhook n8n] Dados que seriam enviados: Empresa=${companyName}, Cidade=${city}, Imagem (Base64 length=${imageBase64.length})`);
        return true;
    }

    console.log(`[Webhook n8n] Disparando POST para ${DISPATCH_WEBHOOK_URL}...`);

    try {
        const response = await axios.post(DISPATCH_WEBHOOK_URL, {
            companyName,
            city,
            screenshotBase64: imageBase64,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10s timeout
        });

        console.log(`[Webhook n8n] Sucesso! Payload entregue ao n8n HTTP Code:`, response.status);
        return true;
    } catch (error: any) {
        console.error(`[Webhook n8n] Falha catastrófica ao chamar o webhook do n8n:`, error?.message);
        return false;
    }
}
