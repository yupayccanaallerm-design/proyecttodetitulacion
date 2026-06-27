import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState, useRef, useEffect, useCallback } from "react";

const BUTTON_SIZE = 56;

export default function FloatingWhatsAppButton() {
  const { t } = useTranslation();
  const phoneNumber = "51907775337";

  const [position, setPosition] = useState(() => ({
    x: 24,
    y: window.innerHeight - BUTTON_SIZE - 24,
  }));

  const isDragging = useRef(false);
  const hasMoved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val));

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    hasMoved.current = false;
    const touch = e.touches[0];
    offset.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current) return;
    hasMoved.current = true;
    setPosition({
      x: clamp(e.clientX - offset.current.x, 0, window.innerWidth - BUTTON_SIZE),
      y: clamp(e.clientY - offset.current.y, 0, window.innerHeight - BUTTON_SIZE),
    });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging.current) return;
    hasMoved.current = true;
    const touch = e.touches[0];
    setPosition({
      x: clamp(touch.clientX - offset.current.x, 0, window.innerWidth - BUTTON_SIZE),
      y: clamp(touch.clientY - offset.current.y, 0, window.innerHeight - BUTTON_SIZE),
    });
    e.preventDefault();
  }, []);

  const stopDrag = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", stopDrag);
    };
  }, [handleMouseMove, handleTouchMove, stopDrag]);

  const handleClick = () => {
    if (hasMoved.current) return;
    const message =
      t("whatsapp_mensaje_predeterminado") ||
      "Hola, tengo una consulta sobre los tours y paquetes";
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <button
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      title={t("whatsapp_contacto") || "Contáctanos por WhatsApp"}
      style={{ left: position.x, top: position.y }}
      className="fixed z-50 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
      aria-label="WhatsApp"
      draggable={false}
    >
      <MessageCircle size={24} className="m-4" />
    </button>
  );
}
