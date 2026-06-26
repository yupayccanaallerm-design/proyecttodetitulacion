import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { Search, ShieldCheck, Sparkles, Clock, RefreshCw, AlertCircle, TrendingUp, ArrowRight } from "lucide-react";

interface Paquete {
  id: number;
  nombre: string;
  descripcion_base: string;
  duracion_dias: number;
  perfil_usuario: string;
  precio_sugerido: number;
  tags: string[];
  rating: number;
  img: string;
}

export default function Paquetes() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerfil, setSelectedPerfil] = useState(t("paquetes_perfil_todos"));

  const perfiles = [t("paquetes_perfil_todos"), "Aventurero", "Familiar", "Cultural", "Trekking"];

  useEffect(() => {
    const obtenerPaquetesBD = async () => {
      try {
        setCargando(true);
        const res = await fetch(`http://localhost:8000/api/paquetes?lang=${i18n.language}`);
        
        if (!res.ok) {
          throw new Error("No se pudo obtener el catálogo de paquetes desde la base de datos.");
        }
        
        const data: any[] = await res.json();
        
        const paquetesFormateados = data.map((p, index) => {
          let rutaImagenReal = "";

          if (p.imagen_base64) {
            rutaImagenReal = p.imagen_base64;
          } else {
            rutaImagenReal = [
              "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1580619305218-8423a7f79b0f?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1610993302487-6dbfc0af4e37?auto=format&fit=crop&w=600&q=80",
              "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=600&q=80",
            ][index % 4];
          }

          return {
            id: p.id,
            nombre: p.nombre,
            descripcion_base: p.descripcion_base,
            duracion_dias: p.duracion_dias,
            perfil_usuario: p.perfil_usuario,
            precio_sugerido: p.precio_sugerido,
            img: rutaImagenReal,
            rating: parseFloat((4.6 + (index % 4) * 0.1).toFixed(1)),
            tags: [t("paquetes_tag_circuito"), p.perfil_usuario, t("tours_tag_dataset")]
          };
        });

        setPaquetes(paquetesFormateados);
        setError(null);
      } catch (err: any) {
        console.error("Error cargando paquetes:", err);
        setError(err.message || "Error al conectar con el servidor SGEV.");
      } finally {
        setCargando(false);
      }
    };

    obtenerPaquetesBD();
  }, []);

  const filteredPaquetes = paquetes.filter(paquete => {
    const matchesSearch = paquete.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPerfil = selectedPerfil === t("paquetes_perfil_todos") || paquete.perfil_usuario === selectedPerfil;
    return matchesSearch && matchesPerfil;
  });

  const recommended = paquetes.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-20 p-4 md:p-12">
      
      {/* HEADER */}
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
          {t("paquetes_badge")}
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-slate-900 mt-4 mb-6">
          {t("paquetes_titulo")} <span className="font-semibold text-indigo-600">{t("paquetes_titulo_highlight")}</span>
        </h1>

        <div className="relative max-w-2xl mx-auto mb-8 shadow-xs rounded-2xl">
          <Search className="absolute left-4 top-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={t("paquetes_buscar")}
            className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-slate-700 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTROS POR PERFIL */}
        <div className="flex flex-col gap-3.5 items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {perfiles.map(p => (
              <button
                key={p}
                onClick={() => setSelectedPerfil(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  selectedPerfil === p
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* CARGANDO */}
      {cargando && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <RefreshCw className="text-indigo-600 animate-spin" size={26} />
          <p className="text-xs text-slate-400 font-medium">{t("paquetes_cargando")}</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium mb-12">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p>{error} {t("paquetes_error_servidor")}</p>
        </div>
      )}

      {!cargando && !error && (
        <>
          {/* RECOMENDADOS TOP */}
          {searchTerm === "" && selectedPerfil === t("paquetes_perfil_todos") && recommended.length > 0 && (
            <div className="max-w-6xl mx-auto mb-14 bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-transparent p-6 rounded-2xl border border-indigo-100/60">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                  <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                  <span>{t("paquetes_destacados")}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {recommended.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/detalle-paquete/${r.id}`)}
                    className="bg-white hover:border-indigo-300 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 shadow-xs cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {r.nombre}
                    <span className="text-indigo-600 font-semibold">${r.precio_sugerido} USD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN GRID DE PAQUETES */}
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredPaquetes.length > 0 ? (
              filteredPaquetes.map((paquete) => (
                <div key={paquete.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">
                  
                  {/* IMAGEN */}
                  <div className="overflow-hidden relative h-52 bg-slate-200">
                    <img 
                      src={paquete.img} 
                      alt={paquete.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=600&q=80";
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider text-white uppercase">
                      ID: {paquete.id}
                    </span>
                  </div>

                  {/* CONTENIDO */}
                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-2.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <TrendingUp size={13} className="text-indigo-500" /> {t("paquetes_perfil")}: {paquete.perfil_usuario}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Sparkles size={12} className="text-amber-500" /> {t("paquetes_calificado")}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {paquete.nombre}
                      </h3>

                      <p className="text-xs text-slate-400 font-light leading-relaxed mb-4 line-clamp-2">
                        {paquete.descripcion_base}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-indigo-500" /> {paquete.duracion_dias} {t("paquetes_dias")}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {paquete.tags.map((tag, ti) => (
                          <span key={ti} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      {/* ACCIONES */}
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">{t("paquetes_precio")}</span>
                          <span className="text-lg font-bold text-slate-800">
                            ${paquete.precio_sugerido} <span className="text-xs font-light text-slate-400">USD</span>
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/reservas?package=${paquete.nombre}&price=${paquete.precio_sugerido}`)}
                            className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-xs font-medium tracking-wide hover:bg-indigo-700 transition shadow-xs cursor-pointer active:scale-95"
                          >
                            {t("paquetes_btn_reservar")}
                          </button>
                          <button
                            onClick={() => navigate(`/detalle-paquete/${paquete.id}`)}
                            className="bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition flex items-center gap-1 cursor-pointer"
                          >
                            {t("paquetes_btn_detalles")} <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        {t("tours_indexado")}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 text-slate-400 font-light text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                {t("paquetes_sin_resultados")}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}