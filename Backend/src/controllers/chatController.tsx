import { Request, Response } from 'express';
import Groq from 'groq-sdk';
import { Chat } from '../models/Chat';
import { Product } from '../models/Product';
import { Herb } from '../models/Herb';
import { env } from '../config/env';

// ── Groq client ───────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are Shundu, an expert Ayurvedic assistant for Ayurvedh — a premium herbal products e-commerce store.

Your personality:
- Warm, knowledgeable, and reassuring — like a trusted herbalist
- Concise but thorough; use bullet points when listing benefits
- Always recommend consulting a doctor for serious conditions

Your capabilities:
- Explain Ayurvedic herbs, their benefits, uses, and side effects
- Help users find products from our catalog (provided below as context)
- Answer questions about dosage, combinations, and precautions
- Guide users on their wellness journey using Ayurvedic principles
- Explain Tridosha (Vata, Pitta, Kapha) and Ayurvedic concepts

Rules:
- Never recommend replacing prescribed medication without doctor approval
- If asked something outside Ayurveda/herbs/wellness, politely redirect
- Keep responses under 250 words unless the user asks for more detail
- Always respond in the same language the user writes in
- When recommending herbs, mention if they are available in our store`;

// ── Inject herb encyclopedia + product catalog ────────────────────────────────
async function getKnowledgeContext(): Promise<string> {
    let context = '';

    try {
        // Herb encyclopedia
        const herbs = await Herb.find()
            .select('name sanskritName category benefits dosage precautions taste energy dosha')
            .limit(30);
        if (herbs.length > 0) {
            const herbList = herbs.map((h) =>
                `• ${h.name} (${h.sanskritName || h.name}): ${h.category.join(', ')}\n` +
                `  Benefits: ${h.benefits.slice(0, 3).join('; ')}\n` +
                `  Dosage: ${h.dosage}\n` +
                `  Balances: ${h.dosha.join(', ')} dosha`
            ).join('\n\n');
            context += `\n\n=== AYURVEDH HERB ENCYCLOPEDIA ===\n${herbList}`;
        }

        // Product catalog
        const products = await Product.find()
            .select('name category description price')
            .limit(20);
        if (products.length > 0) {
            const productList = products.map((p) =>
                `• ${p.name} (${p.category}) — ₹${p.price}: ${p.description.slice(0, 80)}`
            ).join('\n');
            context += `\n\n=== AYURVEDH PRODUCT CATALOG ===\n${productList}`;
        }
    } catch (err) {
        console.error('Context fetch error:', err);
    }

    return context;
}

export const chatController = {
    /**
     * POST /api/chat
     * Send a message and get a Groq AI response.
     * History is persisted to MongoDB for logged-in users.
     */
    async sendMessage(req: Request, res: Response): Promise<void> {
        try {
            const { message } = req.body;
            const userId = (req as any).user?.id;

            if (!message?.trim()) {
                res.status(400).json({ message: 'Message is required' });
                return;
            }

            if (!env.GROQ_API_KEY) {
                res.status(503).json({ message: 'AI service not configured. Please add GROQ_API_KEY to .env' });
                return;
            }

            // Get herb encyclopedia + product catalog context
            const knowledgeContext = await getKnowledgeContext();
            const fullSystemPrompt = SYSTEM_PROMPT + knowledgeContext;

            // Load existing chat history for this user (if logged in)
            let chatDoc: any = null;
            const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];

            if (userId) {
                chatDoc = await Chat.findOne({ user: userId });
                if (chatDoc && chatDoc.messages.length > 0) {
                    // Use last 10 exchanges (20 messages) for context window management
                    const recent = chatDoc.messages.slice(-20);
                    for (const m of recent) {
                        conversationHistory.push({
                            role: m.role === 'model' ? 'assistant' : 'user',
                            content: m.text,
                        });
                    }
                }
            }

            // Add the new user message
            conversationHistory.push({ role: 'user', content: message.trim() });

            // ── Call Groq API ──────────────────────────────────────────────────
            const completion = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: fullSystemPrompt },
                    ...conversationHistory,
                ],
                max_tokens: 600,
                temperature: 0.7,
            });

            const reply = completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.';

            // Persist to MongoDB if user is logged in
            if (userId) {
                const now = new Date();
                const newMessages = [
                    { role: 'user' as const, text: message.trim(), timestamp: now },
                    { role: 'model' as const, text: reply, timestamp: now },
                ];

                if (chatDoc) {
                    await Chat.findByIdAndUpdate(chatDoc._id, { $push: { messages: { $each: newMessages } } });
                } else {
                    await Chat.create({ user: userId, messages: newMessages });
                }
            }

            res.status(200).json({ reply });
        } catch (error: any) {
            console.error('Chat error:', error?.message || error);
            const isRateLimit = error?.status === 429 || error?.message?.includes('Rate limit') || error?.message?.includes('quota');
            res.status(isRateLimit ? 429 : 500).json({
                message: isRateLimit
                    ? '⏳ Rate limit reached. Please wait a moment and try again.'
                    : 'AI service error. Please try again.',
            });
        }
    },

    /**
     * GET /api/chat/history
     * Get the logged-in user's full chat history.
     */
    async getHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            const chatDoc = await Chat.findOne({ user: userId });
            res.status(200).json({ messages: chatDoc?.messages || [] });
        } catch (error) {
            console.error('Get history error:', error);
            res.status(500).json({ message: 'Failed to fetch chat history' });
        }
    },

    /**
     * DELETE /api/chat/history
     * Clear the logged-in user's chat history.
     */
    async clearHistory(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user?.id;
            await Chat.findOneAndUpdate({ user: userId }, { messages: [] });
            res.status(200).json({ message: 'Chat history cleared' });
        } catch (error) {
            console.error('Clear history error:', error);
            res.status(500).json({ message: 'Failed to clear history' });
        }
    },
};
