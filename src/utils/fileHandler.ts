import * as fs from 'fs';
import * as path from 'path';

/**
 * Lê o arquivo `data/numbers.txt` e retorna um array de strings
 */
export function readNumbersList(): string[] {
    const filePath = path.join(process.cwd(), 'data', 'numbers.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        const numbers = data.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        return numbers;
    } catch (error) {
        console.error(`Falha ao ler o arquivo de números em ${filePath}:`, error);
        return [];
    }
}

/**
 * Lê a mensagem base do arquivo `data/message.txt`
 */
export function readBaseMessage(): string {
    const filePath = path.join(process.cwd(), 'data', 'message.txt');
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return data.trim();
    } catch (error) {
        console.error(`Falha ao ler o arquivo de mensagem base em ${filePath}:`, error);
        return '';
    }
}

/**
 * Registra um erro no arquivo `logs/errors.log`
 */
export function logError(number: string, reason: string): void {
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
    } catch (err) {
        console.error('Falha ao escrever no log de erros:', err);
    }
}
