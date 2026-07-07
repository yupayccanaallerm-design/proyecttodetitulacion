import { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface ItinerarioDestino {
  id: string;
  nombre: string;
  tipo: string;
  tourRecomendado: string;
  fechaInicio: string;
  duracion: number;
  nivelExigencia: 1 | 2 | 3 | 4 | 5;
  actividades: string[];
}

interface ItinerarioContextValue {
  destinos: ItinerarioDestino[];
  agregarDestino: (destino: Omit<ItinerarioDestino, "id">) => void;
  limpiarItinerario: () => void;
  eliminarDestino: (id: string) => void;
}

const ItinerarioContext = createContext<ItinerarioContextValue | undefined>(undefined);

const STORAGE_KEY = "itinerario_destinos";

export function ItinerarioProvider({ children }: { children: React.ReactNode }) {
  const [destinos, setDestinos] = useState<ItinerarioDestino[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(destinos));
    }
  }, [destinos]);

  const agregarDestino = (destino: Omit<ItinerarioDestino, "id">) => {
    setDestinos((prev) => [
      ...prev,
      {
        ...destino,
        id: `${destino.nombre}-${Date.now()}`,
      },
    ]);
  };

  const limpiarItinerario = () => setDestinos([]);
  const eliminarDestino = (id: string) => setDestinos((prev) => prev.filter((d) => d.id !== id));

  const value = useMemo(
    () => ({ destinos, agregarDestino, limpiarItinerario, eliminarDestino }),
    [destinos]
  );

  return <ItinerarioContext.Provider value={value}>{children}</ItinerarioContext.Provider>;
}

export function useItinerario() {
  const context = useContext(ItinerarioContext);
  if (!context) {
    throw new Error("useItinerario debe usarse dentro de ItinerarioProvider");
  }
  return context;
}
