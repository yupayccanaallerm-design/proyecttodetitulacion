import { MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function FloatingWhatsAppButton() {
  const phoneNumber = "51907775337";

  const message =
    "Hola, estoy interesado en los servicios de la agencia de viajes. Me gustaría recibir información sobre paquetes turísticos, promociones y asesoría personalizada para mi próximo viaje. ¡Gracias!";

  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  const BUTTON_SIZE = 56;
  const DRAG_THRESHOLD = 6;

  const [position, setPosition] = useState({ x: 24, y: 24 });
  const [isPressing, setIsPressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const dragHandled = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;

    setIsPressing(true);
    setIsDragging(false);
    dragHandled.current = false;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    if (buttonRef.current) {
      buttonRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPressing) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance > DRAG_THRESHOLD) {
      dragHandled.current = true;
      setIsDragging(true);

      const nextPosition = {
        x: Math.min(Math.max(dragStart.current.posX + deltaX, 8), window.innerWidth - BUTTON_SIZE - 8),
        y: Math.min(Math.max(dragStart.current.posY - deltaY, 8), window.innerHeight - BUTTON_SIZE - 8),
      };

      setPosition(nextPosition);
    }
  };

  const handlePointerUp = () => {
    setIsPressing(false);
    setIsDragging(false);
    if (buttonRef.current) {
      try {
        buttonRef.current.releasePointerCapture?.(0);
      } catch {
        // noop
      }
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (dragHandled.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - BUTTON_SIZE - 8),
        y: Math.min(prev.y, window.innerHeight - BUTTON_SIZE - 8),
      }));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <a
      ref={buttonRef}
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`fixed z-[9999] flex items-center justify-center rounded-full bg-[#25D366] shadow-xl focus:outline-none focus:ring-4 focus:ring-[#25D366]/50 select-none touch-none ${
        isDragging
          ? "cursor-grabbing scale-110 transition-none"
          : "cursor-pointer transition-all duration-200 hover:scale-110 hover:bg-[#128C7E]"
      }`}
      style={{
        width: BUTTON_SIZE,
        height: BUTTON_SIZE,
        left: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
      aria-label="WhatsApp"
    >
      <MessageCircle size={24} className="text-white pointer-events-none" />

      {!isPressing && (
        <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-60 pointer-events-none"></span>
      )}
    </a>
  );
}