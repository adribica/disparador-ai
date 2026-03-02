"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
exports.getRandomDelay = getRandomDelay;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Retorna um tempo de delay aleatório entre minSeconds e maxSeconds.
 * Por padrão, mais de 60 segundos para evitar span (ex: 62 a 90 segundos)
 * @param minSeconds mínimo em segundos
 * @param maxSeconds máximo em segundos
 */
function getRandomDelay(minSeconds = 62, maxSeconds = 90) {
    if (minSeconds >= maxSeconds) {
        throw new Error('O tempo mínimo deve ser menor que o máximo.');
    }
    const minMs = minSeconds * 1000;
    const maxMs = maxSeconds * 1000;
    // Utiliza crypto randomInt para ser mais seguro que Math.random
    const randomMs = minMs + crypto_1.default.randomInt(maxMs - minMs + 1);
    return randomMs;
}
/**
 * Função utilitária para pausar a execução
 * @param ms Tempo em milissegundos
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
