import { useState, useEffect } from "react";
import { Users, Mail, Phone, MapPin, Calendar, FolderHeart, ChevronDown, ChevronUp, RefreshCw, AlertCircle, Globe } from "lucide-react";
import { API_BASE } from "../../api";

interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  pais_procedencia?: string;
  idioma?: string;
  created_at: string;
  total_reservas: number;
  ultima_reserva?: string;
  ultimo_estado?: string;
}

interface ReservaCliente {
  id: number;
  codigo: string;
  estado: string;
  fecha_viaje: string;
  num_personas: number;
  monto_total: number;
  notas: string;
  created_at: string;
  paquete_nombre?: string;
}

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [historialCliente, setHistorialCliente] = useState<Record<number, ReservaCliente[]>>({});
  const [cargandoHistorial, setCargandoHistorial] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarClientes = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/clientes`);
      if (!res.ok) throw new Error("Error cargando clientes");
      const data = await res.json();
      setClientes(data.clientes || []);
    } catch (e: any) {
      setError("No se pudieron cargar los clientes.");
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorial = async (clienteId: number) => {
    if (historialCliente[clienteId]) return;
    setCargandoHistorial(clienteId);
    try {
      const res = await fetch(`${API_BASE}/api/clientes/${clienteId}/reservas`);
      if (res.ok) {
        const data = await res.json();
        setHistorialCliente((prev) => ({ ...prev, [clienteId]: data.reservas || [] }));
      }
    } catch { /**/ }
    finally { setCargandoHistorial(null); }
  };

  const toggleExpandir = (id: number) => {
    setExpandidos((prev) => {
      const nuevo = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!prev.includes(id)) cargarHistorial(id);
      return nuevo;
    });
  };

  useEffect(() => { cargarClientes(); }, []);

  const clientesFiltrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getEstadoColor = (estado?: string) => {
    if (!estado || estado === "pendiente") return "bg-amber-50 text-amber-600";
    if (estado === "notificada" || estado === "confirmada") return "bg-emerald-50 text-emerald-600";
    return "bg-slate-100 text-slate-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto mb-10">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="text-indigo-600" size={22} />
            Historial de Clientes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrados en total
          </p>
        </div>
        <button onClick={cargarClientes}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all self-start">
          <RefreshCw size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white border border-slate-200 px-4 py-3 pl-10 rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
        />
        <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4">
          <p className="text-2xl font-bold text-slate-900">{clientes.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Clientes totales</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4">
          <p className="text-2xl font-bold text-indigo-600">
            {clientes.reduce((acc, c) => acc + (c.total_reservas || 0), 0)}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Reservas totales</p>
        </div>
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-emerald-600">
            {clientes.filter((c) => c.total_reservas > 0).length}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Con reservas activas</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Lista clientes */}
      <div className="space-y-2">
        {clientesFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center">
            <Users className="mx-auto text-slate-300" size={48} />
            <p className="text-slate-400 font-light mt-4">No se encontraron clientes.</p>
          </div>
        ) : (
          clientesFiltrados.map((cliente) => (
            <div key={cliente.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-xs overflow-hidden">
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => toggleExpandir(cliente.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    {cliente.nombre?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800">{cliente.nombre}</span>
                      {cliente.total_reservas > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
                          {cliente.total_reservas} reserva{cliente.total_reservas !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Mail size={11} /> {cliente.email}</span>
                      {cliente.telefono && <span className="flex items-center gap-1"><Phone size={11} /> {cliente.telefono}</span>}
                      {cliente.pais_procedencia && <span className="flex items-center gap-1"><Globe size={11} /> {cliente.pais_procedencia}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cliente.ultimo_estado && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getEstadoColor(cliente.ultimo_estado)}`}>
                      {cliente.ultimo_estado}
                    </span>
                  )}
                  {cliente.ultima_reserva && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(cliente.ultima_reserva).toLocaleDateString()}
                    </span>
                  )}
                  {expandidos.includes(cliente.id)
                    ? <ChevronUp size={16} className="text-slate-400" />
                    : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </div>

              {/* Historial expandido */}
              {expandidos.includes(cliente.id) && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <FolderHeart size={11} /> Historial de reservas
                  </h4>
                  {cargandoHistorial === cliente.id ? (
                    <div className="text-center py-4 text-xs text-slate-400">
                      <RefreshCw className="animate-spin mx-auto mb-1" size={14} /> Cargando...
                    </div>
                  ) : (historialCliente[cliente.id] || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-2">Sin reservas registradas.</p>
                  ) : (
                    <div className="space-y-2">
                      {historialCliente[cliente.id].map((r) => (
                        <div key={r.id} className="bg-slate-50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-slate-700">{r.codigo || `#${r.id}`}</span>
                              {r.paquete_nombre && (
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">{r.paquete_nombre}</span>
                              )}
                            </div>
                            {r.notas && (
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{r.notas}</p>
                            )}
                            <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                              {r.fecha_viaje && <span className="flex items-center gap-0.5"><Calendar size={9} /> {new Date(r.fecha_viaje).toLocaleDateString()}</span>}
                              {r.num_personas && <span>{r.num_personas} pasajero{r.num_personas !== 1 ? "s" : ""}</span>}
                              {r.monto_total > 0 && <span className="text-indigo-500 font-medium">${r.monto_total}</span>}
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getEstadoColor(r.estado)}`}>
                            {r.estado || "pendiente"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
