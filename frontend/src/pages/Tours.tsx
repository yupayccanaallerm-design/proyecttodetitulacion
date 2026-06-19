import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, ShieldCheck, Sparkles, Clock, Users as UsersIcon, RefreshCw, AlertCircle } from "lucide-react";

interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
  descripcion: string;
  estado: number;
  imagen_url?: string;
  price: number;
  duration: string;
  groupSize: string;
  rating: number;
  tags: string[];
  img: string;
}

export default function Tours() {
  const navigate = useNavigate();

  const [tours, setTours] = useState<Tour[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZona, setSelectedZona] = useState("Todas");

  const zonas = ["Todas", "Cusco Ciudad", "Valle Sagrado", "Machu Picchu", "Rutas Sur"];

  useEffect(() => {
    const obtenerToursBD = async () => {
      try {
        setCargando(true);
        const res = await fetch("http://localhost:8000/api/tours");
        
        if (!res.ok) {
          throw new Error("No se pudo obtener el catálogo de atractivos desde la base de datos.");
        }
        
        const data: any[] = await res.json();
        
        const toursFormateados = data.map((t, index) => {
          let rutaImagenReal = "";

          if (t.imagen_url) {
            // Corrección: Comentarios JS válidos. Limpiamos posibles barras al concatenar
            
            rutaImagenReal = t.imagen_url;
          } else {
            // Si el registro no tiene imagen, se aplica el carrusel de respaldo
            rutaImagenReal = [
              "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
              "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
              "https://images.unsplash.com/photo-1614918236617-6d1e09d6efb0",
              "https://images.unsplash.com/photo-1590050751117-238cb0ffaa28",
            ][index % 4];
          }

          return {
            id: t.id,
            nombre: t.nombre,
            zona_geografica: t.zona_geografica,
            descripcion: t.descripcion,
            estado: t.estado,
            img: rutaImagenReal, 
            price: [45, 60, 85, 120, 35][index % 5], 
            duration: index % 2 === 0 ? "1 día" : "Medio día",
            groupSize: "Hasta 12",
            rating: parseFloat((4.5 + (index % 5) * 0.1).toFixed(1)),
            tags: ["Operativo SGEV", t.zona_geografica, "Dataset Activo"]
          };
        });

        setTours(toursFormateados);
        setError(null);
      } catch (err: any) {
        console.error("Error cargando experiencias:", err);
        setError(err.message || "Error al conectar con el servidor SGEV.");
      } finally {
        setCargando(false);
      }
    };

    obtenerToursBD();
  }, []);

  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZona = selectedZona === "Todas" || tour.zona_geografica === selectedZona;
    return matchesSearch && matchesZona;
  });

  const recommended = tours.slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-20 p-4 md:p-12">
      
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
          SGEV · Base de Datos Hostinger Activa
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-slate-900 mt-4 mb-6">
          Mis Atractivos <span className="font-semibold text-indigo-600">Indexados</span>
        </h1>

        <div className="relative max-w-2xl mx-auto mb-8 shadow-xs rounded-2xl">
          <Search className="absolute left-4 top-4 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Busca en tus atractivos reales (Ej. Ollantaytambo, Qorikancha...)"
            className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-slate-700 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-3.5 items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {zonas.map(z => (
              <button
                key={z}
                onClick={() => setSelectedZona(z)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  selectedZona === z
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>
      </header>

      {cargando && (
        <div className="flex flex-col items-center justify-center py-24 space-y-3">
          <RefreshCw className="text-indigo-600 animate-spin" size={26} />
          <p className="text-xs text-slate-400 font-medium">Sincronizando catálogo con base de datos remota...</p>
        </div>
      )}

      {error && (
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 p-4 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium mb-12">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p>{error} Verifica que tu servidor FastAPI local en el puerto 8000 esté encendido.</p>
        </div>
      )}

      {!cargando && !error && (
        <>
          {searchTerm === "" && selectedZona === "Todas" && recommended.length > 0 && (
            <div className="max-w-6xl mx-auto mb-14 bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-transparent p-6 rounded-2xl border border-indigo-100/60">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
                  <Sparkles size={16} className="text-indigo-600 animate-pulse" />
                  <span>Nodos Recientes en tu Red SGEV</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {recommended.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/reservas?tour=${r.nombre}&price=${r.price}`)}
                    className="bg-white hover:border-indigo-300 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 shadow-xs cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {r.nombre}
                    <span className="text-indigo-600 font-semibold">${r.price} USD</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => (
                <div key={tour.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">

                  <div className="overflow-hidden relative h-52 bg-slate-200">
                    <img 
                      src={tour.img} // Aquí tour.img ya debe ser el string "data:image/jpeg;base64,..."
                      alt={tour.nombre}
                      className="..."
                      onError={(e) => {
                        // Si falla, pone la imagen de respaldo
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1587595431973-160d0d94add1";
                      }}
                    />
                    <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider text-white uppercase">
                      ID: {tour.id}
                    </span>
                  </div>

                  <div className="p-6 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-center text-xs text-slate-400 mb-2.5">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <MapPin size={13} className="text-indigo-500" /> {tour.zona_geografica}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Star size={12} className="fill-amber-500 text-amber-500" /> {tour.rating}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mb-1.5 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {tour.nombre}
                      </h3>

                      <p className="text-xs text-slate-400 font-light leading-relaxed mb-4 line-clamp-2">
                        {tour.descripcion}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium mb-4">
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-indigo-500" /> {tour.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <UsersIcon size={12} className="text-indigo-500" /> {tour.groupSize}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {tour.tags.map((tag, ti) => (
                          <span key={ti} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Precio Inversión</span>
                          <span className="text-lg font-bold text-slate-800">
                            ${tour.price} <span className="text-xs font-light text-slate-400">USD</span>
                          </span>
                        </div>

                        <button
                          onClick={() => navigate(`/reservas?tour=${tour.nombre}&price=${tour.price}`)}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium tracking-wide hover:bg-indigo-700 transition shadow-xs cursor-pointer active:scale-95"
                        >
                          Reservar
                        </button>
                        <button
                          onClick={() => navigate(`/detalle/${tour.id}`)}
                          className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium hover:bg-slate-50 transition"
                        >
                          Ver Detalles
                        </button>
                      </div>

                      <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
                        <ShieldCheck size={13} className="text-emerald-500" />
                        Indexado en u796907883_agenciaGTP
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-24 text-slate-400 font-light text-sm bg-white rounded-2xl border border-dashed border-slate-200">
                Aún no has registrado atractivos para este circuito en tu panel administrativo.
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
}