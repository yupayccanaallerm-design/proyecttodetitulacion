import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import {
  Search, MapPin, Star, ShieldCheck, Clock,
  Users, RefreshCw, AlertCircle, ArrowRight, SlidersHorizontal
} from "lucide-react";

interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
  descripcion: string;
  estado: number;
  imagen_url?: string;
  price: number;
  duration: string;
  rating: number;
  img: string;
}

const ZONAS = ["Cusco Ciudad", "Valle Sagrado", "Machu Picchu", "Rutas Sur"];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1614918236617-6d1e09d6efb0?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1590050751117-238cb0ffaa28?auto=format&fit=crop&w=600&q=80",
];

export default function Tours() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [tours, setTours] = useState<Tour[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZona, setSelectedZona] = useState<string | null>(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        setCargando(true);
        const res = await fetch(`/api/tours?lang=${i18n.language}`);
        if (!res.ok) throw new Error("No se pudo obtener el catálogo de tours.");
        const data: any[] = await res.json();

        setTours(
          data.map((item, index) => ({
            id: item.id,
            nombre: item.nombre,
            zona_geografica: item.zona_geografica,
            descripcion: item.descripcion,
            estado: item.estado,
            img: item.imagen_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
            price: [45, 60, 85, 120, 35][index % 5],
            duration: index % 2 === 0 ? t("tours_duracion_dia") : t("tours_duracion_medio"),
            rating: parseFloat((4.5 + (index % 5) * 0.1).toFixed(1)),
          }))
        );
        setError(null);
      } catch (err: any) {
        setError(err.message || "Error al conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    fetchTours();
  }, []);

  const filtered = tours.filter((tour) => {
    const matchSearch = tour.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchZona = !selectedZona || tour.zona_geografica === selectedZona;
    return matchSearch && matchZona;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-slate-100 pt-8 pb-8 md:pt-10 md:pb-10 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            {t("tours_badge")}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-3 mb-1">
            {t("tours_titulo")}{" "}
            <span className="text-indigo-600">{t("tours_titulo_highlight")}</span>
          </h1>
          <p className="text-sm text-slate-500 mb-7 font-light">
            Explora los destinos más emblemáticos de Cusco y la región.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t("tours_buscar")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 py-2.5 pl-10 pr-4 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition text-slate-700 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <button
                onClick={() => setSelectedZona(null)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  !selectedZona
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {t("tours_zona_todas")}
              </button>
              {ZONAS.map((zona) => (
                <button
                  key={zona}
                  onClick={() => setSelectedZona(zona === selectedZona ? null : zona)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedZona === zona
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {zona}
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
            <p className="text-sm text-slate-400">{t("tours_cargando")}</p>
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
              {filtered.length} {filtered.length === 1 ? "destino" : "destinos"} encontrados
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.length > 0 ? (
                filtered.map((tour) => (
                  <article
                    key={tour.id}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group"
                  >
                    <div className="relative h-48 bg-slate-200 overflow-hidden">
                      <img
                        src={tour.img}
                        alt={tour.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                      <span className="absolute top-3 left-3 bg-white/95 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-lg">
                        ID {tour.id}
                      </span>
                      <span className="absolute top-3 right-3 bg-white/95 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star size={10} className="fill-amber-500 text-amber-500" />
                        {tour.rating}
                      </span>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-2">
                        <MapPin size={11} className="text-indigo-400" />
                        {tour.zona_geografica}
                      </div>

                      <h3 className="text-[15px] font-bold text-slate-900 mb-2 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {tour.nombre}
                      </h3>

                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2 flex-1">
                        {tour.descripcion}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-indigo-400" />
                          {tour.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users size={11} className="text-indigo-400" />
                          {t("tours_grupo")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{t("tours_precio")}</p>
                          <p className="text-xl font-black text-slate-900">
                            ${tour.price}
                            <span className="text-xs font-normal text-slate-400 ml-1">USD</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/detalle/${tour.id}`)}
                            title="Ver detalle"
                            className="p-2 border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                          >
                            <ArrowRight size={14} />
                          </button>
                          <button
                            onClick={() => navigate(`/reservas?tour=${tour.nombre}&price=${tour.price}`)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 transition cursor-pointer"
                          >
                            {t("tours_btn_reservar")}
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
                  <p className="text-sm text-slate-400 font-medium">{t("tours_sin_resultados")}</p>
                  <button
                    onClick={() => { setSearchTerm(""); setSelectedZona(null); }}
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
