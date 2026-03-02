"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMessageVariations = generateMessageVariations;
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('ERRO: GEMINI_API_KEY não configurada no .env');
    process.exit(1);
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
// Recommended model for text generation tasks
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
async function generateMessageVariations(baseMessage) {
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
        }
        else if (text.startsWith('```')) {
            text = text.replace(/```/g, '').trim();
        }
        const variations = JSON.parse(text);
        if (!Array.isArray(variations) || variations.length === 0) {
            throw new Error('A resposta do Gemini não retornou um array válido.');
        }
        return variations;
    }
    catch (error) {
        console.error('Erro ao gerar variações com o Gemini:', error);
        console.log('Utilizando apenas a mensagem base original para evitar falhas.');
        return [baseMessage];
    }
}
