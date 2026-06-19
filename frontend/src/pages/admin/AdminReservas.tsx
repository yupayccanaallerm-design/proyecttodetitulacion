import { useState } from "react";
import { 
  FolderHeart, 
  Check, 
  X, 
  Sparkles, 
  Eye, 
  Calendar, 
  User, 
  MapPin 
} from "lucide-react";

// Estructura de datos simulada basada en la lógica de tu tesis para TUMPERU SGEV
const RESERVAS_INICIALES = [
  {
    id: "SGEV-9401",
    cliente: "Marie Dubois",
    origen: "Francia",
    fechaViaje: "2026-07-15",
    zonaInteres: "Valle Sagrado + Machu Picchu",
    estadoIA: "Optimizado", // Optimizado por la IA o Pendiente
    estadoReserva: "Pendiente" // Pendiente, Confirmado, Cancelado
  },
  {
    id: "SGEV-9402",
    cliente: "Carlos Mendoza",
    origen: "Lima, Perú",
    fechaViaje: "2026-08-02",
    zonaInteres: "Cusco Ciudad + Ruta Sur",
    estadoIA: "Procesando",
    estadoReserva: "Pendiente"
  },
  {
    id: "SGEV-9403",
    cliente: "John & Sarah Smith",
    origen: "Estados Unidos",
    fechaViaje: "2026-06-28",
    zonaInteres: "Machu Picchu Completo",
    estadoIA: "Optimizado",
    estadoReserva: "Confirmado"
  }
];

export default function AdminReservas() {
  const [reservas, setReservas] = useState(RESERVAS_INICIALES);
  const [filtro, setFiltro] = useState("Todos");

  // Acciones operativas rápidas
  const cambiarEstadoReserva = (id: string, nuevoEstado: string) => {
    setReservas(prev => 
      prev.map(res => res.id === id ? { ...res, estadoReserva: nuevoEstado } : res)
    );
  };

  const reservasFiltradas = reservas.filter(res => {
    if (filtro === "Todos") return true;
    return res.estadoReserva === filtro;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto mb-10 animate-fadeIn">
      
      {/* 1. CABECERA DEL MÓDULO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="text-indigo-600" size={22} />
            Bandeja de Planes y Reservas IA
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            Monitorea los itinerarios automáticos generados por el SGEV y gestiona los estados de reserva de los viajeros.
          </p>
        </div>

        {/* Filtros de Control Operativo */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200/40">
          {["Todos", "Pendiente", "Confirmado"].map((opcion) => (
            <button
              key={opcion}
              onClick={() => setFiltro(opcion)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                filtro === opcion 
                  ? "bg-white text-slate-900 shadow-xs font-semibold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {opcion}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TABLA PRINCIPAL DE RESERVAS */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Código / Viajero</th>
                <th className="px-6 py-4">Ruta e Itinerario</th>
                <th className="px-6 py-4">Fecha de Viaje</th>
                <th className="px-6 py-4 text-center">Motor IA</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones Operativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {reservasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400 font-light">
                    No hay solicitudes bajo este filtro actualmente.
                  </td>
                </tr>
              ) : (
                reservasFiltradas.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/40 transition-colors">
                    
                    {/* Código y Cliente */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-indigo-600 text-[11px]">{res.id}</span>
                        <span className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                          <User size={12} className="text-slate-400" /> {res.cliente}
                        </span>
                        <span className="text-[10px] text-slate-400 font-light">{res.origen}</span>
                      </div>
                    </td>

                    {/* Zona Turística */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{res.zonaInteres}</span>
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-4 text-slate-500">
                      <div className="flex items-center gap-1.5 font-light">
                        <Calendar size={13} className="text-slate-400" />
                        {res.fechaViaje}
                      </div>
                    </td>

                    {/* Estado de Optimización IA */}
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${
                        res.estadoIA === "Optimizado" 
                          ? "bg-purple-50 text-purple-700 border-purple-100" 
                          : "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                      }`}>
                        <Sparkles size={10} />
                        {res.estadoIA}
                      </span>
                    </td>

                    {/* Estado de la Reserva Física */}
                    <td className="px-6 py-4">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ring-4 mr-2 ${
                        res.estadoReserva === "Confirmado" 
                          ? "bg-emerald-500 ring-emerald-100" 
                          : res.estadoReserva === "Cancelado"
                          ? "bg-rose-500 ring-rose-100"
                          : "bg-amber-500 ring-amber-100"
                      }`} />
                      <span className="font-medium text-slate-700">{res.estadoReserva}</span>
                    </td>

                    {/* Controles del Operador (TUMPERU) */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Botón Ver Itinerario IA */}
                        <button 
                          title="Ver Plan Sugerido por IA"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye size={15} />
                        </button>

                        {res.estadoReserva === "Pendiente" && (
                          <>
                            {/* Botón Aprobar */}
                            <button 
                              onClick={() => cambiarEstadoReserva(res.id, "Confirmado")}
                              title="Confirmar Reserva"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Check size={15} />
                            </button>

                            {/* Botón Rechazar */}
                            <button 
                              onClick={() => cambiarEstadoReserva(res.id, "Cancelado")}
                              title="Declinar Operación"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X size={15} />
                            </button>
                          </>
                        )}
                        
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}