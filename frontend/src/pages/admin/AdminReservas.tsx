import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FolderHeart,
  Check,
  X,
  Sparkles,
  Eye,
  Calendar,
  User,
  MapPin,
  RefreshCw,
  AlertCircle,
  Phone,
  Mail,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
  Send
} from "lucide-react";

interface Reserva {
  id: number;
  paquete_id: string;
  paquete_nombre: string;
  precio_referencial: number;
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  fecha_viaje: string;
  numero_pasajeros: number;
  comentarios: string;
  tipo: string;
  duracion: string;
  fecha_solicitud: string;
  estado?: string;
}

export default function AdminReservas() {
  const { t, i18n } = useTranslation();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [expandidos, setExpandidos] = useState<number[]>([]);
  const [actualizando, setActualizando] = useState(false);

  const cargarReservas = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/reservas");
      if (!response.ok) throw new Error("Error cargando reservas");
      const data = await response.json();
      setReservas(data.reservas || []);
    } catch (err) {
      console.error("Error:", err);
      setError(t("admin_reservas_error"));
    } finally {
      setLoading(false);
    }
  };

  const marcarNotificado = async (id: number) => {
    setActualizando(true);
    try {
      alert(t("admin_reservas_notificada_msg", { id }));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setActualizando(false);
    }
  };

  const toggleExpandir = (id: number) => {
    setExpandidos(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => { cargarReservas(); }, []);

  const filtros = [
    { key: "Todos",     label: t("admin_reservas_filtro_todos") },
    { key: "Pendiente", label: t("admin_reservas_filtro_pendiente") },
    { key: "Notificada",label: t("admin_reservas_filtro_notificada") },
  ];

  const reservasFiltradas = reservas.filter(res => {
    if (filtro === "Todos") return true;
    if (filtro === "Pendiente") return !res.estado || res.estado === "pendiente";
    if (filtro === "Notificada") return res.estado === "notificada";
    return true;
  });

  const getEstadoColor = (estado?: string) => {
    if (!estado || estado === "pendiente") return "bg-amber-100 text-amber-700 border-amber-200";
    if (estado === "notificada") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getEstadoLabel = (estado?: string) => {
    if (!estado || estado === "pendiente") return t("admin_reservas_pendiente_badge");
    if (estado === "notificada") return t("admin_reservas_notificada_badge");
    return estado;
  };

  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">{t("admin_reservas_cargando")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto mb-10 animate-fadeIn">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="text-indigo-600" size={22} />
            {t("admin_reservas_titulo")}
          </h1>
          <p className="text-xs text-slate-400 font-light mt-0.5">
            {t("admin_reservas_registradas", { count: reservas.length })} •{" "}
            {t("admin_reservas_pendientes", { count: reservas.filter(r => !r.estado || r.estado === "pendiente").length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/40">
            {filtros.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  filtro === key
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={cargarReservas}
            className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
            title={t("admin_reservas_actualizar")}
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-600 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-3">
        {reservasFiltradas.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-12 text-center">
            <FolderHeart className="mx-auto text-slate-300" size={48} />
            <p className="text-slate-400 font-light mt-4">{t("admin_reservas_sin_reservas")}</p>
          </div>
        ) : (
          reservasFiltradas.map((res) => (
            <div key={res.id} className="bg-white border border-slate-200/60 rounded-2xl shadow-xs hover:shadow-sm transition-all overflow-hidden">
              <div
                className="p-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => toggleExpandir(res.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                    #{res.id}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 truncate">{res.nombre_cliente}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getEstadoColor(res.estado)}`}>
                        {getEstadoLabel(res.estado)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {res.paquete_nombre}</span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(res.fecha_viaje).toLocaleDateString(locale)}</span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-300" />
                      <span className="flex items-center gap-1"><User size={12} /> {res.numero_pasajeros} {t("admin_reservas_pasajeros")}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(!res.estado || res.estado === "pendiente") && (
                    <button
                      onClick={(e) => { e.stopPropagation(); marcarNotificado(res.id); }}
                      disabled={actualizando}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Send size={12} /> {t("admin_reservas_notificar")}
                    </button>
                  )}
                  <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-all">
                    {expandidos.includes(res.id) ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                </div>
              </div>

              {expandidos.includes(res.id) && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("admin_reservas_datos_cliente")}</h4>
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-sm font-medium text-slate-800">{res.nombre_cliente}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5"><Mail size={12} /> {res.email_cliente}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5"><Phone size={12} /> {res.telefono_cliente}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("admin_reservas_detalles_paquete")}</h4>
                    <div className="bg-slate-50 rounded-xl p-3 space-y-1.5">
                      <p className="text-sm font-medium text-slate-800">{res.paquete_nombre}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(res.fecha_viaje).toLocaleDateString(locale)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-1"><User size={12} /> {res.numero_pasajeros} {t("admin_reservas_pasajeros")}</span>
                        {res.tipo && (
                          <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="flex items-center gap-1"><Building2 size={12} /> {res.tipo}</span></>
                        )}
                        {res.duracion && (
                          <><span className="w-1 h-1 rounded-full bg-slate-300" /><span className="flex items-center gap-1"><Clock size={12} /> {res.duracion}</span></>
                        )}
                      </div>
                      {res.precio_referencial > 0 && (
                        <p className="text-xs text-indigo-600 font-bold">
                          {t("admin_reservas_precio_ref")}: ${res.precio_referencial} USD
                        </p>
                      )}
                      {res.comentarios && (
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t("admin_reservas_comentarios")}</p>
                          <p className="text-xs text-slate-600">{res.comentarios}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 text-[10px] text-slate-400 text-right border-t border-slate-100 pt-2">
                    {t("admin_reservas_solicitado")}: {res.fecha_solicitud ? new Date(res.fecha_solicitud).toLocaleString(locale) : t("admin_reservas_fecha_nd")}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
