import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mic, MicOff, Search, Brain, Leaf, ShoppingCart, ExternalLink, ChevronDown, ChevronUp, AlertTriangle, Sparkles, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const API_BASE = "http://localhost:5000/api";

const DOSHA_INFO: Record<string, { color: string; bg: string; desc: string; emoji: string }> = {
    Vata: { color: "text-purple-700", bg: "bg-purple-50 border-purple-200", desc: "Governs movement, breathing & nervous system", emoji: "🌬️" },
    Pitta: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", desc: "Governs digestion, metabolism & transformation", emoji: "🔥" },
    Kapha: { color: "text-teal-700", bg: "bg-teal-50 border-teal-200", desc: "Governs structure, immunity & lubrication", emoji: "🌊" },
    Unknown: { color: "text-gray-600", bg: "bg-gray-50 border-gray-200", desc: "Please describe symptoms in more detail", emoji: "🌿" },
};

const EXAMPLE_SYMPTOMS = [
    "stress and anxiety, unable to sleep",
    "fever with inflammation and headache",
    "poor digestion and cough with cold",
    "fatigue, low immunity, joint pain",
    "poor memory and concentration issues",
];

// ── Language code → speech recognition language ──────────────────────────────
const SPEECH_LANG: Record<string, string> = {
    en: "en-IN", te: "te-IN", hi: "hi-IN", ta: "ta-IN", ml: "ml-IN",
};

export default function SymptomChecker() {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [listening, setListening] = useState(false);
    const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
    const recognitionRef = useRef<any>(null);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { i18n } = useTranslation();

    // ── Voice input setup (Web Speech API) ────────────────────────────────────
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = SPEECH_LANG[i18n.language] || "en-IN";
        recognition.onresult = (e: any) => {
            const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
            setInput(transcript);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);
        recognitionRef.current = recognition;
    }, [i18n.language]);

    const toggleVoice = () => {
        const rec = recognitionRef.current;
        if (!rec) { toast.error("Voice input not supported in this browser. Try Chrome."); return; }
        if (listening) { rec.stop(); setListening(false); }
        else { rec.start(); setListening(true); }
    };

    // ── Analyze symptoms ───────────────────────────────────────────────────────
    const analyze = async (text?: string) => {
        const query = (text || input).trim();
        if (!query) { toast.error("Please describe your symptoms first."); return; }
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`${API_BASE}/symptoms/analyze`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symptoms: query, language: i18n.language }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setResult(data);
            setExpandedIdx(0);
        } catch (err: any) {
            toast.error(err.message || "Analysis failed. Please try again.");
        }
        setLoading(false);
    };

    const handleAddToCart = (product: any) => {
        if (!user) { toast.error("Please log in to add to cart", { action: { label: "Login", onClick: () => navigate("/login") } }); return; }
        addToCart(product);
        toast.success(`${product.name} added to cart! 🌿`);
    };

    const doshaInfo = result ? DOSHA_INFO[result.doshaAnalysis?.dosha] || DOSHA_INFO.Unknown : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/40 to-background">
            <div className="container-main py-10 max-w-4xl">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles className="h-3.5 w-3.5" /> AI-Powered · Ayurvedic Intelligence
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">
                        Symptom to Herb <span className="text-green-700">Engine</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Describe your symptoms in any language. Our AI maps them to Ayurvedic herbs using dosha science and research-backed data.
                    </p>
                </motion.div>

                {/* Input Area */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-background border border-border rounded-xl shadow-sm p-6 mb-6">
                    <label className="text-sm font-semibold text-foreground block mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-green-700" /> Describe your symptoms
                    </label>
                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) analyze(); }}
                            rows={3}
                            placeholder="e.g. 'stress and anxiety, unable to sleep' or type in Telugu/Hindi..."
                            className="w-full px-4 py-3 pr-14 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                        <button
                            onClick={toggleVoice}
                            title={listening ? "Stop listening" : "Speak your symptoms"}
                            className={`absolute right-3 top-3 p-2 rounded-full transition-all ${listening
                                ? "bg-red-100 text-red-600 animate-pulse"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                        >
                            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Example pills */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {EXAMPLE_SYMPTOMS.map(ex => (
                            <button key={ex} onClick={() => { setInput(ex); analyze(ex); }}
                                className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-green-100 hover:text-green-800 transition-colors text-muted-foreground border border-border">
                                {ex}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => analyze()}
                            disabled={loading || !input.trim()}
                            className="flex items-center gap-2 bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Brain className="h-4 w-4" />
                            )}
                            {loading ? "Analyzing..." : "Analyze Symptoms"}
                        </button>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mic className="h-3 w-3" /> Voice supported · Ctrl+Enter to analyze
                        </span>
                    </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence>
                    {result && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">

                            {/* Dosha Analysis Card */}
                            <div className={`border rounded-xl p-5 ${doshaInfo?.bg}`}>
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Dosha Imbalance Detected</p>
                                        <h2 className={`text-2xl font-bold font-serif ${doshaInfo?.color}`}>
                                            {doshaInfo?.emoji} {result.doshaAnalysis?.dosha} Vitiation
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">{doshaInfo?.desc}</p>
                                    </div>
                                    {result.detectedSymptoms?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {result.detectedSymptoms.map((s: string) => (
                                                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-background border border-border font-medium capitalize">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Dosha score bars */}
                                <div className="grid grid-cols-3 gap-3 mt-4">
                                    {Object.entries(result.doshaAnalysis?.count || {}).map(([dosha, count]: any) => (
                                        <div key={dosha} className="bg-background rounded-lg p-3 text-center border border-border/50">
                                            <p className="text-xs text-muted-foreground">{dosha}</p>
                                            <p className={`text-xl font-bold ${dosha === result.doshaAnalysis?.dosha ? doshaInfo?.color : 'text-foreground'}`}>{count}</p>
                                            <div className="h-1.5 rounded-full bg-border mt-1">
                                                <div className={`h-1.5 rounded-full ${dosha === 'Vata' ? 'bg-purple-500' : dosha === 'Pitta' ? 'bg-orange-500' : 'bg-teal-500'}`}
                                                    style={{ width: `${Math.min(100, count * 25)}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Explanation */}
                            {result.aiExplanation && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-green-700 mb-2 flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5" /> AI Ayurvedic Analysis
                                    </p>
                                    <p className="text-sm text-green-900 leading-relaxed whitespace-pre-line">{result.aiExplanation}</p>
                                </div>
                            )}

                            {/* Herb Results */}
                            {result.results?.length > 0 && (
                                <div>
                                    <h3 className="font-serif text-xl font-bold mb-4 flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-green-700" /> Recommended Herbs ({result.results.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {result.results.map((r: any, idx: number) => (
                                            <motion.div key={r.herb.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.07 }}
                                                className="border border-border rounded-xl overflow-hidden bg-background">
                                                {/* Header row */}
                                                <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                                                    className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors text-left">
                                                    {/* Rank badge */}
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-600"}`}>
                                                        #{idx + 1}
                                                    </div>

                                                    {r.herb.image && (
                                                        <img src={r.herb.image} alt={r.herb.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-semibold text-foreground">{r.herb.name}</h4>
                                                            {r.herb.sanskritName && <span className="text-xs text-muted-foreground italic">{r.herb.sanskritName}</span>}
                                                            {r.herb.researchBadge && (
                                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                                    🔬 Research-Backed
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            {/* Confidence bar */}
                                                            <div className="flex items-center gap-1.5 flex-1 max-w-[160px]">
                                                                <div className="h-1.5 flex-1 bg-border rounded-full">
                                                                    <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${r.matchScore}%` }} />
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">{r.matchScore}% match</span>
                                                            </div>
                                                            {r.herb.dosha?.map((d: string) => (
                                                                <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-foreground">{d}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {expandedIdx === idx ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                                                </button>

                                                {/* Expanded detail */}
                                                <AnimatePresence>
                                                    {expandedIdx === idx && (
                                                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                                            <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                                                                <p className="text-sm text-muted-foreground">{r.herb.description}</p>

                                                                {/* Benefits */}
                                                                {r.herb.benefits?.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-foreground mb-1.5 uppercase tracking-wide">Key Benefits</p>
                                                                        <ul className="space-y-1">
                                                                            {r.herb.benefits.map((b: string, i: number) => (
                                                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                                                    <span className="text-green-600 mt-0.5 flex-shrink-0">•</span> {b}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Dosage */}
                                                                {r.herb.dosage && (
                                                                    <div className="bg-secondary/50 rounded-lg px-3 py-2 text-sm">
                                                                        <span className="font-medium">Typical Dosage: </span>
                                                                        <span className="text-muted-foreground">{r.herb.dosage}</span>
                                                                    </div>
                                                                )}

                                                                {/* Active Compounds (Layer 3) */}
                                                                {r.herb.activeCompounds?.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-blue-700 mb-1.5 uppercase tracking-wide flex items-center gap-1">🔬 Active Compounds</p>
                                                                        <div className="flex flex-wrap gap-1.5">
                                                                            {r.herb.activeCompounds.map((c: string) => (
                                                                                <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{c}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* PubMed Links (Layer 3) */}
                                                                {r.herb.pubmedLinks?.length > 0 && (
                                                                    <div>
                                                                        <p className="text-xs font-semibold text-blue-700 mb-1.5 uppercase tracking-wide">📄 Research References</p>
                                                                        {r.herb.pubmedLinks.map((link: string, i: number) => (
                                                                            <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                                                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                                                <ExternalLink className="h-3 w-3" /> PubMed Reference {i + 1}
                                                                            </a>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Safety Flags */}
                                                                {r.safetyFlags?.length > 0 && (
                                                                    <div className="flex flex-col gap-1">
                                                                        {r.safetyFlags.map((flag: string) => (
                                                                            <p key={flag} className="flex items-center gap-1.5 text-xs text-amber-700">
                                                                                <AlertTriangle className="h-3 w-3 flex-shrink-0" /> {flag}
                                                                            </p>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* Product card */}
                                                                {r.product && (
                                                                    <div className="flex items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
                                                                        <div className="flex items-center gap-3">
                                                                            {r.product.image && <img src={r.product.image} className="h-10 w-10 rounded-md object-cover" alt="" />}
                                                                            <div>
                                                                                <p className="text-sm font-semibold">{r.product.name}</p>
                                                                                <p className="text-xs text-green-700 font-bold">₹{r.product.price}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex gap-2">
                                                                            <Link to={`/products`} className="text-xs px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors">
                                                                                View
                                                                            </Link>
                                                                            {r.product.inStock && (
                                                                                <button onClick={() => handleAddToCart(r.product)}
                                                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                                                                                    <ShoppingCart className="h-3 w-3" /> Add to Cart
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No results (fallback) */}
                            {result.fallback && result.aiExplanation && (
                                <div className="border border-border rounded-xl p-6">
                                    <h3 className="font-semibold font-serif mb-3 flex items-center gap-2"><Leaf className="h-4 w-4 text-green-700" /> AI Herb Suggestions</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">{result.aiExplanation}</p>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <p className="text-xs text-center text-muted-foreground border-t border-border pt-4">
                                ⚕️ This tool provides general Ayurvedic guidance only and is not a medical diagnosis. Always consult a qualified healthcare professional before starting any herbal treatment.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
