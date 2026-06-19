import { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, MapPin, Sparkles, Check, X, RefreshCw, Layers, FileText } from "lucide-react";

export default function AdminTours() {
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState("Cusco Ciudad");
  const [descripcion, setDescripcion] = useState(""); // 🆕 Nuevo estado para la descripción
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [itinerario, setItinerario] = useState([{ titulo: "", descripcion: "" }]);
const [inclusiones, setInclusiones] = useState([{ item: "" }]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generar y limpiar la vista previa de la imagen para evitar fugas de memoria
  useEffect(() => {
    if (!archivoImagen) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivoImagen);
    setVistaPrevia(url);

    return () => URL.revokeObjectURL(url);
  }, [archivoImagen]);

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoImagen(e.target.files[0]);
    }
  };

  const removerImagen = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el click del contenedor padre
    setArchivoImagen(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación completa emparejada con las restricciones de FastAPI
    if (!nombre.trim() || !descripcion.trim() || !archivoImagen) {
      alert("Por favor, ingresa el nombre, la descripción y selecciona una fotografía patrón.");
      return;
    }

    setCargando(true);
    
    // Empaquetamiento Multipart obligatorio
    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("zona_geografica", zona);
    formData.append("descripcion", descripcion.trim()); // 🆕 Ahora sí se envía al backend relacional
    formData.append("estado", "1"); // Valor por defecto
    formData.append("imagen", archivoImagen);
    formData.append("itinerario", JSON.stringify(itinerario));
    formData.append("inclusiones", JSON.stringify(inclusiones));

    try {
      const res = await fetch("http://localhost:8000/api/tours", {
        method: "POST",
        body: formData, // El navegador configura automáticamente los límites multipart
      });

      if (res.ok) {
        setGuardado(true);
        setTimeout(() => {
          setGuardado(false);
          setNombre("");
          setDescripcion(""); // Limpieza de estado
          setZona("Cusco Ciudad");
          setArchivoImagen(null);
          setItinerario([{ titulo: "", descripcion: "" }]);
          setInclusiones([{ item: "" }]);
        }, 2500);
      } else {
        const errorData = await res.json();
        // Si da 422, esto te dirá exactamente qué parámetro falló en la validación de Pydantic/FastAPI
        console.error("Detalles del error de validación:", errorData.detail);
        alert(`Error ${res.status}: ${JSON.stringify(errorData.detail) || "No se pudo registrar el atractivo"}`);
      }
    } catch (error) {
      console.error("Error de conexión con la API:", error);
      alert("No se pudo conectar con el servidor de Python. Asegúrate de que uvicorn esté corriendo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto mb-16 animate-fade-in">
      
      {/* 🏔️ ENCABEZADO ESTILO DASHBOARD PREMIUM */}
      <div className="relative p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl shadow-xl overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-indigo-400 shadow-inner">
            <Layers size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">Indexación de Atractivos Turísticos</h1>
            <p className="text-xs text-slate-300 font-light mt-0.5 max-w-md leading-relaxed">
              Registra nodos operativos para el <span className="font-semibold text-indigo-300">SGEV</span> y automatiza el entrenamiento de descriptores visuales mediante IA.
            </p>
          </div>
        </div>
      </div>

      {/* 📄 FORMULARIO ESTRUCTURADO */}
      <form onSubmit={manejarGuardar} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-xl shadow-slate-200/40 space-y-6 relative">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre del Atractivo */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>Nombre del Punto Turístico</span>
            </label>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Ej. Templo del Sol (Qorikancha), Ollantaytambo..." 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-normal text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                required
                disabled={cargando || guardado}
              />
            </div>
          </div>

          {/* Zona / Ubicación Geográfica */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              <span>Zona Geográfica / Circuito</span>
            </label>
            <select 
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
              disabled={cargando || guardado}
            >
              <option value="Cusco Ciudad">Cusco Ciudad (Centro Histórico)</option>
              <option value="Valle Sagrado">Valle Sagrado de los Incas</option>
              <option value="Machu Picchu">Machu Picchu / Aguas Calientes</option>
              <option value="Rutas Sur">Ruta Sur / Vinicunca</option>
            </select>
          </div>

          {/* 🆕 Descripción del Atractivo Turístico */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-slate-400" />
              <span>Descripción Breve</span>
            </label>
            <textarea 
              placeholder="Escribe una pequeña descripción del atractivo que verán los operadores turísticos..." 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-normal text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
              required
              disabled={cargando || guardado}
            />
          </div>
        </div>
        {/* SECCIÓN ITINERARIO */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
        <label className="text-[11px] font-bold text-slate-500 uppercase">Itinerario Detallado</label>
        {itinerario.map((row, i) => (
            <div key={i} className="flex gap-2">
            <input 
                placeholder="Actividad" 
                value={row.titulo}
                className="w-1/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400" 
                onChange={(e) => {
                const nuevo = [...itinerario];
                nuevo[i].titulo = e.target.value;
                setItinerario(nuevo);
                }} 
            />
            <input 
                placeholder="Descripción" 
                value={row.descripcion}
                className="w-2/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400" 
                onChange={(e) => {
                const nuevo = [...itinerario];
                nuevo[i].descripcion = e.target.value;
                setItinerario(nuevo);
                }} 
            />
            </div>
        ))}
        <button 
            type="button" 
            onClick={() => setItinerario([...itinerario, { titulo: "", descripcion: "" }])} 
            className="text-[10px] text-indigo-600 font-bold hover:underline"
        >
            + AÑADIR ACTIVIDAD
        </button>
        </div>

        {/* SECCIÓN INCLUSIONES */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
        <label className="text-[11px] font-bold text-slate-500 uppercase">Lista de Inclusiones</label>
        {inclusiones.map((row, i) => (
            <input 
            key={i} 
            placeholder="Ej. Almuerzo incluido" 
            value={row.item}
            className="w-full bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400" 
            onChange={(e) => {
                const nuevo = [...inclusiones];
                nuevo[i].item = e.target.value;
                setInclusiones(nuevo);
            }} 
            />
        ))}
        <button 
            type="button" 
            onClick={() => setInclusiones([...inclusiones, { item: "" }])} 
            className="text-[10px] text-indigo-600 font-bold hover:underline"
        >
            + AÑADIR ÍTEM
        </button>
        </div>

        {/* 📸 ÁREA ULTRA-INTERACTIVA DE SUBIDA MULTIMEDIA */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Fotografía Patrón (Dataset IA)
          </label>
          
          <input 
            type="file"
            ref={fileInputRef}
            onChange={manejarSeleccionArchivo}
            accept="image/*"
            className="hidden"
          />

          <div 
            onClick={() => !archivoImagen && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-350 flex flex-col items-center justify-center min-h-[190px] overflow-hidden ${
              archivoImagen 
                ? "border-emerald-400/70 bg-emerald-50/5 cursor-default" 
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-400 cursor-pointer"
            }`}
          >
            {vistaPrevia ? (
              /* ESTADO: IMAGEN SELECCIONADA (CON VISTA PREVIA) */
              <div className="absolute inset-0 w-full h-full animate-fade-in group">
                <img 
                  src={vistaPrevia} 
                  alt="Vista previa" 
                  className="w-full h-full object-cover brightness-[0.85] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <button
                  type="button"
                  onClick={removerImagen}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-xl text-white transition-colors cursor-pointer shadow-lg animate-fade-in"
                  title="Eliminar imagen"
                >
                  <X size={14} />
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-left flex items-end justify-between">
                  <div className="text-white space-y-0.5">
                    <p className="text-xs font-semibold line-clamp-1">{archivoImagen?.name}</p>
                    <p className="text-[10px] text-slate-300 font-light">{(archivoImagen!.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="bg-emerald-500 border border-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-900/20">
                    <Sparkles size={9} /> Extracción Lista
                  </div>
                </div>
              </div>
            ) : (
              /* ESTADO: VACÍO (ESPERANDO SUBIDA) */
              <div className="space-y-4 py-2">
                <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ImageIcon size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Arrastra o selecciona la fotografía estructural
                  </p>
                  <p className="text-[10px] text-slate-400 font-light">
                    Formatos óptimos: JPG, PNG de alta fidelidad (Máx. 10MB)
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide shadow-xs">
                  <Sparkles size={11} className="text-purple-500" /> 
                  Preparado para análisis SIFT/ORB con TensorFlow
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🚀 BOTÓN ACCIÓN */}
        <button 
          type="submit"
          disabled={cargando || guardado}
          className={`w-full text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99] ${
            guardado 
              ? "bg-emerald-600 text-white shadow-emerald-600/20" 
              : cargando 
                ? "bg-slate-700 text-slate-300 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/20 text-white"
          }`}
        >
          {guardado ? (
            <>
              <Check size={15} className="animate-bounce" /> Registro Indexado y Pipeline IA Exitoso
            </>
          ) : cargando ? (
            <>
              <RefreshCw size={15} className="animate-spin" /> Conectando con Hostinger e Inyectando Datos...
            </>
          ) : (
            <>
              <Plus size={15} /> Confirmar Registro en SGEV
            </>
          )}
        </button>

      </form>
    </div>
  );
}