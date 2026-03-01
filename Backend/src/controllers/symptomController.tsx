import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { Herb } from '../models/Herb';
import { Product } from '../models/Product';
import { env } from '../config/env';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

// ── Symptom → herb property keyword map ──────────────────────────────────────
//  Each symptom maps to weighted herb fields to score against
const SYMPTOM_MAP: Record<string, { keywords: string[]; doshaImbalance: string }> = {
    stress: { keywords: ['stress', 'anxiety', 'calming', 'nervine', 'adaptogen', 'mind', 'cortisol'], doshaImbalance: 'Vata' },
    anxiety: { keywords: ['anxiety', 'stress', 'calming', 'sedative', 'nervine', 'mind'], doshaImbalance: 'Vata' },
    insomnia: { keywords: ['sleep', 'insomnia', 'sedative', 'calming', 'rest', 'nervine'], doshaImbalance: 'Vata' },
    fatigue: { keywords: ['fatigue', 'energy', 'strength', 'vitality', 'tonic', 'adaptogen'], doshaImbalance: 'Vata' },
    headache: { keywords: ['headache', 'migraine', 'pain', 'inflammation', 'cooling'], doshaImbalance: 'Pitta' },
    fever: { keywords: ['fever', 'antipyretic', 'cooling', 'anti-inflammatory', 'infection'], doshaImbalance: 'Pitta' },
    inflammation: { keywords: ['inflammation', 'anti-inflammatory', 'pain', 'swelling', 'arthritis'], doshaImbalance: 'Pitta' },
    acne: { keywords: ['skin', 'acne', 'blood purifier', 'detox', 'anti-bacterial', 'pitta'], doshaImbalance: 'Pitta' },
    digestion: { keywords: ['digestion', 'digestive', 'gut', 'stomach', 'constipation', 'bowel', 'gastric'], doshaImbalance: 'Kapha' },
    cough: { keywords: ['cough', 'respiratory', 'bronchial', 'expectorant', 'lung', 'throat'], doshaImbalance: 'Kapha' },
    cold: { keywords: ['cold', 'immunity', 'anti-viral', 'respiratory', 'mucus', 'nasal'], doshaImbalance: 'Kapha' },
    immunity: { keywords: ['immunity', 'immune', 'anti-viral', 'anti-bacterial', 'infection', 'resistance'], doshaImbalance: 'Kapha' },
    'joint pain': { keywords: ['joint', 'arthritis', 'pain', 'anti-inflammatory', 'rheumatic', 'vata'], doshaImbalance: 'Vata' },
    'hair loss': { keywords: ['hair', 'scalp', 'alopecia', 'nourish', 'follicle', 'rejuvenate'], doshaImbalance: 'Pitta' },
    'weight gain': { keywords: ['weight', 'obesity', 'metabolism', 'fat', 'digestive', 'detox'], doshaImbalance: 'Kapha' },
    diabetes: { keywords: ['diabetes', 'blood sugar', 'hypoglycemic', 'glucose', 'insulin', 'pancreas'], doshaImbalance: 'Kapha' },
    cholesterol: { keywords: ['cholesterol', 'lipid', 'heart', 'cardiovascular', 'fat', 'liver'], doshaImbalance: 'Kapha' },
    memory: { keywords: ['memory', 'cognitive', 'brain', 'focus', 'nootropic', 'concentration'], doshaImbalance: 'Vata' },
    constipation: { keywords: ['constipation', 'laxative', 'bowel', 'digestive', 'stool', 'gut'], doshaImbalance: 'Vata' },
    liver: { keywords: ['liver', 'hepato', 'detox', 'hepatitis', 'bile', 'jaundice'], doshaImbalance: 'Pitta' },
};

// ── Score a single herb against detected symptoms ─────────────────────────────
function scoreHerb(herb: any, detectedSymptoms: string[]): number {
    let score = 0;
    const herbText = [
        herb.name,
        herb.description,
        ...(herb.benefits || []),
        ...(herb.uses || []),
        ...(herb.indications || []),
        ...(herb.category || []),
    ].join(' ').toLowerCase();

    for (const symptom of detectedSymptoms) {
        const mapping = SYMPTOM_MAP[symptom];
        if (!mapping) continue;

        for (const keyword of mapping.keywords) {
            if (herbText.includes(keyword.toLowerCase())) {
                score += 2; // +2 per matching keyword
            }
        }

        // Bonus: dosha alignment
        if (herb.dosha?.some((d: string) => d.toLowerCase().includes(mapping.doshaImbalance.toLowerCase()))) {
            score += 3;
        }
    }

    // Penalty: contraindications warning match
    const contraText = (herb.contraindications || []).join(' ').toLowerCase();
    if (contraText.length > 10) score -= 1; // slight penalty if many contraindications

    return score;
}

// ── Detect symptoms from free-text input ──────────────────────────────────────
function detectSymptoms(input: string): string[] {
    const lower = input.toLowerCase();
    const detected: string[] = [];
    for (const symptom of Object.keys(SYMPTOM_MAP)) {
        if (lower.includes(symptom)) detected.push(symptom);
    }
    return detected;
}

// ── Determine Dosha imbalance from detected symptoms ──────────────────────────
function detectDoshaImbalance(symptoms: string[]): { dosha: string; count: Record<string, number> } {
    const count: Record<string, number> = { Vata: 0, Pitta: 0, Kapha: 0 };
    for (const s of symptoms) {
        const d = SYMPTOM_MAP[s]?.doshaImbalance;
        if (d) count[d]++;
    }
    const dominant = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
    return { dosha: dominant, count };
}

export const symptomController = {
    /**
     * POST /api/symptoms/analyze
     * Body: { symptoms: string, language?: string }
     * Returns: scored herbs + dosha analysis + AI explanation
     */
    async analyze(req: Request, res: Response): Promise<void> {
        try {
            const { symptoms: input, language = 'en' } = req.body;

            if (!input?.trim()) {
                res.status(400).json({ message: 'Please describe your symptoms.' });
                return;
            }

            // 1. Detect symptoms from text
            const detectedSymptoms = detectSymptoms(input.trim());

            // 2. Fetch all herbs from DB
            const allHerbs = await Herb.find()
                .select('name sanskritName description benefits uses indications contraindications precautions dosage dosageForms category dosha taste energy researchBadge activeCompounds pubmedLinks image');

            // 3. Find linked products for add-to-cart support
            const products = await Product.find().select('name price image _id category stock');

            // 4. Score and rank herbs
            const scored = allHerbs
                .map(herb => ({
                    herb,
                    score: scoreHerb(herb, detectedSymptoms.length > 0 ? detectedSymptoms : [input.toLowerCase()]),
                }))
                .filter(h => h.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 6); // top 6

            // If no DB herbs found, try generic AI fallback
            if (scored.length === 0) {
                // Return AI-only response
                const fallbackPrompt = `The user reports: "${input}". 
As an Ayurvedic expert, suggest 3 herbs for these symptoms. 
For each herb give: name, why it helps, key benefits, and normal dosage. Keep it to 200 words. Language: ${language}.`;

                let aiSuggestion = '';
                if (env.GROQ_API_KEY) {
                    const completion = await groq.chat.completions.create({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: 'You are an expert Ayurvedic practitioner. Always recommend consulting a doctor for serious conditions.' },
                            { role: 'user', content: fallbackPrompt },
                        ],
                        max_tokens: 400,
                        temperature: 0.6,
                    });
                    aiSuggestion = completion.choices[0]?.message?.content || '';
                }

                res.status(200).json({
                    detectedSymptoms: [],
                    doshaAnalysis: { dosha: 'Unknown', count: { Vata: 0, Pitta: 0, Kapha: 0 } },
                    results: [],
                    aiExplanation: aiSuggestion,
                    fallback: true,
                });
                return;
            }

            // 5. Dosha analysis
            const doshaAnalysis = detectDoshaImbalance(detectedSymptoms);

            // 6. Build result list with matched product links
            const results = scored.map(({ herb, score }) => {
                const matchedProduct = products.find(p =>
                    p.name.toLowerCase().includes(herb.name.split(' ')[0].toLowerCase()) ||
                    herb.name.toLowerCase().includes(p.name.split(' ')[0].toLowerCase())
                );

                // Safety flag
                const safetyFlags: string[] = [];
                if (herb.contraindications?.length > 0) safetyFlags.push('Has contraindications — read label before use');
                if (herb.precautions?.length > 0) safetyFlags.push('Note precautions — consult a practitioner');

                return {
                    herb: {
                        _id: herb._id,
                        name: herb.name,
                        sanskritName: herb.sanskritName,
                        description: herb.description,
                        benefits: herb.benefits?.slice(0, 3),
                        dosage: herb.dosage,
                        dosageForms: herb.dosageForms?.slice(0, 2),
                        category: herb.category,
                        dosha: herb.dosha,
                        image: herb.image,
                        researchBadge: (herb as any).researchBadge || false,
                        activeCompounds: (herb as any).activeCompounds || [],
                        pubmedLinks: (herb as any).pubmedLinks || [],
                    },
                    score,
                    matchScore: Math.min(100, score * 10), // percentage-style confidence
                    safetyFlags,
                    product: matchedProduct ? {
                        _id: matchedProduct._id,
                        name: matchedProduct.name,
                        price: matchedProduct.price,
                        image: matchedProduct.image,
                        inStock: matchedProduct.stock > 0,
                    } : null,
                };
            });

            // 7. AI explanation using Groq
            let aiExplanation = '';
            if (env.GROQ_API_KEY && results.length > 0) {
                const topHerbs = results.slice(0, 3).map(r => r.herb.name).join(', ');
                const prompt = `User symptoms: "${input}"
Detected Ayurvedic imbalance: ${doshaAnalysis.dosha} dosha vitiation
Top recommended herbs from our database: ${topHerbs}

In 2-3 short paragraphs:
1. Briefly explain the Ayurvedic view of these symptoms
2. Why these herbs help
3. General lifestyle advice

Keep under 180 words. ${language !== 'en' ? `Respond in ${language === 'te' ? 'Telugu' : language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : language === 'ml' ? 'Malayalam' : 'English'}.` : ''}
Always end with: "Please consult an Ayurvedic practitioner for personalized advice."`;

                try {
                    const completion = await groq.chat.completions.create({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: 'You are an expert Ayurvedic health advisor. Be concise, empathetic, and always recommend professional consultation.' },
                            { role: 'user', content: prompt },
                        ],
                        max_tokens: 350,
                        temperature: 0.65,
                    });
                    aiExplanation = completion.choices[0]?.message?.content || '';
                } catch (aiErr) {
                    console.error('AI explanation error:', aiErr);
                    aiExplanation = `Based on your symptoms, the highlighted herbs may help address ${doshaAnalysis.dosha} dosha imbalance. Please consult an Ayurvedic practitioner for personalized advice.`;
                }
            }

            res.status(200).json({
                detectedSymptoms,
                doshaAnalysis,
                results,
                aiExplanation,
                fallback: false,
            });
        } catch (error) {
            console.error('Symptom analysis error:', error);
            res.status(500).json({ message: 'Failed to analyze symptoms. Please try again.' });
        }
    },
};
