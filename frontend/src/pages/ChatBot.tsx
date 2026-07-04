import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, AlertCircle, Mic, MicOff, Volume2, VolumeX, StopCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Message {
  from: "user" | "bot";
  text: string;
}

interface ChatBotProps {
  isFloating?: boolean;
  onClose?: () => void;
  userId?: string;
  initialContext?: string;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function ChatBot({
  isFloating = false,
  onClose,
  userId = "usuario",
  initialContext,
}: ChatBotProps) {
  const { t, i18n } = useTranslation();

  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: t("chat_bienvenida") },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_voice_enabled", String(voiceEnabled));
    }
  }, [voiceEnabled]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Precarga de voces disponibles (algunos navegadores las cargan de forma asíncrona)
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const loadVoices = () => {
      voicesRef.current = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel();
        recognitionRef.current?.stop?.();
      }
    };
  }, []);

  useEffect(() => {
    setMessages([{ from: "bot", text: t("chat_bienvenida") }]);
  }, [i18n.language]);

  useEffect(() => {
    if (!initialContext) return;
    const question = t("chat_contexto_intro", { lugar: initialContext });
    setTimeout(() => {
      setIsTyping(true);
      setError(null);
      setMessages((prev) => [...prev, { from: "user", text: question }]);
      fetch("/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, query: question, top_k: 2, lang: i18n.language }),
      })
        .then((r) => r.json())
        .then((data) => {
          const botText = data.answer;
          setMessages((prev) => [...prev, { from: "bot", text: botText }]);
          speakText(botText);
        })
        .catch(() => {
          setMessages((prev) => [...prev, { from: "bot", text: t("chat_error_lugar") }]);
        })
        .finally(() => setIsTyping(false));
    }, 100);
  }, [initialContext]);

  const speakText = (text: string) => {
    if (!voiceEnabled) return;
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const lang = i18n.language === "en" ? "en" : "es";
    utterance.lang = lang === "en" ? "en-US" : "es-ES";

    const voices = voicesRef.current.length
  ? voicesRef.current
  : window.speechSynthesis.getVoices();

    // 1. Filtrar por idioma
    const candidates = voices.filter((v) =>
      v.lang.startsWith(lang === "en" ? "en" : "es")
    );

    // 2. Prioridad 1: voz femenina/neural
    const femaleVoice = candidates.find((v) =>
      /female|woman|google|microsoft|sabina|samantha/i.test(v.name)
    );

    // 3. Prioridad 2: voz "Google" (más natural en muchos sistemas)
    const googleVoice = candidates.find((v) =>
      v.name.toLowerCase().includes("google")
    );

    // 4. Fallback
    const defaultVoice = candidates[0] || voices[0];

    //  elegir en orden de prioridad
    const selectedVoice = femaleVoice || googleVoice || defaultVoice;

    utterance.voice = selectedVoice;

    utterance.rate = 2;
    utterance.pitch = 2;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startRecording = () => {
    if (!SpeechRecognitionAPI) {
      setError(t("chat_error_microfono"));
      return;
    }
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = i18n.language === "en" ? "en-US" : "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.onerror = () => setRecording(false);
    recognition.onend = () => setRecording(false);
    recognitionRef.current = recognition;
    recognition.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;
    const userText = input;
    setMessages((prev) => [...prev, { from: "user", text: userText }]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetch("/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, query: userText, top_k: 2, lang: i18n.language }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      const answer =
        typeof data?.answer === "string" && data.answer.trim()
          ? data.answer
          : t("chat_error_conexion");
      setMessages((prev) => [...prev, { from: "bot", text: answer }]);
      speakText(answer);

      if (data.intent === "memorizar") await saveToMemory(userText);
    } catch {
      setError(t("chat_error_servidor"));
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: t("chat_error_conexion") },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveToMemory = async (fact: string) => {
    try {
      await fetch("/chatbot/mem/fact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          fact_text: fact.replace("recuerda que", "").trim(),
        }),
      });
    } catch {}
  };

  const formatText = (text: string) =>
    text.split("\n").map((line, i) => (
      <p key={i} className="mb-1.5 last:mb-0">
        {line}
      </p>
    ));

  const suggestions = [
    t("chat_sug_machupicchu"),
    t("chat_sug_recomienda"),
    t("chat_sug_sagrado"),
    t("chat_sug_colores"),
    t("chat_sug_foto"),
    t("chat_sug_hoteles"),
  ];

  return (
    <div
      className={
        isFloating
          ? "fixed bottom-24 right-4 md:right-8 w-[400px] h-[600px] bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-[200] overflow-hidden flex flex-col"
          : "w-full h-full flex flex-col bg-white text-slate-800 font-sans"
      }
    >
      {/* HEADER — solo visible cuando el componente controla su propio contenedor */}
      {isFloating && (
        <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white select-none">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-60" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">Travel Assistant</span>
              <span className="text-[10px] text-slate-400">{t("chat_disponible") || "Asistente disponible"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (voiceEnabled) window.speechSynthesis?.cancel();
              }}
              title={voiceEnabled ? t("chat_voz_desactivar") : t("chat_voz_activar")}
              className="text-slate-400 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/10"
            >
              {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>
            {isSpeaking && (
              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }}
                title={t("chat_detener") || "Detener"}
                className="text-slate-400 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/10"
              >
                <StopCircle size={15} />
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/10"
              >
                <span className="sr-only">{t("chat_cerrar")}</span>
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* MENSAJES */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div className="flex flex-col gap-2">
              <div
                className={`p-3 rounded-2xl max-w-[85%] shadow-sm text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-slate-50 text-slate-700 border border-slate-200 rounded-bl-sm"
                }`}
              >
                {formatText(msg.text)}
              </div>
              {msg.from === "bot" && voiceEnabled && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 text-left"
                >
                  <Volume2 size={12} />
                  {t("chat_escuchar")}
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs text-slate-400 ml-1">{t("chat_consultando")}</span>
            </div>
          </div>
        )}

        {isSpeaking && (
          <div className="flex justify-center">
            <div className="flex items-center gap-1.5 text-xs text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              <Volume2 size={12} />
              {t("chat_hablando")}
          </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-2">
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-full flex items-center gap-2 border border-red-200">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center gap-2 mb-2.5">
          <button
            onClick={recording ? stopRecording : startRecording}
            title={recording ? t("chat_detener") : t("chat_grabar")}
            className={`p-2.5 rounded-xl transition-all border flex items-center justify-center shrink-0 ${
              recording
                ? "bg-red-500 text-white border-red-500 animate-pulse"
                : "bg-white text-slate-400 border-slate-200 hover:text-indigo-600 hover:border-indigo-200"
            }`}
          >
            {recording ? <MicOff size={16} /> : <Mic size={16} />}
          </button>

          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("chat_placeholder")}
              className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 pl-4 pr-9 py-2.5 rounded-xl text-sm border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isTyping}
            />
            <Sparkles size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
          </div>

          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-300 text-white p-2.5 rounded-xl transition-all shrink-0"
          >
            <Send size={16} />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {suggestions.map((sug) => (
            <button
              key={sug}
              onClick={() => setInput(sug)}
              className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-500 px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}