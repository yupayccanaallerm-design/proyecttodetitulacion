import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star, ShieldCheck, Sparkles, Clock, Users as UsersIcon } from "lucide-react";

export default function Tours() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Todas");
  const [difficulty, setDifficulty] = useState("Todas");

  const provinces = ["Todas", "Cusco", "Urubamba", "Canchis", "Anta", "Calca", "La Convención"];
  const difficulties = ["Todas", "Fácil", "Moderada", "Alta"];

  const [tours] = useState([
    {
      name: "Machu Picchu",
      province: "Urubamba",
      desc: "Experiencia completa con guía certificado, traslados en tren y tickets de ingreso incluidos.",
      price: 120,
      duration: "1 día",
      groupSize: "Hasta 12",
      difficulty: "Moderada",
      img: "https://images.unsplash.com/photo-1587595431973-160d0d94add1",
      rating: 4.9,
      tags: ["Patrimonio Mundial", "Tren incluido", "Guía certificado"]
    },
    {
      name: "Valle Sagrado",
      province: "Urubamba",
      desc: "Descubre la magia ancestral de Pisac, Ollantaytambo y sumérgete en la cultura viva local.",
      price: 80,
      duration: "1 día",
      groupSize: "Hasta 16",
      difficulty: "Fácil",
      img: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2",
      rating: 4.8,
      tags: ["Cultura viva", "Mercados locales", "Almuerzo incluido"]
    },
    {
      name: "Montaña de 7 Colores",
      province: "Canchis",
      desc: "Un fascinante reto físico a través de paisajes altoandinos situados a más de 5,000 msnm.",
      price: 60,
      duration: "1 día",
      groupSize: "Hasta 14",
      difficulty: "Alta",
      img: "https://images.unsplash.com/photo-1614918236617-6d1e09d6efb0",
      rating: 4.7,
      tags: ["Trekking", "Paisaje andino", "Alta montaña"]
    },
    {
      name: "Salineras de Maras",
      province: "Urubamba",
      desc: "Camina junto a cientos de pozas de sal ancestrales y terrazas agrícolas únicas en el mundo.",
      price: 45,
      duration: "Medio día",
      groupSize: "Hasta 16",
      difficulty: "Fácil",
      img: "https://images.unsplash.com/photo-1590050751117-238cb0ffaa28",
      rating: 4.6,
      tags: ["Fotografía", "Agricultura ancestral", "Corta duración"]
    },
    {
      name: "City Tour Cusco",
      province: "Cusco",
      desc: "Recorre Sacsayhuamán, Qorikancha y el Centro Histórico con un guía especializado en historia inca y colonial.",
      price: 35,
      duration: "Medio día",
      groupSize: "Hasta 20",
      difficulty: "Fácil",
      img: "https://images.unsplash.com/photo-1531065208531-4036c0dba3ca",
      rating: 4.7,
      tags: ["Historia", "Centro histórico", "Ideal primer día"]
    },
    {
      name: "Laguna Humantay",
      province: "La Convención",
      desc: "Una caminata exigente hacia una laguna glaciar de aguas turquesas a más de 4,200 msnm.",
      price: 55,
      duration: "1 día",
      groupSize: "Hasta 10",
      difficulty: "Alta",
      img: "https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c",
      rating: 4.8,
      tags: ["Trekking", "Naturaleza", "Alta exigencia física"]
    }
  ]);

  // 🔍 FILTRADO DE EXPERIENCIAS
  const filteredTours = tours.filter(tour => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvince = selectedProvince === "Todas" || tour.province === selectedProvince;
    const matchesDifficulty = difficulty === "Todas" || tour.difficulty === difficulty;

    return matchesSearch && matchesProvince && matchesDifficulty;
  });

  // 🤖 RECOMENDACIÓN INTELIGENTE (IA BASE)
  const recommended = tours
    .filter(t => t.difficulty === "Fácil")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-20 p-4 md:p-12">
      
      {/* HEADER / CONTROL DE BÚSQUEDA */}
      <header className="max-w-4xl mx-auto mb-16 text-center">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
          SGEV · Experiencias de Destino
        </span>
        <h1 className="text-3xl md:text-5xl font-light tracking-tight text-slate-900 mt-4 mb-6">
          Explora tu próxima <span className="font-semibold text-indigo-600">aventura</span>
        </h1>

        {/* CONTENEDOR BUSCADOR */}
        <div className="relative max-w-2xl mx-auto mb-8 shadow-sm rounded-2xl">
          <Search className="absolute left-4 top-4.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Busca destinos (Ej. Machu Picchu, Valle Sagrado...)"
            className="w-full bg-white border border-slate-200/80 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition text-slate-700 text-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTROS: PROVINCIAS */}
        <div className="flex flex-col gap-3.5 items-center justify-center">
          <div className="flex flex-wrap justify-center gap-2">
            {provinces.map(p => (
              <button
                key={p}
                onClick={() => setSelectedProvince(p)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  selectedProvince === p
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-slate-600 border border-slate-200/60 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* FILTROS: DIFICULTAD */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-xs font-medium text-slate-400 self-center mr-2">Dificultad:</span>
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1 rounded-full text-xs transition-all duration-200 cursor-pointer ${
                  difficulty === d
                    ? "bg-slate-800 text-white"
                    : "bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-100"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* 🤖 SECCIÓN RECOMENDADOS POR IA */}
      {searchTerm === "" && selectedProvince === "Todas" && (
        <div className="max-w-6xl mx-auto mb-14 bg-gradient-to-r from-indigo-50/40 via-purple-50/20 to-transparent p-6 rounded-2xl border border-indigo-100/60">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2 text-indigo-700 font-medium text-sm">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
              <span>Recomendados para empezar</span>
            </div>
            <button
              onClick={() => navigate("/planificador")}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors underline-offset-2 hover:underline cursor-pointer"
            >
              Personalizar con el Planificador IA →
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {recommended.map((r, i) => (
              <div
                key={i}
                onClick={() => navigate(`/reservas?tour=${r.name}&price=${r.price}`)}
                className="bg-white hover:border-indigo-300 border border-slate-200/80 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 shadow-xs cursor-pointer flex items-center gap-3 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                {r.name}
                <span className="text-indigo-600 font-semibold">${r.price} USD</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* GRID DE TOURS PRINCIPAL */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {filteredTours.length > 0 ? (
          filteredTours.map((tour, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col group">

              {/* CONTENEDOR IMAGEN CON EFECTO HOVER */}
              <div className="overflow-hidden relative h-52 bg-slate-200">
                <div
                  className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tour.img})` }}
                />
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider text-slate-700 uppercase">
                  {tour.difficulty}
                </span>
              </div>

              {/* CONTENIDO DE LA TARJETA */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                <div>
                  {/* Meta información */}
                  <div className="flex justify-between items-center text-xs text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1 font-light">
                      <MapPin size={13} className="text-indigo-500" /> {tour.province}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star size={12} className="fill-amber-500 text-amber-500" /> {tour.rating}
                    </span>
                  </div>

                  {/* Nombre del Tour */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {tour.name}
                  </h3>

                  {/* Descripción corta */}
                  <p className="text-xs text-slate-400 font-light leading-relaxed mb-4">
                    {tour.desc}
                  </p>

                  {/* Duración y tamaño de grupo */}
                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-indigo-500" /> {tour.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon size={12} className="text-indigo-500" /> {tour.groupSize}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {tour.tags.map((tag, ti) => (
                      <span key={ti} className="text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer de Tarjeta: Precios e Interacción */}
                <div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">Precio</span>
                      <span className="text-xl font-semibold text-slate-800">
                        ${tour.price} <span className="text-xs font-light text-slate-400">USD</span>
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/reservas?tour=${tour.name}&price=${tour.price}`)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-medium tracking-wide hover:bg-indigo-700 transition shadow-xs cursor-pointer active:scale-95"
                    >
                      Reservar
                    </button>
                  </div>

                  {/* Detalle Operativo de Seguridad */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-slate-400 font-light">
                    <ShieldCheck size={13} className="text-emerald-500" />
                    Operación segura y certificada
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-24 text-slate-400 font-light text-sm bg-white rounded-2xl border border-dashed border-slate-200">
            No encontramos experiencias que coincidan con los filtros seleccionados.
          </div>
        )}
      </main>
    </div>
  );
}