import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X, AlertCircle, Database, Brain } from "lucide-react";

interface Message {
  from: "user" | "bot";
  text: string;
  sources?: Array<{ source: string; page?: string; chunk?: string }>;
  moduleData?: {
    type: string;
    top?: Array<{ destino: string; score: number }>;
  };
}

interface ChatBotProps {
  isFloating?: boolean;
  onClose?: () => void;
  userId?: string;
  initialContext?: string;  // Contexto de lugar detectado desde PerfilViajero
}

export default function ChatBot({ 
  isFloating = false, 
  onClose,
  userId = "usuario",
  initialContext 
}: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      from: "bot", 
      text: "👋 ¡Hola! Soy Travel Assistant, tu experto en turismo de Cusco. Puedo ayudarte con información sobre:\n\n📍 Tours y destinos\n🏨 Hoteles y alojamiento\n🍽️ Restaurantes y gastronomía\n📜 Historia y cultura\n🚗 Transporte y logística\n\n¿En qué puedo asistirte hoy?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIntent, setCurrentIntent] = useState<string>("");
  const [modelInfo, setModelInfo] = useState<string>("Cargando...");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Cuando se recibe un contexto (lugar detectado desde PerfilViajero), enviar automáticamente
  useEffect(() => {
    if (initialContext) {
      const question = `Cuéntame sobre ${initialContext}`;
      setInput(question);
      // Pequeño delay para que el input se actualice antes de enviar
      setTimeout(() => {
        setInput("");
        setIsTyping(true);
        setError(null);
        const userMsg = { from: "user" as const, text: question };
        setMessages(prev => [...prev, userMsg]);

        fetch("/chatbot/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, query: question, top_k: 2 }),
        })
          .then(r => r.json())
          .then(data => {
            setMessages(prev => [...prev, {
              from: "bot",
              text: data.answer,
              sources: data.sources?.length > 0 ? data.sources : undefined,
            }]);
          })
          .catch(() => {
            setMessages(prev => [...prev, {
              from: "bot",
              text: "🔌 No pude conectarme al servidor para consultar sobre este lugar.",
            }]);
          })
          .finally(() => setIsTyping(false));
      }, 100);
    }
  }, [initialContext]);

  // Obtener configuración del backend al iniciar
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch("/chatbot/config");
        if (response.ok) {
          const config = await response.json();
          setModelInfo(config.model || "Gemma");
        } else {
          setModelInfo("Ollama");
        }
      } catch (err) {
        console.error("Error obteniendo configuración:", err);
        setModelInfo("Ollama");
      }
    };
    
    fetchConfig();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: Message = { from: "user", text: userText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);
    setCurrentIntent("");

    try {
      const response = await fetch("/chatbot/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          query: userText,
          top_k: 2
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setCurrentIntent(data.intent);
      
      const botMsg: Message = { 
        from: "bot", 
        text: data.answer,
        sources: data.sources && data.sources.length > 0 ? data.sources : undefined,
        moduleData: data.module_data || undefined
      };
      
      setMessages(prev => [...prev, botMsg]);

      if (data.intent === "memorizar") {
        await saveToMemory(userText);
      }

      // Si hay datos de recomendaciones, navegar al planificador
      if (data.module_data?.type === "recomendacion" && data.module_data?.top) {
        // Mostrar recomendaciones destacadas
      }

    } catch (err) {
      console.error("Error en chat:", err);
      setError("No se pudo conectar con el servidor.");
      
      const errorMsg: Message = { 
        from: "bot", 
        text: "🔌 Lo siento, no puedo conectarme al servidor. Verifica que el backend esté corriendo en http://127.0.0.1:8000" 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const saveToMemory = async (fact: string) => {
    try {
      await fetch("/chatbot/mem/fact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          fact_text: fact.replace("recuerda que", "").trim()
        }),
      });
    } catch (err) {
      console.error("Error guardando en memoria:", err);
    }
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {line}
        {line.startsWith('📍') && <span className="ml-2 text-indigo-500">🗺️</span>}
        {line.startsWith('🏨') && <span className="ml-2 text-indigo-500">🏨</span>}
        {line.startsWith('🍽️') && <span className="ml-2 text-indigo-500">🍴</span>}
        {line.startsWith('📜') && <span className="ml-2 text-indigo-500">📖</span>}
        {line.startsWith('🚗') && <span className="ml-2 text-indigo-500">🚗</span>}
      </p>
    ));
  };

  return (
    <div className={isFloating 
      ? "fixed bottom-24 right-4 md:right-8 w-[400px] h-[600px] bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-[200] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
      : "w-full h-full flex flex-col bg-gradient-to-b from-slate-50 to-white text-slate-800 font-sans"
    }>
      
      {/* HEADER */}
      <div className="flex justify-between items-center px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white select-none shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-75"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tight">Travel Assistant</span>
            <div className="flex items-center gap-2 text-[10px] text-slate-300">
              <Brain size={10} />
              <span>IA con RAG • {modelInfo}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentIntent && (
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">
              {currentIntent === "saludo" && "👋 Saludo"}
              {currentIntent === "consulta" && "🔍 Consulta"}
              {currentIntent === "memorizar" && "🧠 Aprendiendo"}
              {currentIntent === "recomendar" && "🎯 Recomendar"}
              {currentIntent === "imagen" && "📸 Visión"}
            </span>
          )}
          {isFloating && onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/10"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Resto del componente igual... */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-200`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                msg.from === "user"
                  ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none"
                  : "bg-white text-slate-700 border border-slate-200 rounded-bl-none"
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatText(msg.text)}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                  <Database size={10} className="inline mr-1" />
                  Fuentes: {msg.sources.map((s, idx) => (
                    <span key={idx} className="ml-1">
                      {s.source}{s.chunk !== "?" && ` (chunk ${s.chunk})`}
                      {idx < msg.sources!.length - 1 && ","}
                    </span>
                  ))}
                </div>
              )}

              {msg.moduleData?.top && (
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-bold text-indigo-600 mb-1">🎯 Recomendaciones:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.moduleData.top.map((rec, idx) => (
                      <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                        {idx+1}. {rec.destino}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    💡 Usa el Planificador de Viajes para más detalles.
                  </p>
                </div>
                )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span className="text-xs text-slate-400 ml-1">Consultando base de conocimiento... (puede tardar 1-2 min)</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-2">
            <div className="bg-red-50 text-red-700 text-xs px-3 py-2 rounded-full flex items-center gap-2 border border-red-200">
              <AlertCircle size={12} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white border-t border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: ¿Cuánto cuesta Machu Picchu? o recuerda que me gusta la aventura..."
              className="w-full bg-slate-50 text-slate-800 placeholder:text-slate-400 pl-4 pr-10 py-3 rounded-xl text-sm border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={isTyping}
            />
            <Sparkles size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400" />
          </div>
          
          <button
            onClick={sendMessage}
            disabled={isTyping || !input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer min-w-[44px]"
          >
            <Send size={18} />
          </button>
        </div>
        
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {["Machu Picchu", "Recomiéndame", "Valle Sagrado", "Montaña 7 Colores", "Identifica una foto", "Hoteles"].map(sug => (
            <button
              key={sug}
              onClick={() => setInput(sug)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}