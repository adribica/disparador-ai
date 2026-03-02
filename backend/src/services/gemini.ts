import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERRO: GEMINI_API_KEY não configurada no .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Recommended model for text generation tasks
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateMessageVariations(baseMessage: string): Promise<string[]> {
  const prompt = `
Você é um especialista em comunicação e marketing pelo WhatsApp. 
Vou te fornecer uma mensagem base. Sua tarefa é criar exatamente 5 variações diferentes dessa mensagem, 
mantendo a mesma intenção, o mesmo tom, mas alterando levemente as palavras e a estrutura da frase.
O objetivo é enviar mensagens que não sejam exatamente idênticas para evitar bloqueios de spam na plataforma.
As variações não devem ser muito maiores ou muito menores que a original. 

Mensagem Base:
"${baseMessage}"

Por favor, retorne APENAS um Array numérico (em formato JSON puro, sem crases \`\`\`json) contendo as 5 strings. Formato esperado:
[
  "Variação 1...",
  "Variação 2...",
  "Variação 3...",
  "Variação 4...",
  "Variação 5..."
]
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up potential markdown blocks if the AI ignores instructions
    if (text.startsWith('```json')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    const variations: string[] = JSON.parse(text);
    
    if (!Array.isArray(variations) || variations.length === 0) {
      throw new Error('A resposta do Gemini não retornou um array válido.');
    }

    return variations;
  } catch (error) {
    console.error('Erro ao gerar variações com o Gemini:', error);
    console.log('Utilizando apenas a mensagem base original para evitar falhas.');
    return [baseMessage];
  }
}
