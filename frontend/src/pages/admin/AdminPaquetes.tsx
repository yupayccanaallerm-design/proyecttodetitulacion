import { useState, useEffect } from "react";
import { Plus, Sparkles, Check, Clock, Layers, DollarSign, MapPin } from "lucide-react";

// Definimos la estructura de un Tour para TypeScript
interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
}

export default function AdminPaquetes() {
  const [guardado, setGuardado] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [perfil, setPerfil] = useState("Aventurero");
  const [duracion, setDuracion] = useState("1");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  
  // Estados para manejar los tours traídos de la base de datos
  const [toursDisponibles, setToursDisponibles] = useState<Tour[]>([]);
  const [toursSeleccionados, setToursSeleccionados] = useState<number[]>([]);

  // 1. Jalar los tours de la base de datos de Hostinger al cargar la página
  useEffect(() => {
    fetch("http://localhost:8000/api/tours") 
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => setToursDisponibles(data))
      .catch((err) => {
        console.error("Error jalando tours, usando datos simulados para pruebas:", err);
        setToursDisponibles([
          { id: 1, nombre: "Machu Picchu Tradicional", zona_geografica: "Machu Picchu" },
          { id: 2, nombre: "Valle Sagrado de los Incas", zona_geografica: "Valle Sagrado" },
          { id: 3, nombre: "Montaña de 7 Colores", zona_geografica: "Cusco Sur" },
          { id: 4, nombre: "City Tour Arqueológico", zona_geografica: "Cusco Centro" },
        ]);
      });
  }, []);

  // 2. Controlar la selección/deselección de tours
  const manejarSeleccionTour = (id: number) => {
    if (toursSeleccionados.includes(id)) {
      setToursSeleccionados(toursSeleccionados.filter((tourId) => tourId !== id));
    } else {
      setToursSeleccionados([...toursSeleccionados, id]);
    }
  };

  // 3. Enviar el paquete estructurado al backend real de FastAPI
  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || toursSeleccionados.length === 0) {
      alert("Por favor introduce un título y selecciona al menos un tour.");
      return;
    }

    const nuevoPaquete = {
      nombre: titulo,
      descripcion_base: descripcion,
      duracion_dias: parseInt(duracion),
      perfil_usuario: perfil,
      precio_sugerido: parseFloat(precio) || 0.00,
      tours: toursSeleccionados // Aquí viajan los IDs amarrados (Ej: [1, 3])
    };

    try {
      // Petición POST real hacia tu backend
      const res = await fetch("http://localhost:8000/api/paquetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPaquete)
      });

      if (res.ok) {
        const resultado = await res.json();
        console.log("Respuesta del servidor:", resultado);
        
        // Activar animación de éxito y limpiar formulario
        setGuardado(true);
        setTimeout(() => {
          setGuardado(false);
          setTitulo("");
          setPrecio("");
          setDescripcion("");
          setToursSeleccionados([]);
        }, 2500);
      } else {
        const errorData = await res.json();
        alert(`Error al guardar en el servidor: ${errorData.detail || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error de red al intentar conectar con FastAPI:", error);
      alert("No se pudo establecer conexión con el backend de Python.");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-10">
      {/* CABECERA */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Diseñador de Paquetes Base</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">
          Estructura las plantillas de rutas que el Planificador IA utilizará para empaquetar de forma personalizada.
        </p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={manejarGuardar} className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs space-y-5">
        
        {/* Título del Paquete */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nombre / Título del Paquete Sugerido</label>
          <input 
            type="text" 
            placeholder="Ej. Aventura Express Humantay, Cusco Cultural Premium..." 
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Clasificación de Perfil */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Asignación de Perfil (IA)</label>
            <select 
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
            >
              <option value="Aventurero">Eco-Aventurero / Trekking</option>
              <option value="Cultural">Histórico / Cultural Tradicional</option>
              <option value="Gastronomico">Gastronómico / Vivencial</option>
              <option value="Relajacion">Premium / Confort y Relajación</option>
            </select>
          </div>

          {/* Duración Estimada */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Duración Base</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 pl-10 rounded-xl text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="1">1 Día Completo (Full Day)</option>
                <option value="2">2 Días / 1 Noche</option>
                <option value="3">3 Días / 2 Noches</option>
                <option value="4">4 a más Días</option>
              </select>
            </div>
          </div>

          {/* Precio Sugerido */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Precio Base (PE$)</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00" 
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 pl-10 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* 🌟 SECCIÓN DINÁMICA: SELECCIÓN DE TOURS ENLAZADOS */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">
            Seleccionar Tours Específicos para este Paquete ({toursSeleccionados.length} seleccionados)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            {toursDisponibles.map((tour) => (
              <div 
                key={tour.id}
                onClick={() => manejarSeleccionTour(tour.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  toursSeleccionados.includes(tour.id)
                    ? "bg-indigo-50/70 border-indigo-200"
                    : "bg-white border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-700">{tour.nombre}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span>{tour.zona_geografica}</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  toursSeleccionados.includes(tour.id)
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 bg-white"
                }`}>
                  {toursSeleccionados.includes(tour.id) && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del itinerario paso a paso */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Descripción del Itinerario Sugerido (Bloques breves)</label>
          <textarea 
            rows={3}
            placeholder="Día 1: Recojo y aclimatación. Día 2: Tour guiado y almuerzo buffet..." 
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 resize-none"
            required
          />
        </div>

        {/* BOTÓN GUARDAR */}
        <button 
          type="submit"
          className={`w-full text-xs font-medium py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            guardado 
              ? "bg-emerald-600 text-white shadow-emerald-600/10" 
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
          }`}
        >
          {guardado ? (
            <>
              <Check size={14} /> Paquete Enlazado e Indexado con Éxito
            </>
          ) : (
            <>
              <Layers size={14} /> Registrar y Publicar Paquete
            </>
          )}
        </button>

      </form>
    </div>
  );
}