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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTextMessage = sendTextMessage;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
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
async function sendTextMessage(number, text, delay = 1000) {
    if (!isConfigured) {
        console.error('Falha no envio: Evolution API não configurada.');
        return false;
    }
    const cleanNumber = number.replace(/\D/g, ''); // Garante apenas dígitos
    const endpoint = `${apiURL}/message/sendText/${instanceName}`;
    try {
        const response = await axios_1.default.post(endpoint, {
            number: cleanNumber,
            text: text,
            delay: delay,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
            },
            timeout: 20000, // 20 segundos de timeout
        });
        // Evolution API geralmente retorna sucesso com status 200/201
        if (response.status === 200 || response.status === 201) {
            console.log(`[EVOLUTION API] Mensagem enviada com sucesso para +${cleanNumber}`);
            return true;
        }
        else {
            console.warn(`[EVOLUTION API] Retorno inesperado: ${response.status}`, response.data);
            return false;
        }
    }
    catch (error) {
        // Tratar o erro de forma mais segura sem quebrar o loop principal
        if (axios_1.default.isAxiosError(error)) {
            const axiosError = error;
            console.error(`[EVOLUTION API] Erro no envio para +${cleanNumber}:`, axiosError.response?.data || axiosError.message);
        }
        else {
            console.error(`[EVOLUTION API] Erro desconhecido no envio para +${cleanNumber}:`, error);
        }
        return false;
    }
}
