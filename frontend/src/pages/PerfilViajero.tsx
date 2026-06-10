import { useState, useEffect, useRef } from "react";
import {
  Camera, Sparkles, Image, MapPin, Clock, Sun, Star,
  AlertCircle, Compass, Navigation, ShieldCheck, Heart,
  Mountain, Landmark, Trees, Award, ChevronRight, MessageSquare
} from "lucide-react";

// ------------------ Base de conocimiento turistico ------------------
interface PlaceInfo {
  nombre: string;
  subtitulo: string;
  descripcion: string;
  destacados: string[];
  idealPara: string;
  datoCurioso: string;
  horario: string;
  altitud: string;
  tipo: string;
  tourRecomendado: string;
}

const PLACES: Record<string, PlaceInfo> = {
  machupicchu: {
    nombre: "Machu Picchu",
    subtitulo: "La ciudad perdida de los Incas",
    descripcion: "Declarada Patrimonio de la Humanidad por la UNESCO, esta maravilla del mundo es el destino mas emblematico del Peru. Construida en el siglo XV, sus muros de piedra perfectamente ensamblados y su ubicacion entre neblinas la convierten en una experiencia unica e irrepetible.",
    destacados: [
      "Santuario Historico de Machu Picchu",
      "Huayna Picchu y Montana Machu Picchu",
      "Templo del Sol y el Intihuatana",
      "Terrazas agricolas milenarias",
      "Puerta del Sol (Inti Punku)"
    ],
    idealPara: "Amantes de la historia, aventureros y fot\u00f3grafos",
    datoCurioso: "El 70% de la construccion de Machu Picchu es subterranea. Los incas construyeron cimientos profundos y sistemas de drenaje para evitar deslizamientos.",
    horario: "6:00 am - 5:30 pm",
    altitud: "2,430 msnm",
    tipo: "Sitio Arqueologico",
    tourRecomendado: "Tour Clasico Machu Picchu + Huayna Picchu - 2 dias"
  },
  sacsayhuaman: {
    nombre: "Sacsayhuaman",
    subtitulo: "La fortaleza ceremonial de los Incas",
    descripcion: "Impresionante complejo arqueologico de piedras colosales que se ensamblan con una precision asombrosa. Sus muros en forma de zigzag representan los dientes del puma, animal sagrado para los incas.",
    destacados: [
      "Muros megaliticos de piedra",
      "Trono del Inca",
      "Mirador natural de Cusco",
      "Enigmaku (puerta ceremonial)",
      "Rodaderos naturales"
    ],
    idealPara: "Viajeros curiosos y amantes de la arqueologia",
    datoCurioso: "Algunas piedras de Sacsayhuaman pesan hasta 360 toneladas. No se sabe con certeza como los incas lograron transportarlas y ensamblarlas sin usar mortero.",
    horario: "7:00 am - 6:00 pm",
    altitud: "3,700 msnm",
    tipo: "Complejo Arqueologico",
    tourRecomendado: "City Tour Cusco + Ruinas Arqueologicas - Medio dia"
  },
  qorikancha: {
    nombre: "Qorikancha",
    subtitulo: "El Templo del Sol",
    descripcion: "Conocido como el Templo del Sol, fue el centro religioso mas importante del Imperio Inca. Sus muros estuvieron cubiertos con laminas de oro, y hoy alberga el Convento de Santo Domingo.",
    destacados: [
      "Templo del Sol inca",
      "Convento de Santo Domingo",
      "Muros incas originales",
      "Museo de Sitio",
      "Fuentes ceremoniales"
    ],
    idealPara: "Apasionados por la historia y la arquitectura",
    datoCurioso: "Las paredes del Qorikancha estaban cubiertas con mas de 700 laminas de oro de 22 quilates que pesaban aproximadamente 2 kg cada una.",
    horario: "8:30 am - 5:30 pm",
    altitud: "3,400 msnm",
    tipo: "Templo / Museo",
    tourRecomendado: "City Tour Cusco Imperial - Centro Historico + Qorikancha"
  },
  moray: {
    nombre: "Moray",
    subtitulo: "El laboratorio agricola inca",
    descripcion: "Un fascinante conjunto de terrazas concentricas que funcionaban como un laboratorio agricola experimental. Cada nivel tiene su propio microclima.",
    destacados: [
      "Terrazas concentricas unicas",
      "Microclimas escalonados",
      "Centro de investigacion agricola inca",
      "Vistas panoramicas del Valle Sagrado",
      "Cercania a Maras"
    ],
    idealPara: "Viajeros fascinados por la ingenieria y naturaleza",
    datoCurioso: "La diferencia de temperatura entre el nivel superior e inferior de Moray puede alcanzar los 15\u00b0C, creando hasta 20 microclimas diferentes.",
    horario: "7:00 am - 6:00 pm",
    altitud: "3,500 msnm",
    tipo: "Sitio Arqueologico",
    tourRecomendado: "Tour Maras + Moray - Valle Sur Medio dia"
  },
  salineras: {
    nombre: "Salineras de Maras",
    subtitulo: "Las minas de sal milenarias",
    descripcion: "Miles de pozas de sal que han sido explotadas desde la epoca preincaica. El agua salada del rio subterraneo fluye por canales y se evapora con el sol.",
    destacados: [
      "3,000 pozas de sal en uso",
      "Explotacion continua desde epocas preincas",
      "Paisaje de Postal",
      "Sal rosada y artesanal",
      "Miradores panoramicos"
    ],
    idealPara: "Fotografos y amantes de la naturaleza",
    datoCurioso: "Las Salineras de Maras producen sal blanca para consumo, sal rosada para cocina gourmet, y sal negra para fines medicinales.",
    horario: "7:00 am - 5:30 pm",
    altitud: "3,200 msnm",
    tipo: "Atractivo Natural",
    tourRecomendado: "Valle Sagrado Premium - Maras + Moray + Chinchero"
  },
  tipon: {
    nombre: "Tipon",
    subtitulo: "El jardin de los Incas",
    descripcion: "Un impresionante complejo de terrazas y canales de agua que funcionan hasta el dia de hoy. Tipon es considerado el mejor ejemplo de ingenieria hidraulica inca.",
    destacados: [
      "Sistema hidraulico funcional",
      "Terrazas ceremoniales",
      "Fuentes de agua incas",
      "Canales de piedra originales",
      "Vista del Valle Sur"
    ],
    idealPara: "Ingenieros, historiadores y amantes de la naturaleza",
    datoCurioso: "El sistema de canales de Tipon sigue funcionando perfectamente despues de mas de 500 a\u00f1os.",
    horario: "7:00 am - 5:30 pm",
    altitud: "3,400 msnm",
    tipo: "Complejo Arqueologico",
    tourRecomendado: "Tour Valle Sur - Tipon + Pikillacta + Andahuaylillas"
  },
  "7colores": {
    nombre: "Monta\u00f1a de 7 Colores",
    subtitulo: "El tesoro natural del Peru",
    descripcion: "Tambien conocida como Vinicunca o Montana Arcoiris, es una de las maravillas naturales mas impresionantes del mundo. Sus franjas de colores son el resultado de la sedimentacion mineral durante millones de a\u00f1os.",
    destacados: [
      "Franjas de colores unicas en el mundo",
      "Caminata de alta monta\u00f1a",
      "Vista del Nevado Ausangate",
      "Encuentro con la cultura local",
      "Fotografia de clase mundial"
    ],
    idealPara: "Aventureros, trekkers y fotografos",
    datoCurioso: "Los colores se deben a minerales: rojo (arcilla), amarillo (azufre), verde (cobre), blanco (caliza) y azul (magnesio).",
    horario: "4:00 am - 5:00 pm (excursion de dia completo)",
    altitud: "5,200 msnm",
    tipo: "Atractivo Natural",
    tourRecomendado: "Aventura Montana 7 Colores - Full Day con Desayuno y Almuerzo"
  },
  laguna_huamantay: {
    nombre: "Laguna Humantay",
    subtitulo: "La laguna turquesa de los Andes",
    descripcion: "Una joya esmeralda enclavada en la Cordillera de los Andes, alimentada por el deshielo del nevado Humantay. Sus aguas turquesa intenso crean una de las postales mas hermosas del Cusco.",
    destacados: [
      "Agua color turquesa intenso",
      "Nevado Humantay (5,473 msnm)",
      "Senderismo de monta\u00f1a",
      "Campamento base con vistas",
      "Energia espiritual del lugar"
    ],
    idealPara: "Amantes del trekking y la fotografia de paisajes",
    datoCurioso: "El color turquesa intenso se debe a los sedimentos minerales finamente molidos (harina de roca) que bajan del glaciar Humantay.",
    horario: "4:00 am - 6:00 pm (excursion de dia completo)",
    altitud: "4,200 msnm",
    tipo: "Laguna de Montana",
    tourRecomendado: "Trekking Laguna Humantay - Full Day con Guia Especializado"
  },
  desconocido: {
    nombre: "Lugar no identificado",
    subtitulo: "No pudimos reconocer este lugar",
    descripcion: "Intenta con otra fotografia mas clara o de algun destino turistico conocido en Cusco. Nuestro sistema de IA reconoce los principales atractivos de la region.",
    destacados: [],
    idealPara: "",
    datoCurioso: "",
    horario: "",
    altitud: "",
    tipo: "",
    tourRecomendado: ""
  }
};

// ------------------ API (usando el endpoint integrado del chatbot) ------------------
const API = {
  vision: {
    // Endpoint integrado: chatbot/recognize (RAG + Visión combinados)
    predict: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      // Intentar primero el endpoint integrado del chatbot
      return fetch("/chatbot/recognize", { method: "POST", body: form })
        .then(r => r.json())
        .catch(() => {
          // Fallback al endpoint directo de visión
          const form2 = new FormData();
          form2.append("file", file);
          return fetch("/vision/predict", { method: "POST", body: form2 }).then(r => r.json());
        });
    },
  },
};

// ------------------ Types ------------------
interface IVisionResult {
  success: boolean;
  clase: string;
  confidence: number;
  top_predictions: { clase: string; score: number }[];
  error?: string;
  identified?: boolean;
  suggestions?: string[];
}

// ------------------ Componente Principal ------------------
export default function PerfilViajero({ onPlaceDetected }: { onPlaceDetected?: (place: string) => void }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <section className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles size={12} /> Descubre tu destino
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-3">
            Descubridor{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">
              Inteligente
            </span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Toma una foto o sube una imagen de cualquier lugar turistico de Cusco y descubre su historia, datos curiosos y tours recomendados.
          </p>
        </section>

        <VisionTab onPlaceDetected={onPlaceDetected} />
      </div>
    </div>
  );
}

// ================================================================
// VISOR TURISTICO
// ================================================================
function VisionTab({ onPlaceDetected }: { onPlaceDetected?: (place: string) => void }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<IVisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 1280, height: 720 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setSelectedFile(null);
      setPreview(null);
      setResult(null);
      setError(null);
    } catch {
      setError("No se pudo acceder a la camara. Verifica los permisos.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "captura.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      setPreview(URL.createObjectURL(blob));
      setResult(null);
      setError(null);
      stopCamera();
    }, "image/jpeg", 0.9);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { setError("La imagen supera el limite de 10MB"); return; }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    if (cameraActive) stopCamera();
  };

  const handlePredict = async () => {
    if (!selectedFile) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await API.vision.predict(selectedFile);
      if (data.success) {
        setResult(data);
      }
      else setError(data.error || "Error al procesar la imagen");
    } catch {
      setError("No se pudo conectar con el servicio.");
    } finally { setLoading(false); }
  };

  const resetView = () => {
    setSelectedFile(null); setPreview(null); setResult(null);
    setError(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Obtener info del lugar detectado
  const placeKey = result?.clase?.toLowerCase().replace(/ /g, "_").replace(/[áéíóú]/g, (c) => "aeiou"["áéíóú".indexOf(c)]) || "";
  const placeInfo = PLACES[placeKey] || PLACES["desconocido"];
  const isUnknown = placeKey === "desconocido" || !result;

  const tipoIcon = (tipo: string) => {
    if (tipo?.includes("Arqueologico") || tipo?.includes("Templo")) return <Landmark size={14} />;
    if (tipo?.includes("Natural") || tipo?.includes("Laguna")) return <Trees size={14} />;
    if (tipo?.includes("Museo")) return <Award size={14} />;
    return <MapPin size={14} />;
  };

  return (
    <div className="space-y-6">
      {/* Seccion superior: selector de origen */}
      {!result && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Opcion: Subir archivo */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`bg-white p-8 rounded-[35px] text-center cursor-pointer transition-all group border-2 ${
              dragActive ? "border-indigo-500 bg-indigo-50/30" : "border-slate-100 hover:border-indigo-300 shadow-sm"
            }`}
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Image size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Subir imagen</h3>
            <p className="text-[11px] text-slate-400">Arrastra o selecciona un archivo</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </div>

          {/* Opcion: Camara */}
          <div
            onClick={startCamera}
            className="bg-white p-8 rounded-[35px] text-center cursor-pointer hover:border-indigo-300 transition-all group border-2 border-slate-100 shadow-sm"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera size={28} className="text-indigo-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">Usar camara</h3>
            <p className="text-[11px] text-slate-400">Toma una foto en vivo</p>
          </div>
        </div>
      )}

      {/* Camara activa */}
      {cameraActive && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[35px] overflow-hidden border border-slate-100 shadow-sm">
            <div className="relative">
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-[4/3] object-cover bg-slate-100" />
              <div className="absolute inset-0 border-[3px] border-dashed border-indigo-300/40 rounded-2xl m-4 pointer-events-none" />
            </div>
            <div className="flex gap-3 p-4 justify-center">
              <button onClick={capturePhoto}
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <Camera size={14} /> Capturar
              </button>
              <button onClick={stopCamera}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview + resultado */}
      {preview && !cameraActive && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Columna izquierda: preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-[35px] overflow-hidden border border-slate-100 shadow-sm">
              <div className="relative">
                <img src={preview} alt="Preview" className="w-full aspect-[4/3] object-cover bg-slate-100" />
                {result && !isUnknown && (
                  <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                    Reconocido
                  </div>
                )}
              </div>
              {!result && (
                <div className="p-4 flex gap-2">
                  <button onClick={handlePredict} disabled={loading}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      loading ? "bg-slate-100 text-slate-400" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
                    }`}
                  >
                    {loading ? <><Sparkles size={14} className="animate-spin" /> Analizando...</> : <><Compass size={14} /> Descubrir lugar</>}
                  </button>
                  <button onClick={resetView}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs transition-all"
                  >
                    Cambiar
                  </button>
                </div>
              )}
              {error && (
                <div className="p-4 pt-0">
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {result && !isUnknown && (
              <button onClick={() => { resetView(); startCamera(); }}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Camera size={14} /> Descubrir otro lugar
              </button>
            )}
          </div>

          {/* Columna derecha: Ficha turistica */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="bg-white border border-slate-100 shadow-sm rounded-[35px] p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center mb-6 animate-pulse">
                  <Compass size={36} className="text-indigo-600" />
                </div>
                <p className="text-lg font-bold text-slate-800 mb-2">Descubriendo tu destino...</p>
                <p className="text-xs text-slate-400">Nuestra IA esta analizando la imagen para identificar el lugar</p>
              </div>
            ) : result && !isUnknown && placeInfo ? (
              <div className="space-y-4">
                {/* Header del lugar */}
                <div className="bg-white rounded-[35px] overflow-hidden border border-slate-100 shadow-sm">
                  <div className="relative h-40 bg-gradient-to-r from-indigo-600 to-purple-600 flex items-end p-6">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider mb-2">
                        {tipoIcon(placeInfo.tipo)} {placeInfo.tipo}
                      </div>
                      <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
                        {placeInfo.nombre}
                      </h2>
                      <p className="text-sm text-indigo-200 mt-1 font-light italic">
                        {placeInfo.subtitulo}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    {/* Descripcion */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Sobre este lugar</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{placeInfo.descripcion}</p>
                    </div>

                    {/* Datos rapidos */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <Clock size={12} className="text-indigo-500 mb-1" />
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Horario</p>
                        <p className="text-xs text-slate-700 font-semibold">{placeInfo.horario}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <Mountain size={12} className="text-emerald-500 mb-1" />
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Altitud</p>
                        <p className="text-xs text-slate-700 font-semibold">{placeInfo.altitud}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <Sun size={12} className="text-amber-500 mb-1" />
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Ideal para</p>
                        <p className="text-xs text-slate-700 font-semibold truncate">{placeInfo.idealPara.split(",")[0]}</p>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-3">
                        <Star size={12} className="text-amber-500 mb-1" />
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Reconocido</p>
                        <p className="text-xs text-slate-700 font-semibold">Patrimonio Cultural</p>
                      </div>
                    </div>

                    {/* Destacados */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Que ver y hacer</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {placeInfo.destacados.map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3">
                            <span className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                              <Award size={10} className="text-indigo-600" />
                            </span>
                            <span className="text-xs text-slate-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dato curioso */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles size={16} className="text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Dato curioso</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{placeInfo.datoCurioso}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botón para preguntar al chatbot */}
                    {onPlaceDetected && (
                      <button 
                        onClick={() => onPlaceDetected(placeInfo.nombre)}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mb-3"
                      >
                        <MessageSquare size={14} /> Preguntar al Chatbot sobre {placeInfo.nombre}
                      </button>
                    )}

                    {/* Tour recomendado */}
                    {!showTour ? (
                      <button onClick={() => setShowTour(true)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck size={14} /> Ver tour recomendado
                      </button>
                    ) : (
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                            <Heart size={18} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Tour recomendado por GRUPO TUMPERU</p>
                            <p className="text-sm font-bold text-slate-800 mb-2">{placeInfo.tourRecomendado}</p>
                            <button onClick={() => setShowTour(false)}
                              className="text-[10px] text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 font-bold"
                            >
                              Ocultar <ChevronRight size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : result && isUnknown ? (
              <div className="bg-white border border-slate-100 shadow-sm rounded-[35px] p-10 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <MapPin size={36} className="text-slate-400" />
                </div>
                <p className="text-lg font-bold text-slate-800 mb-2">Lugar no identificado</p>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  No pudimos reconocer este lugar. Prueba con otra foto mas nitida o de algun destino conocido de Cusco.
                </p>
                <button onClick={resetView}
                  className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Intentar de nuevo
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Estado inicial */}
      {!preview && !cameraActive && !result && !loading && (
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-white border border-slate-100 shadow-sm rounded-[35px] p-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
              <Navigation size={36} className="text-indigo-600" />
            </div>
            <p className="text-lg font-bold text-slate-800 mb-2">Descubre lugares increibles</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Toma una foto o sube una imagen de cualquier destino turistico de Cusco.
              Nuestra IA lo identificara y te mostrara toda la informacion que necesitas para tu viaje.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Machu Picchu", "Monta\u00f1a 7 Colores", "Sacsayhuaman", "Laguna Humantay"].map((name) => (
                <span key={name} className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1.5 rounded-full border border-slate-200 font-medium">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
