import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX, Trash2, Loader2, Bot } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const API_BASE = "http://localhost:5000/api";

// Safe lightweight markdown renderer (avoids react-markdown v9 breaking changes)
const MarkdownText = ({ text }: { text: string }) => {
    const lines = text.split("\n");
    return (
        <div className="space-y-1">
            {lines.map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                // Bold: **text**
                const parts = line.split(/(\*\*[^*]+\*\*)/);
                return (
                    <p key={i} className="leading-snug">
                        {parts.map((part, j) =>
                            part.startsWith("**") && part.endsWith("**") ? (
                                <strong key={j}>{part.slice(2, -2)}</strong>
                            ) : (
                                <span key={j}>{part}</span>
                            )
                        )}
                    </p>
                );
            })}
        </div>
    );
};

interface Message {
    role: "user" | "model";
    text: string;
    timestamp: Date;
}

// ── Web Speech API type stubs ─────────────────────────────────────────────────
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const ChatWidget = () => {
    const { user, token } = useAuth();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);

    // Voice input
    const [listening, setListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Voice output
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

    // Init speech synthesis
    useEffect(() => {
        if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
    }, []);

    // Load history when opened (logged-in users only)
    useEffect(() => {
        if (!open || historyLoaded || !user || !token) return;
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/chat/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.messages?.length > 0) {
                    setMessages(data.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
                } else {
                    setMessages([{ role: "model", text: "Namaste 🙏 I'm **Shundu**, your Ayurvedic wellness guide. How can I help you today?", timestamp: new Date() }]);
                }
            } catch {
                setMessages([{ role: "model", text: "Namaste 🙏 I'm **Shundu**, your Ayurvedic wellness guide. How can I help you today?", timestamp: new Date() }]);
            }
            setHistoryLoaded(true);
        };
        load();
    }, [open, historyLoaded, user, token]);

    // Greeting for guests
    useEffect(() => {
        if (open && !user && messages.length === 0) {
            setMessages([{ role: "model", text: "Namaste 🙏 I'm **Shundu**, your Ayurvedic wellness guide. How can I help you today?", timestamp: new Date() }]);
        }
    }, [open, user, messages.length]);

    // Speak text via SpeechSynthesis
    const speak = useCallback((text: string) => {
        if (!voiceEnabled || !synthRef.current) return;
        synthRef.current.cancel();
        const plain = text.replace(/\*\*/g, "").replace(/\*/g, "").replace(/#+\s/g, "").replace(/•/g, "");
        const utter = new SpeechSynthesisUtterance(plain.slice(0, 500));
        utter.rate = 0.88;      // slightly slower — calm, reassuring
        utter.pitch = 1.15;     // slightly higher — warm & friendly
        utter.volume = 1;
        // Prefer Google en-IN female > Google en-GB female > any Google en > default
        const voices = synthRef.current.getVoices();
        const preferred =
            voices.find((v) => v.name.includes("Google") && v.lang === "en-IN") ||
            voices.find((v) => v.name.includes("Google") && v.lang === "en-GB") ||
            voices.find((v) => v.name.includes("Google") && v.lang.startsWith("en")) ||
            voices.find((v) => v.lang.startsWith("en"));
        if (preferred) utter.voice = preferred;
        synthRef.current.speak(utter);
    }, [voiceEnabled]);

    // Send message
    const sendMessage = useCallback(async (text: string) => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        setInput("");

        const userMsg: Message = { role: "user", text: trimmed, timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ message: trimmed }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            const botMsg: Message = { role: "model", text: data.reply, timestamp: new Date() };
            setMessages((prev) => [...prev, botMsg]);
            speak(data.reply);
        } catch (err: any) {
            const errMsg: Message = { role: "model", text: "Sorry, I couldn't connect to the AI service. Please try again.", timestamp: new Date() };
            setMessages((prev) => [...prev, errMsg]);
            toast.error(err?.message || "Chat error");
        }
        setLoading(false);
    }, [loading, token, speak]);

    // Voice input toggle
    const toggleListening = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { toast.error("Voice input not supported in this browser. Try Chrome."); return; }

        if (listening) {
            recognitionRef.current?.stop();
            return;
        }

        const recognition = new SR();
        recognition.lang = "en-IN";
        recognition.interimResults = false;
        recognition.onresult = (e: any) => {
            const transcript = e.results[0][0].transcript;
            sendMessage(transcript);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => { setListening(false); toast.error("Microphone error. Allow mic access."); };
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    // Clear history
    const clearHistory = async () => {
        if (!user || !token) { setMessages([]); return; }
        try {
            await fetch(`${API_BASE}/chat/history`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessages([{ role: "model", text: "Chat cleared. How can I help you today?", timestamp: new Date() }]);
        } catch {
            toast.error("Failed to clear history");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
    };

    const formatTime = (d: Date) =>
        new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return (
        <>
            {/* Floating toggle button */}
            <motion.button
                onClick={() => setOpen((o) => !o)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-700 to-green-500 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                whileTap={{ scale: 0.9 }}
                title="Chat with Vaidya AI"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                            <X className="h-6 w-6" />
                        </motion.span>
                    ) : (
                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                            <MessageCircle className="h-6 w-6" />
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-border"
                        style={{ height: "520px" }}
                    >
                        {/* Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-800 to-green-600 text-white flex-shrink-0">
                            <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm">Shundu</p>
                                <p className="text-xs text-green-200">Ayurvedic AI Assistant</p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => { synthRef.current?.cancel(); setVoiceEnabled((v) => !v); }}
                                    title={voiceEnabled ? "Mute voice" : "Enable voice"}
                                    className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                                >
                                    {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                </button>
                                <button onClick={clearHistory} title="Clear history" className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
                            {messages.map((msg, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "model" && (
                                        <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                                            <Bot className="h-4 w-4 text-green-700" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.role === "user" ? "ml-8" : "mr-4"}`}>
                                        <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${msg.role === "user"
                                            ? "bg-green-700 text-white rounded-tr-sm"
                                            : "bg-secondary text-foreground rounded-tl-sm"
                                            }`}>
                                            {msg.role === "model" ? (
                                                <MarkdownText text={msg.text} />
                                            ) : (
                                                <p>{msg.text}</p>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-1 px-1">
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Typing indicator */}
                            {loading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-green-700" />
                                    </div>
                                    <div className="bg-secondary rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5">
                                        {[0, 1, 2].map((i) => (
                                            <motion.span
                                                key={i}
                                                className="w-2 h-2 bg-muted-foreground rounded-full"
                                                animate={{ y: [0, -6, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggestion chips */}
                        {messages.length <= 1 && (
                            <div className="px-3 pb-2 bg-background flex flex-wrap gap-1.5 flex-shrink-0">
                                {["What is Ashwagandha?", "Best herb for immunity", "Help with digestion"].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => sendMessage(s)}
                                        className="text-xs px-3 py-1.5 rounded-full border border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input area */}
                        <div className="flex items-end gap-2 px-3 py-3 bg-background border-t border-border flex-shrink-0">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                rows={1}
                                placeholder="Ask about Ayurveda..."
                                className="flex-1 resize-none text-sm px-3 py-2.5 border border-border rounded-xl bg-secondary focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 max-h-24 overflow-auto"
                                style={{ lineHeight: "1.4" }}
                            />
                            <button
                                onClick={toggleListening}
                                title={listening ? "Stop recording" : "Voice input"}
                                className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${listening ? "bg-red-100 text-red-600 animate-pulse" : "bg-secondary text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => sendMessage(input)}
                                disabled={!input.trim() || loading}
                                className="p-2.5 rounded-xl bg-green-700 text-white hover:bg-green-600 transition-colors disabled:opacity-40 flex-shrink-0"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
