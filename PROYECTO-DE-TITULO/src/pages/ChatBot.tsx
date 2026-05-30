import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, MessageSquare, X } from "lucide-react";

interface Message {
  from: "user" | "bot";
  text: string;
}

interface ChatBotProps {
  isFloating?: boolean;
  onClose?: () => void;
}

export default function ChatBot({ isFloating = false, onClose }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    { from: "bot", text: "👋 ¡Hola! Soy tu Concierge Virtual de GTP TRAVEL, parte de GRUPO TUMPERU. Estoy aquí para asistirte en la planificación de tu viaje ideal por Cusco y optimizar tu itinerario con nuestro sistema inteligente. ¿En qué puedo ayudarte hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al recibir o enviar mensajes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Base de conocimiento integrada de GRUPO TUMPERU & GTP TRAVEL
  function getResponse(msg: string): string {
    msg = msg.toLowerCase();

    if (msg.includes("machu picchu") || msg.includes("machupicchu")) {
      return "🏔️ Nuestro circuito exclusivo a Machu Picchu por GTP Travel incluye tickets de tren premium, ingresos garantizados, traslados privados y un guía certificado. Los paquetes de excelencia inician desde $120.";
    }
    if (msg.includes("precio") || msg.includes("costo") || msg.includes("cuánto cuesta")) {
      return "💰 En Grupo Tumperu diseñamos experiencias a medida. Contamos con excursiones de un día desde $45 y paquetes completos de alta gama hasta $150, adaptados a tus preferencias de confort.";
    }
    if (msg.includes("barato") || msg.includes("económico") || msg.includes("oferta")) {
      return "🌱 Para una experiencia espectacular y accesible con GTP Travel, te sugerimos los circuitos del Valle Sagrado de los Incas o las Salineras de Maras, ideales para comenzar tu aclimatación.";
    }
    if (msg.includes("aventura") || msg.includes("trekking") || msg.includes("caminata")) {
      return "🔥 ¡Excelente elección! Te recomendamos la imponente Montaña de 7 Colores (Vinicunca) o la Laguna Humantay. Nota: Ambos circuitos cuentan con el respaldo y monitoreo de Grupo Tumperu.";
    }
    if (msg.includes("sostenible") || msg.includes("filosofía") || msg.includes("nosotros")) {
      return "🍃 En GRUPO TUMPERU con GTP TRAVEL promovemos un turismo responsable. Cada itinerario respeta el patrimonio cultural, minimiza el impacto ambiental y apoya directamente el desarrollo de las comunidades locales.";
    }
    if (msg.includes("hola") || msg.includes("buenos días") || msg.includes("buenas tardes")) {
      return "👋 ¡Hola de nuevo! Platícame, ¿estás buscando explorar tours específicos de GTP Travel, consultar tarifas, o prefieres que nuestro planificador inteligente diseñe una ruta para ti?";
    }

    return "🤖 Entendido. Para brindarte una propuesta precisa basada en nuestro Sistema de Gestión de Experiencias (SGEV) de Grupo Tumperu, cuéntame más sobre tus intereses o días disponibles.";
  }

  const sendMessage = () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    const userMsg: Message = { from: "user", text: userText };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = { from: "bot", text: getResponse(userText) };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 950);
  };

  // Envoltura de estilos dinámicos si se requiere de forma flotante fija en Inicio
  const wrapperClass = isFloating
    ? "fixed bottom-24 right-4 md:right-8 w-[360px] h-[520px] bg-white border border-slate-200/80 rounded-2xl shadow-2xl z-[200] overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
    : "w-full h-full flex flex-col bg-slate-50 text-slate-800 font-sans";

  return (
    <div className={wrapperClass}>
      
      {/* HEADER EXCLUSIVO PARA CUANDO ES FLOTANTE */}
      {isFloating && (
        <div className="flex justify-between items-center px-4 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white select-none">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-bold tracking-wider leading-none">GRUPO TUMPERU</span>
              <span className="text-[9px] text-slate-400 tracking-widest leading-none mt-1">GTP Travel Concierge</span>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs p-1 rounded-lg hover:bg-white/10"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* ÁREA DE MENSAJES */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar text-xs md:text-sm bg-slate-50/60">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[85%] shadow-xs leading-relaxed transition-all duration-200 ${
                msg.from === "user"
                  ? "bg-indigo-600 text-white rounded-br-none font-medium animate-in fade-in slide-in-from-bottom-1"
                  : "bg-white text-slate-700 border border-slate-200/60 rounded-bl-none animate-in fade-in slide-in-from-bottom-2"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador de "Escribiendo..." */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200/60 p-3.5 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* ENTRADA DE TEXTO (INPUT) */}
      <div className="p-3 bg-white border-t border-slate-200/80 flex items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu consulta sobre Cusco..."
            className="w-full bg-slate-50 text-slate-800 placeholder-slate-400 pl-4 pr-10 py-2.5 rounded-xl text-xs border border-slate-200/80 focus:border-indigo-500/50 focus:bg-white outline-none transition-all font-light"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <span className="absolute right-3 text-slate-300">
            <Sparkles size={14} className="animate-pulse text-indigo-400/60" />
          </span>
        </div>
        
        <button
          onClick={sendMessage}
          disabled={isTyping || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0"
        >
          <Send size={14} />
        </button>
      </div>

    </div>
  );
}