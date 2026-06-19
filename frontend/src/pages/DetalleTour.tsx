import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MapPin, CheckCircle, Clock, ChevronLeft } from "lucide-react";

export default function DetalleTour() {
  const { id } = useParams();
  const [tour, setTour] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/tours/${id}`)
      .then(res => res.json())
      .then(data => {
        setTour({
          ...data,
          itinerario: data.itinerario ? JSON.parse(data.itinerario) : [],
          inclusiones: data.inclusiones ? JSON.parse(data.inclusiones) : []
        });
      });
  }, [id]);

  if (!tour) return <div className="flex h-screen items-center justify-center">Cargando experiencia...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in duration-500">
      {/* Hero Image Section */}
      <div className="relative h-[400px] w-full">
        <img 
          src={tour.imagen_url || "/placeholder.jpg"} 
          alt={tour.nombre}
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute top-6 left-6">
          <button onClick={() => window.history.back()} className="bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-white/40 transition">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="absolute bottom-10 left-10 text-white">
          <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">{tour.zona_geografica}</span>
          <h1 className="text-5xl font-extrabold mt-2">{tour.nombre}</h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto -mt-16 px-6 relative z-10">
        <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/60">
          
          {/* Descripción */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Sobre este destino</h2>
            <p className="text-slate-600 leading-relaxed">{tour.descripcion}</p>
          </section>

          {/* Itinerario Moderno */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Itinerario Detallado</h2>
            <div className="space-y-4">
              {tour.itinerario.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    {index !== tour.itinerario.length - 1 && <div className="w-0.5 h-full bg-slate-200 mt-2"></div>}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.titulo}</h3>
                    <p className="text-sm text-slate-500">{item.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Inclusiones */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-6">¿Qué incluye?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tour.inclusiones.map((inc: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 rounded-xl">
                  <CheckCircle size={18} />
                  <span className="text-sm font-medium">{inc.item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}