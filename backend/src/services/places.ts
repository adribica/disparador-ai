import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || process.env.GEMINI_API_KEY; // Often the same GCP project key works for both if enabled

export interface CompanyEnrichedData {
    name: string;
    formattedAddress: string;
    website: string | null;
    rating: number | null;
    types: string[];      // Categoria, nicho (ex: restaurant, dentist)
    primaryColor: string; // Vai pro CSS final do Stitch
    iconUrl: string | null;
}

export async function enrichCompanyData(companyName: string, city: string): Promise<CompanyEnrichedData> {
    console.log(`[Google Places] Buscando dados reais para: ${companyName} em ${city}...`);

    // Fallback/Mocked data if no API_KEY is set or request fails
    let enriched: CompanyEnrichedData = {
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
        const response = await axios.post(
            'https://places.googleapis.com/v1/places:searchText',
            {
                textQuery: query,
                languageCode: "pt-BR"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.websiteUri,places.rating,places.types,places.iconMaskBaseUri'
                },
                timeout: 8000
            }
        );

        const place = response.data.places?.[0];

        if (place) {
            console.log(`[Google Places] Encontrado! Nicho: ${place.types?.[0]}`);

            // Map types to a nice looking color generically
            let brandColor = '#0066cc'; // Default Blue
            const category = place.types?.[0]?.toLowerCase() || '';

            if (category.includes('restaurant') || category.includes('food')) brandColor = '#EF4444'; // Red
            if (category.includes('health') || category.includes('doctor')) brandColor = '#10B981'; // Green
            if (category.includes('store') || category.includes('shop')) brandColor = '#F59E0B'; // Orange
            if (category.includes('real_estate')) brandColor = '#0F172A'; // Slate

            enriched = {
                name: place.displayName?.text || companyName,
                formattedAddress: place.formattedAddress || city,
                website: place.websiteUri || null,
                rating: place.rating || 5.0,
                types: place.types || ['business'],
                primaryColor: brandColor,
                iconUrl: place.iconMaskBaseUri ? `${place.iconMaskBaseUri}.svg` : null
            };
        } else {
            console.warn(`[Google Places] Nenhum estabelecimento encontrado para "${companyName}" em "${city}".`);
        }
    } catch (error: any) {
        console.error(`[Google Places] Falha na API. Mensagem: ${error?.response?.data?.error?.message || error.message}`);
    }

    return enriched;
}
