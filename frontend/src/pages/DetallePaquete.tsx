import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  CheckCircle,
  Calendar
} from "lucide-react";

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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [paquete, setPaquete] = useState<DetallePaquete | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerDetalleBD = async () => {
      try {
        setCargando(true);

        const res = await fetch(`http://localhost:8000/api/paquetes/${id}`);

        if (!res.ok) {
          throw new Error(t("paquete.errorFetch"));
        }

        const data = await res.json();
        setPaquete(data);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || t("paquete.errorServer"));
      } finally {
        setCargando(false);
      }
    };

    if (id) obtenerDetalleBD();
  }, [id, t]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-600 font-medium">
        {t("paquete.cargando")}
      </div>
    );
  }

  if (error || !paquete) {
    return (
      <div className="max-w-md mx-auto text-center mt-20">
        <h2 className="text-xl font-bold text-red-600">
          {t("paquete.errorTitulo")}
        </h2>
        <p className="text-slate-500 mt-2">
          {error || t("paquete.noExiste")}
        </p>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-indigo-700 transition"
        >
          <ArrowLeft size={14} />
          {t("paquete.volver")}
        </button>
      </div>
    );
  }

  const imagenPortada =
    paquete.imagen_base64 ||
    "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">

      {/* BOTÓN VOLVER */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600"
      >
        <ArrowLeft size={14} />
        {t("paquete.volverCatalogo")}
      </button>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

        {/* IZQUIERDA */}
        <div className="lg:col-span-2 space-y-6">

          {/* BANNER */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            <div className="h-64 md:h-80 w-full">
              <img
                src={imagenPortada}
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1508849789987-4e5333c12b78?auto=format&fit=crop&w=1200&q=80")
                }
              />
            </div>

            <div className="p-6">
              <span className="text-xs font-bold text-indigo-600">
                ID: {paquete.id}
              </span>

              <h1 className="text-2xl font-bold mt-2">
                {paquete.nombre}
              </h1>

              <p className="text-sm text-slate-500 mt-2">
                {paquete.descripcion_base}
              </p>
            </div>
          </div>

          {/* ITINERARIO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-4">
              <Sparkles size={18} className="text-indigo-600" />
              {t("paquete.circuito")}
            </div>

            {paquete.tours?.length > 0 ? (
              <div className="space-y-6 border-l border-indigo-100 pl-4">
                {paquete.tours.map((tour, i) => (
                  <div key={tour.id} className="relative">

                    <span className="absolute -left-6 top-0 bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {tour.orden_dia || i + 1}
                    </span>

                    <h3 className="font-semibold text-sm">
                      {tour.nombre}
                    </h3>

                    <p className="text-xs text-slate-400">
                      {tour.descripcion}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                {t("paquete.sinTours")}
              </p>
            )}
          </div>
        </div>

        {/* DERECHA */}
        <aside>
          <div className="bg-white p-6 rounded-2xl border border-indigo-100 sticky top-6">

            <p className="text-xs font-bold text-indigo-600 uppercase">
              {t("paquete.inversion")}
            </p>

            <h2 className="text-3xl font-black mt-2">
              ${paquete.precio_sugerido}
            </h2>

            <p className="text-xs text-slate-400">
              {t("paquete.porPersona")}
            </p>

            <div className="mt-4 space-y-2 text-xs text-slate-600">

              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                {t("paquete.incluye1")}
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-green-500" />
                {t("paquete.incluye2")}
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-green-500" />
                {t("paquete.incluye3")}
              </div>

            </div>

            <button
              onClick={() =>
                navigate(
                  `/reservas?package=${encodeURIComponent(paquete.nombre)}&price=${paquete.precio_sugerido}&id=${paquete.id}&duracion=${paquete.duracion_dias}+días`
                )
              }
              className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              {t("paquete.reservar")}
            </button>

            <div className="mt-4 text-[10px] text-slate-400 flex items-center gap-2">
              <ShieldCheck size={12} />
              {t("paquete.seguridad")}
            </div>

          </div>
        </aside>

      </main>
    </div>
  );
}