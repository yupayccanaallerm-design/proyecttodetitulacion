import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Search, ShieldCheck, Clock, RefreshCw, AlertCircle,
  ArrowRight, SlidersHorizontal, Tag, Calendar
} from "lucide-react";

interface Paquete {
  id: number;
  nombre: string;
  descripcion_base: string;
  duracion_dias: number;
  perfil_usuario: string;
  precio_sugerido: number;
  img: string;
}

const PERFILES = ["Aventurero", "Familiar", "Cultural", "Trekking"];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1580619305218-8423a7f79b0f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1610993302487-6dbfc0af4e37?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80",
];

export default function Paquetes() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerfil, setSelectedPerfil] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaquetes = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/paquetes?lang=${i18n.language}`);
        if (!res.ok) throw new Error("No se pudo obtener el catálogo de paquetes.");
        const data: any[] = await res.json();

        setPaquetes(
          data.map((p, index) => ({
            id: p.id,
            nombre: p.nombre,
            descripcion_base: p.descripcion_base,
            duracion_dias: p.duracion_dias,
            perfil_usuario: p.perfil_usuario,
            precio_sugerido: p.precio_sugerido,
            img: p.imagen_base64 || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
          }))
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    fetchPaquetes();
  }, []);

  const filtered = paquetes.filter((p) => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPerfil = !selectedPerfil || p.perfil_usuario === selectedPerfil;
    return matchSearch && matchPerfil;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-100 pt-8 pb-8 md:pt-10 md:pb-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            {t("paquetes_badge")}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-3 mb-1">
            {t("paquetes_titulo")}{" "}
            <span className="text-indigo-600">{t("paquetes_titulo_highlight")}</span>
          </h1>
          <p className="text-sm text-slate-500 mb-7 font-light">
            Itinerarios curados para cada tipo de viajero.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t("paquetes_buscar")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-slate-700 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <button
                onClick={() => setSelectedPerfil(null)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !selectedPerfil
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {t("paquetes_perfil_todos")}
              </button>
              {PERFILES.map((perfil) => (
                <button
                  key={perfil}
                  onClick={() => setSelectedPerfil(perfil === selectedPerfil ? null : perfil)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedPerfil === perfil
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {perfil}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {cargando && (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <RefreshCw className="text-indigo-500 animate-spin" size={22} />
            <p className="text-sm text-slate-400">{t("paquetes_cargando")}</p>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {!cargando && !error && (
          <>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              {filtered.length} {filtered.length === 1 ? "paquete" : "paquetes"} disponibles
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length > 0 ? (
                filtered.map((paquete) => (
                  <article
                    key={paquete.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      <img
                        src={paquete.img}
                        alt={paquete.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      <span className="absolute top-3 left-3 bg-white/95 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                        ID {paquete.id}
                      </span>
                      <span className="absolute top-3 right-3 bg-white/95 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Tag size={9} />
                        {paquete.perfil_usuario}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {paquete.nombre}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2 flex-1">
                        {paquete.descripcion_base}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-indigo-400" />
                          {paquete.duracion_dias} {t("paquetes_dias")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={11} className="text-indigo-400" />
                          {t("paquetes_calificado")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t("paquetes_precio")}</p>
                          <p className="text-xl font-black text-slate-900">
                            ${paquete.precio_sugerido}
                            <span className="text-xs font-normal text-slate-400 ml-1">USD</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/detalle-paquete/${paquete.id}`)}
                            title="Ver detalle"
                            className="p-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/reservas?package=${paquete.nombre}&price=${paquete.precio_sugerido}`)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                          >
                            {t("paquetes_btn_reservar")}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3 text-[10px] text-slate-400">
                        <ShieldCheck size={10} className="text-emerald-500" />
                        {t("tours_indexado")}
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
                  <Search size={28} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">{t("paquetes_sin_resultados")}</p>
                  <button
                    onClick={() => { setSearchTerm(""); setSelectedPerfil(null); }}
                    className="mt-4 text-xs text-indigo-600 hover:underline cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
