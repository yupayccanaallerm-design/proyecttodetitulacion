import { useState } from "react";
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  TrendingUp, 
  CalendarDays, 
  DollarSign 
} from "lucide-react";

// Estructura de tipos estricta para TypeScript
interface Reserva {
  id: string;
  pasajero: string;
  tour: string;
  fecha: string;
  monto: number;
  estado: "Confirmado" | "Pendiente" | "Cancelado";
}

export default function AdminReservas() {
  // Datos simulados iniciales del SGEV
  const [reservas, setReservas] = useState<Reserva[]>([
    { id: "RES-2026-001", pasajero: "Jean Pierre Choque", tour: "Machu Picchu Premium", fecha: "2026-06-15", monto: 299.00, estado: "Confirmado" },
    { id: "RES-2026-002", pasajero: "Emily Watson", tour: "Valle Sagrado VIP", fecha: "2026-06-18", monto: 149.50, estado: "Pendiente" },
    { id: "RES-2026-003", pasajero: "Carlos Mendoza", tour: "Montaña de Colores (Vinicunca)", fecha: "2026-06-20", monto: 89.00, estado: "Confirmado" },
    { id: "RES-2026-004", pasajero: "Yuki Tanaka", tour: "Ruta del Sol Puno - Cusco", fecha: "2026-06-22", monto: 195.00, estado: "Cancelado" },
  ]);

  const [search, setSearch] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("Todos");

  // Filtros combinados en tiempo real
  const reservasFiltradas = reservas.filter(res => {
    const coincideBusqueda = res.pasajero.toLowerCase().includes(search.toLowerCase()) || res.id.toLowerCase().includes(search.toLowerCase());
    const coincideFiltro = filtroEstado === "Todos" || res.estado === filtroEstado;
    return coincideBusqueda && coincideFiltro;
  });

  // Cálculos dinámicos para las tarjetas de métricas
  const totalIngresos = reservas.filter(r => r.estado === "Confirmado").reduce((acc, curr) => acc + curr.monto, 0);
  const pendientesCount = reservas.filter(r => r.estado === "Pendiente").length;

  return (
    <div className="space-y-8">
      
      {/* ENCABEZADO DE SECCIÓN */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">Control Operativo de Reservas</h1>
        <p className="text-xs text-slate-400 font-light mt-1">Monitorea y gestiona los flujos e itinerarios automatizados por el SGEV.</p>
      </div>

      {/* 📈 TARJETAS DE MÉTRICAS (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Ingresos */}
        <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Ingresos Confirmados</span>
            <h3 className="text-xl font-bold text-slate-900">${totalIngresos.toFixed(2)}</h3>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Card 2: Pendientes */}
        <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Por Confirmar (Alertas)</span>
            <h3 className="text-xl font-bold text-slate-900">{pendientesCount} Operaciones</h3>
          </div>
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Clock size={20} />
          </div>
        </div>

        {/* Card 3: Eficiencia */}
        <div className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-xs flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tasa de Conversión</span>
            <h3 className="text-xl font-bold text-slate-900">75.8%</h3>
          </div>
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* 🔍 BARRA DE FILTROS */}
      <div className="bg-white p-4 border border-slate-200/60 rounded-2xl shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Buscador interno */}
        <div className="relative w-full md:max-w-xs">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por pasajero o ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/80 border border-slate-200 px-3.5 py-2 pl-10 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
          />
        </div>

        {/* Selector de estados */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Filter size={14} className="text-slate-400 hidden sm:inline" />
          <select 
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-indigo-500 w-full sm:w-44 transition-colors"
          >
            <option value="Todos">Todos los Estados</option>
            <option value="Confirmado">Confirmados</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* 📅 TABLA DE RESERVAS OPERATIVA */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Código ID</th>
                <th className="py-4 px-6">Pasajero / Cliente</th>
                <th className="py-4 px-6">Tour Solicitado</th>
                <th className="py-4 px-6">Fecha Ejecución</th>
                <th className="py-4 px-6">Monto Tarifa</th>
                <th className="py-4 px-6 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {reservasFiltradas.length > 0 ? (
                reservasFiltradas.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-mono text-slate-400 text-[11px]">{res.id}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">{res.pasajero}</td>
                    <td className="py-4 px-6 text-slate-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block" />
                      {res.tour}
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-normal">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={12} />
                        {res.fecha}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">${res.monto.toFixed(2)}</td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        {res.estado === "Confirmado" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/40">
                            <CheckCircle2 size={12} /> Confirmado
                          </span>
                        )}
                        {res.estado === "Pendiente" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/40">
                            <Clock size={12} /> Pendiente
                          </span>
                        )}
                        {res.estado === "Cancelado" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/40">
                            <XCircle size={12} /> Cancelado
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-light">
                    No se encontraron registros que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}