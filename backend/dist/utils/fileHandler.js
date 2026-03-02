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
exports.readNumbersList = readNumbersList;
exports.readBaseMessage = readBaseMessage;
exports.logError = logError;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * Lê o arquivo `data/numbers.txt` e retorna um array de strings
 */
function readNumbersList() {
    const filePath = path.join(process.cwd(), 'data', 'numbers.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const numbers = data.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        return numbers;
    }
    catch (error) {
        console.error(`Falha ao ler o arquivo de números em ${filePath}:`, error);
        return [];
    }
}
/**
 * Lê a mensagem base do arquivo `data/message.txt`
 */
function readBaseMessage() {
    const filePath = path.join(process.cwd(), 'data', 'message.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.trim();
    }
    catch (error) {
        console.error(`Falha ao ler o arquivo de mensagem base em ${filePath}:`, error);
        return '';
    }
}
/**
 * Registra um erro no arquivo `logs/errors.log`
 */
function logError(number, reason) {
    const filePath = path.join(process.cwd(), 'logs', 'errors.log');
    const now = new Date().toISOString();
    const logLine = `[${now}] Falha no número ${number} - Motivo: ${reason}\n`;
    try {
        // Garante que o folder logs exista
        const logsDir = path.dirname(filePath);
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        fs.appendFileSync(filePath, logLine);
    }
    catch (err) {
        console.error('Falha ao escrever no log de erros:', err);
    }
}
