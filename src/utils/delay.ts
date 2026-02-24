import crypto from 'crypto';

/**
 * Retorna um tempo de delay aleatório entre minSeconds e maxSeconds.
 * Por padrão, mais de 60 segundos para evitar span (ex: 62 a 90 segundos)
 * @param minSeconds mínimo em segundos
 * @param maxSeconds máximo em segundos
 */
export function getRandomDelay(minSeconds: number = 62, maxSeconds: number = 90): number {
    if (minSeconds >= maxSeconds) {
        throw new Error('O tempo mínimo deve ser menor que o máximo.');
    }
    const minMs = minSeconds * 1000;
    const maxMs = maxSeconds * 1000;

    // Utiliza crypto randomInt para ser mais seguro que Math.random
    const randomMs = minMs + crypto.randomInt(maxMs - minMs + 1);
    return randomMs;
}

/**
 * Função utilitária para pausar a execução
 * @param ms Tempo em milissegundos
 */
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
