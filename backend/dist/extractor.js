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
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
dotenv.config();
const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const askQuestion = (query) => {
    return new Promise(resolve => rl.question(query, resolve));
};
// Delay simples para evitar exceder rate limits das APIs baseadas num loop
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function runExtractor() {
    console.log('=== Extrator de Leads (Google Maps) ===\n');
    if (!GOOGLE_API_KEY) {
        console.error('ERRO: A chave GOOGLE_PLACES_API_KEY não foi encontrada no arquivo .env.');
        console.log('Você precisa gerar uma chave no Google Cloud Console com acesso à Places API.');
        process.exit(1);
    }
    const niche = await askQuestion('Digite o nicho da empresa (ex: Pizzaria, Mecânica, Advogado): ');
    const city = await askQuestion('Digite a cidade (ex: São Paulo - SP, Curitiba): ');
    rl.close();
    const searchQuery = `${niche} em ${city}`;
    console.log(`\nBuscando por: "${searchQuery}"...\n`);
    try {
        // 1. Text Search API para buscar locais
        const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_API_KEY}`;
        const searchResponse = await axios_1.default.get(textSearchUrl);
        const results = searchResponse.data.results;
        if (!results || results.length === 0) {
            console.log('Nenhuma empresa encontrada para essa busca.');
            return;
        }
        console.log(`Encontradas ${results.length} empresas. Extraindo dados (isso pode levar alguns segundos)...\n`);
        const extractedLeads = [];
        const validPhones = [];
        // 2. Para cada local, buscar detalhes (telefone) usando o Place ID
        for (let i = 0; i < results.length; i++) {
            const place = results[i];
            const placeId = place.place_id;
            // Log para mostrar o progresso
            process.stdout.write(`Obtendo detalhes de [${place.name}]... `);
            // Chamada à API de detalhes
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,international_phone_number,formatted_phone_number&key=${GOOGLE_API_KEY}`;
            const detailsResponse = await axios_1.default.get(detailsUrl);
            const details = detailsResponse.data.result;
            // Priorizar o número internacional (geralmente formatado com +55)
            const phone = details?.international_phone_number || details?.formatted_phone_number || '';
            if (phone) {
                console.log(`Telefone encontrado: ${phone}`);
                // Sanitiza para o formato do Disparador AI (somente números com o + e sem espaços)
                const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
                extractedLeads.push({
                    name: details.name,
                    phone: cleanPhone
                });
                validPhones.push(cleanPhone);
            }
            else {
                console.log('Sem número de telefone público.');
            }
            // Delay para evitar Rate Limits da API do Google (Place Details)
            await sleep(500);
        }
        console.log(`\n=== Extração Concluída ===\n`);
        console.log(`Total de empresas processadas: ${results.length}`);
        console.log(`Total de telefones válidos recuperados: ${validPhones.length}`);
        // Nota sobre CNPJ conforme restrição da plataforma do Google GMB
        console.log(`\n[NOTA]: O Google Maps não retorna CNPJs de forma nativa por motivos de privacidade. Apenas Nome, Endereço, e Telefone são fornecidos.\n`);
        if (validPhones.length > 0) {
            // Salvar em CSV estruturado
            const dataFolder = path.join(process.cwd(), 'data');
            if (!fs.existsSync(dataFolder)) {
                fs.mkdirSync(dataFolder);
            }
            const csvPath = path.join(dataFolder, 'extracted_leads.csv');
            const csvContent = ['Nome;Telefone'];
            extractedLeads.forEach(lead => {
                csvContent.push(`"${lead.name}";${lead.phone}`);
            });
            fs.writeFileSync(csvPath, csvContent.join('\n'));
            console.log(`=> Leads salvos com sucesso em: data/extracted_leads.csv`);
            // Anexar contatos válidos à lista de contatos do Disparador
            const numbersTxtPath = path.join(dataFolder, 'numbers.txt');
            const currentNumbers = fs.existsSync(numbersTxtPath) ? fs.readFileSync(numbersTxtPath, 'utf8') : '';
            const newNumbers = validPhones.filter(phone => !currentNumbers.includes(phone)).join('\n');
            if (newNumbers) {
                // Opcionalmente auto-alimentar a lista
                fs.appendFileSync(numbersTxtPath, '\n' + newNumbers + '\n');
                console.log(`=> Novos números foram adicionados automaticamente ao arquivo data/numbers.txt para disparo.`);
            }
            else {
                console.log(`=> Todos os números já existiam em data/numbers.txt.`);
            }
        }
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error('Erro de requisição ao Google Places:', error.response?.data || error.message);
        }
        else {
            console.error('Um erro desconhecido ocorreu:', error);
        }
    }
}
runExtractor();
