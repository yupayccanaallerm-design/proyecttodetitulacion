import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface DestinoItinerario {
  id: string;
  nombre: string;
  tipo: string;
  fechaInicio: string;
  duracion: number;
  nivelExigencia: 1 | 2 | 3 | 4 | 5;
  actividades: string[];
  tourRecomendado: string;
}

interface ItinerarioContextType {
  destinos: DestinoItinerario[];
  agregarDestino: (destino: Omit<DestinoItinerario, 'id'>) => void;
  eliminarDestino: (id: string) => void;
  limpiarItinerario: () => void;
  totalDias: number;
  totalDestinos: number;
}

const ItinerarioContext = createContext<ItinerarioContextType | null>(null);

export function ItinerarioProvider({ children }: { children: ReactNode }) {
  const [destinos, setDestinos] = useState<DestinoItinerario[]>(() => {
    // Cargar desde localStorage al iniciar
    const saved = localStorage.getItem('itinerario');
    return saved ? JSON.parse(saved) : [];
  });

  const agregarDestino = (destino: Omit<DestinoItinerario, 'id'>) => {
    const nuevoDestino = {
      ...destino,
      id: `destino-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setDestinos(prev => {
      const nuevos = [...prev, nuevoDestino];
      localStorage.setItem('itinerario', JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const eliminarDestino = (id: string) => {
    setDestinos(prev => {
      const nuevos = prev.filter(d => d.id !== id);
      localStorage.setItem('itinerario', JSON.stringify(nuevos));
      return nuevos;
    });
  };

  const limpiarItinerario = () => {
    setDestinos([]);
    localStorage.removeItem('itinerario');
  };

  const totalDias = destinos.reduce((acc, d) => acc + d.duracion, 0);
  const totalDestinos = destinos.length;

  return (
    <ItinerarioContext.Provider value={{
      destinos,
      agregarDestino,
      eliminarDestino,
      limpiarItinerario,
      totalDias,
      totalDestinos
    }}>
      {children}
    </ItinerarioContext.Provider>
  );
}

export function useItinerario() {
  const context = useContext(ItinerarioContext);
  if (!context) {
    throw new Error('useItinerario debe usarse dentro de ItinerarioProvider');
  }
  return context;
}