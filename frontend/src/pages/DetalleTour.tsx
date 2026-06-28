import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, CheckCircle, ChevronLeft } from "lucide-react";

export default function DetalleTour() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/tours/${id}`)
      .then(res => res.json())
      .then(data => {
        setTour({
          ...data,
          itinerario: data.itinerario ? JSON.parse(data.itinerario) : [],
          inclusiones: data.inclusiones ? JSON.parse(data.inclusiones) : []
        });
      });
  }, [id]);

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        {t("tour_detalle.cargando")}
      </div>
    );
  }

  const goBack = () => navigate(-1);

  return (
    <div>

      {/* HERO */}
      <div className="relative h-[60vh]">
        <img
          src={tour.imagen_url || "/placeholder.jpg"}
          alt={tour.nombre}
          className="w-full h-full object-cover brightness-75"
        />

        <button
          onClick={goBack}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition"
        >
          <ChevronLeft />
        </button>

        <div className="absolute bottom-6 left-4 md:left-6 right-4 text-white">
          <p className="text-xs flex items-center gap-2">
            <MapPin size={14} />
            {tour.zona_geografica}
          </p>

          <h1 className="text-xl md:text-2xl font-bold mt-1">
            {tour.nombre}
          </h1>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto -mt-16 px-4 md:px-6 relative z-10">

        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-xl">

          {/* DESCRIPCIÓN */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-3">
              {t("tour_detalle.sobre")}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {tour.descripcion}
            </p>
          </section>

          {/* ITINERARIO */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-6">
              {t("tour_detalle.itinerario")}
            </h2>

            <div className="space-y-4">
              {tour.itinerario.map((item: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-slate-50 border"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    {index !== tour.itinerario.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 mt-2" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-800">
                      {item.titulo}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {item.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* INCLUSIONES */}
          <section>
            <h2 className="text-xl font-bold mb-6">
              {t("tour_detalle.incluye")}
            </h2>

            <div className="grid md:grid-cols-2 gap-3">
              {tour.inclusiones.map((inc: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl"
                >
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">
                    {inc.item}
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}