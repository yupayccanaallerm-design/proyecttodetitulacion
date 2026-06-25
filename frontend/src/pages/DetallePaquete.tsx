import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, TrendingUp, ShieldCheck, RefreshCw, AlertCircle, Sparkles, CheckCircle, Calendar } from "lucide-react";

interface TourVinculado {
  id: number;
  nombre: string;
  zona_geografica: string;
  descripcion: string;
  orden_dia: number;
}

interface DetallePaquete {
  id: number;
  nombre: string;
  descripcion_base: string;
  duracion_dias: number;
  perfil_usuario: string;
  precio_sugerido: number;
  imagen_base64?: string;
  tours: TourVinculado[];
}

export default function DetallePaquete() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paquete, setPaquete] = useState<DetallePaquete | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerDetalleBD = async () => {
      try {
        setCargando(true);
        // Llamada al endpoint específico de tu servidor FastAPI
        const res = await fetch(`http://localhost:8000/api/paquetes/${id}`);
        
        if (!res.ok) {
          throw new Error("No se pudo obtener la información detallada del paquete.");
        }
        
        const data = await res.json();
        setPaquete(data);
        setError(null);
      } catch (err: any) {
        console.error("Error cargando detalle del paquete:", err);
        setError(err.message || "Error de comunicación con el servidor SGEV.");
      } finally {
        setCargando(false);
      }
    };

    if (id) obtenerDetalleBD();
  }, [id]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="text-indigo-600 animate-spin" size={30} />
        <p className="text-xs text-slate-400 font-medium tracking-wide">Desencriptando nodos del circuito integral...</p>
      </div>
    );
  }

  if (error || !paquete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-red-100 p-6 rounded-2xl shadow-xs text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-800 mb-2">Error de Sincronización</p>
          <p className="text-xs text-slate-400 mb-6">{error || "El paquete solicitado no existe en Hostinger."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition"
          >
            <ArrowLeft size={14} /> Volver al catálogo
          </button>
        </div>
      </div>
    );
  }

  // Imagen fallback por si no tiene tours asociados todavía
  const imagenPortada = paquete.imagen_base64 || "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-24">
      
      {/* BOTÓN VOLVER FLOTANTE O SUPERIOR */}
      <div className="max-w-5xl mx-auto pt-6 px-4 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-2 rounded-xl transition shadow-xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Regresar a Paquetes
        </button>
      </div>

      <main className="max-w-5xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUMNA IZQUIERDA: CONTENIDO PRINCIPAL (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BANNER PRINCIPAL DE LA EXPERIENCIA */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs">
            <div className="h-64 md:h-80 w-full bg-slate-200 relative">
              <img 
                src={imagenPortada} 
                alt={paquete.nombre} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
              <span className="absolute bottom-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-sm">
                ID Pack: {paquete.id}
              </span>
            </div>

            <div className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                  <TrendingUp size={13} /> {paquete.perfil_usuario}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  <Clock size={13} /> {paquete.duracion_dias} {paquete.duracion_dias === 1 ? 'Día' : 'Días'}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                {paquete.nombre}
              </h1>

              <p className="text-sm text-slate-500 font-light leading-relaxed whitespace-pre-line">
                {paquete.descripcion_base}
              </p>
            </div>
          </div>

          {/* CRONOGRAMA / ITINERARIO DE ATRACTIVOS VINCULADOS */}
          <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-6 pb-3 border-b border-slate-100">
              <Sparkles size={18} className="text-indigo-600" />
              <h2>Circuito Cronológico de Atractivos</h2>
            </div>

            {paquete.tours && paquete.tours.length > 0 ? (
              <div className="relative border-l border-indigo-100 ml-3 space-y-8 py-2">
                {paquete.tours.map((tour, index) => (
                  <div key={tour.id} className="relative pl-6 group">
                    {/* Indicador del Día */}
                    <span className="absolute -left-3 top-0.5 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-indigo-50 group-hover:scale-110 transition-transform">
                      {tour.orden_dia || index + 1}
                    </span>
                    
                    <div>
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                          {tour.nombre}
                        </h3>
                        <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
                          {tour.zona_geografica}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">
                        {tour.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 font-light border border-dashed border-slate-200 rounded-xl">
                No hay atractivos específicos asignados a la ruta de este paquete todavía.
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: CAJA DE RESERVA / RESUMEN (1/3) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-indigo-100 shadow-xs sticky top-6">
            <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              Inversión Total Cotizada
            </span>
            
            <div className="mt-2 mb-6">
              <span className="text-3xl font-black text-slate-950">${paquete.precio_sugerido}</span>
              <span className="text-xs font-light text-slate-400 ml-1">USD por persona</span>
            </div>

            <div className="space-y-3 mb-6 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Entradas e ingresos incluidos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-emerald-500" />
                <span>Guiado en idioma nativo/inglés</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-emerald-500" />
                <span>Salidas diarias programadas</span>
              </div>
            </div>

            <button
              onClick={() => navigate(`/reservas?package=${paquete.nombre}&price=${paquete.precio_sugerido}`)}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold tracking-wide hover:bg-indigo-700 transition shadow-xs active:scale-98 cursor-pointer text-center block mb-4"
            >
              Proceder a la Reserva
            </button>

            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-light">
              <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
              <span>Verificación de redundancia completa en u796907883_agenciaGTP</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}