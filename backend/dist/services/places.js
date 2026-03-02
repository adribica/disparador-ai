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
exports.enrichCompanyData = enrichCompanyData;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GEMINI_API_KEY; // Often the same GCP project key works for both if enabled
async function enrichCompanyData(companyName, city) {
    console.log(`[Google Places] Buscando dados reais para: ${companyName} em ${city}...`);
    // Fallback/Mocked data if no API_KEY is set or request fails
    let enriched = {
        name: companyName,
        formattedAddress: city,
        website: null,
        rating: 4.8,
        types: ['business', 'software'],
        primaryColor: '#0066cc', // Apple blue fallback
        iconUrl: null
    };
    if (!GOOGLE_PLACES_API_KEY) {
        console.warn(`[Google Places] Sem GOOGLE_PLACES_API_KEY configurada. Usando dados fictícios para ${companyName}.`);
        return enriched;
    }
    try {
        const query = encodeURIComponent(`${companyName} ${city}`);
        // Endpoint Text Search (New)
        const response = await axios_1.default.post('https://places.googleapis.com/v1/places:searchText', {
            textQuery: query,
            languageCode: "pt-BR"
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.types,places.iconMaskBaseUri'
            },
            timeout: 8000
        });
        const place = response.data.places?.[0];
        if (place) {
            console.log(`[Google Places] Encontrado! Nicho: ${place.types?.[0]}`);
            // Map types to a nice looking color generically
            let brandColor = '#0066cc'; // Default Blue
            const category = place.types?.[0]?.toLowerCase() || '';
            if (category.includes('restaurant') || category.includes('food'))
                brandColor = '#EF4444'; // Red
            if (category.includes('health') || category.includes('doctor'))
                brandColor = '#10B981'; // Green
            if (category.includes('store') || category.includes('shop'))
                brandColor = '#F59E0B'; // Orange
            if (category.includes('real_estate'))
                brandColor = '#0F172A'; // Slate
            enriched = {
                name: place.displayName?.text || companyName,
                formattedAddress: place.formattedAddress || city,
                website: place.websiteUri || null,
                rating: place.rating || 5.0,
                types: place.types || ['business'],
                primaryColor: brandColor,
                iconUrl: place.iconMaskBaseUri ? `${place.iconMaskBaseUri}.svg` : null
            };
        }
        else {
            console.warn(`[Google Places] Nenhum estabelecimento encontrado para "${companyName}" em "${city}".`);
        }
    }
    catch (error) {
        console.error(`[Google Places] Falha na API. Mensagem: ${error?.response?.data?.error?.message || error.message}`);
    }
    return enriched;
}
