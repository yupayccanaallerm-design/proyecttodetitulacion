import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  Plane, MapPin, Heart, Camera, Users, Mountain,
  Utensils, Compass, Trees, Landmark, Loader2, Footprints, 
  MessageCircle, Plus, Sparkles, ChevronDown, ChevronUp,
  Clock, DollarSign, Award, Info, RefreshCw, X, Star,
  TrendingUp, Check, Calendar, Sun, Cloud
} from "lucide-react";
import MapaDestinos from "../components/MapaDestinos";
import { useItinerario } from "../contexts/ItinerarioContext";
import { AgregarDestinoModal } from "../components/AgregarDestinoModal";

interface Destino {
  destino: string;
  score?: number;
  descripcion?: string;
  imagen?: string;
  duracion_sugerida?: string;
  nivel_dificultad?: string;
}

interface RecomendadorProps {
  onConsultarChat?: (destino: string) => void;
}

const PRESETS_KEY = 'recomendador_preferencias';
const RESULTADOS_KEY = 'recomendador_resultados';

// Información adicional de destinos — duracion_key/dificultad_key/tipo_key son claves de i18n
const INFO_DESTINOS: Record<string, any> = {
  "machupicchu": {
    emoji: "🏛️",
    color: "from-amber-500 to-orange-600",
    duracion_key: "dur_2_3_dias",
    dificultad_key: "dif_moderada",
    tipo_key: "tipo_arqueologico"
  },
  "sacsayhuaman": {
    emoji: "🏗️",
    color: "from-indigo-500 to-purple-600",
    duracion_key: "dur_medio_dia",
    dificultad_key: "dif_baja",
    tipo_key: "tipo_arqueologico"
  },
  "qorikancha": {
    emoji: "✨",
    color: "from-yellow-400 to-amber-600",
    duracion_key: "dur_2_3_horas",
    dificultad_key: "dif_baja",
    tipo_key: "tipo_templo"
  },
  "moray": {
    emoji: "🌾",
    color: "from-emerald-400 to-teal-600",
    duracion_key: "dur_2_3_horas",
    dificultad_key: "dif_baja",
    tipo_key: "tipo_arqueologico"
  },
  "salineras": {
    emoji: "🧂",
    color: "from-sky-400 to-blue-600",
    duracion_key: "dur_2_horas",
    dificultad_key: "dif_baja",
    tipo_key: "tipo_natural"
  },
  "tipon": {
    emoji: "💧",
    color: "from-cyan-400 to-blue-600",
    duracion_key: "dur_2_3_horas",
    dificultad_key: "dif_baja",
    tipo_key: "tipo_arqueologico"
  },
  "7colores": {
    emoji: "🌈",
    color: "from-pink-400 to-purple-600",
    duracion_key: "dur_1_dia",
    dificultad_key: "dif_alta",
    tipo_key: "tipo_natural"
  },
  "laguna_huamantay": {
    emoji: "🏞️",
    color: "from-teal-400 to-emerald-600",
    duracion_key: "dur_1_dia",
    dificultad_key: "dif_alta",
    tipo_key: "tipo_natural"
  }
};

export default function RecomendadorModerno({ onConsultarChat }: RecomendadorProps = {}) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ top: Destino[] } | null>(() => {
    // 🆕 Cargar resultados guardados
    const saved = localStorage.getItem(RESULTADOS_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState<{nombre: string, tipo: string, tour: string} | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(!resultado);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState<string | null>(null);
  const { t } = useTranslation();
  
  const { agregarDestino } = useItinerario();

  type FormularioType = Record<string, any>;

  const [formulario, setFormulario] = useState<FormularioType>(() => {
    const saved = localStorage.getItem(PRESETS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si hay error, usar valores por defecto
      }
    }
    return {
      Edad: 25,
      "País / Procedencia": "Perú",
      Idioma: "Español",
      Presupuesto: "Medio",
      "Días de viaje": 5,
      "Tipo de viaje": "Cultural",
      "Problemas respiratorios": "No",
      "Movilidad reducida": "No",
      Alergias: "No",
      "Apto para adulto mayor": "Sí",
      "Apto para niños": "No",
      Comida: "Sí",
      Naturaleza: "Sí",
      Historia: "Sí",
      Fotografía: "Sí",
      Trekking: "Sí",
      "Nivel de dificultad": "Medio",
      "Requiere caminata": "Sí",
      "Altura máxima tolerada": 3500,
      "Recomendación médica": "No",
      "Tipo de transporte": "Bus",
      "Tour recomendado": "Full Day",
      "Riesgo por altura": "Medio",
    };
  });

  useEffect(() => {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(formulario));
  }, [formulario]);

  // 🆕 Guardar resultados cuando cambian
  useEffect(() => {
    if (resultado) {
      localStorage.setItem(RESULTADOS_KEY, JSON.stringify(resultado));
    }
  }, [resultado]);

  const handleChange = useCallback((name: string, value: any) => {
    setFormulario((prev) => ({ ...prev, [name]: value }));
  }, []);

  const resetFormulario = useCallback(() => {
    setFormulario({
      Edad: 25,
      "País / Procedencia": "Perú",
      Idioma: "Español",
      Presupuesto: "Medio",
      "Días de viaje": 5,
      "Tipo de viaje": "Cultural",
      "Problemas respiratorios": "No",
      "Movilidad reducida": "No",
      Alergias: "No",
      "Apto para adulto mayor": "Sí",
      "Apto para niños": "No",
      Comida: "Sí",
      Naturaleza: "Sí",
      Historia: "Sí",
      Fotografía: "Sí",
      Trekking: "Sí",
      "Nivel de dificultad": "Medio",
      "Requiere caminata": "Sí",
      "Altura máxima tolerada": 3500,
      "Recomendación médica": "No",
      "Tipo de transporte": "Bus",
      "Tour recomendado": "Full Day",
      "Riesgo por altura": "Medio",
    });
    setResultado(null);
    localStorage.removeItem(RESULTADOS_KEY);
  }, []);

  const enviarDatos = async () => {
    setLoading(true);
    setError("");
    setResultado(null);
    setIsFirstLoad(false);
    
    const mapeoDificultad: Record<string, number> = { "Bajo": 0, "Medio": 1, "Alto": 2 };
    const mapeoPresupuesto: Record<string, number> = { "Bajo": 0, "Medio": 1, "Alto": 2 };
    const mapeoSiNo: Record<string, number> = { "No": 0, "Sí": 1 };

    const datosFormateados = {
      ...formulario,
      "Nivel de dificultad": mapeoDificultad[formulario["Nivel de dificultad"]] ?? 1,
      Presupuesto: mapeoPresupuesto[formulario.Presupuesto] ?? 1,
      "Requiere caminata": mapeoSiNo[formulario["Requiere caminata"]] ?? 1,
      "Apto para niños": mapeoSiNo[formulario["Apto para niños"]] ?? 0,
      "Apto para adulto mayor": mapeoSiNo[formulario["Apto para adulto mayor"]] ?? 1,
      "Problemas respiratorios": mapeoSiNo[formulario["Problemas respiratorios"]] ?? 0,
      "Movilidad reducida": mapeoSiNo[formulario["Movilidad reducida"]] ?? 0,
      Alergias: mapeoSiNo[formulario.Alergias] ?? 0,
      Comida: mapeoSiNo[formulario.Comida] ?? 1,
      Naturaleza: mapeoSiNo[formulario.Naturaleza] ?? 1,
      Historia: mapeoSiNo[formulario.Historia] ?? 1,
      Fotografía: mapeoSiNo[formulario.Fotografía] ?? 1,
      Trekking: mapeoSiNo[formulario.Trekking] ?? 1,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch("/recomendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosFormateados),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      
      const data = await response.json();

      let listaExtraida: any[] = [];

      if (Array.isArray(data)) {
        listaExtraida = data;
      } else if (data && typeof data === 'object') {
        const keyArray = Object.keys(data).find(k => Array.isArray(data[k]));
        if (keyArray) {
          listaExtraida = data[keyArray];
        } else {
          listaExtraida = Object.values(data).filter(v => typeof v === 'string');
        }
      }

      if (listaExtraida.length > 0) {
        const formateado = listaExtraida.slice(0, 5).map((item, index) => {
          let nombre = '';
          if (typeof item === 'string') {
            nombre = item;
          } else {
            nombre = item.destino || item.nombre || item.lugar || Object.values(item).find(v => typeof v === 'string') || '';
          }
          
          const nombreLower = String(nombre).toLowerCase().replace(/ /g, '_').replace(/[áéíóú]/g, (c) => "aeiou"["áéíóú".indexOf(c)]);
          const info = INFO_DESTINOS[nombreLower] || INFO_DESTINOS[String(nombre).toLowerCase().replace(/ /g, '_')] || {};
          
          return {
            destino: String(nombre || t("recomendador.defaultDestino")),
            score: item.score ?? (1 - (index * 0.1)),
            descripcion: item.descripcion || item.desc || "",
            duracion_sugerida: info.duracion_key || "dur_variable",
            nivel_dificultad: info.dificultad_key || "dif_moderada"
          };
        });
        setResultado({ top: formateado });
      } else {
        setResultado({ top: [{ destino: data.message || data.error || "No se encontraron destinos" }] });
      }

    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError(t("recomendador.timeout"));
      } else {
        setError(t("recomendador.error"));
      }
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarItinerario = useCallback((destino: string) => {
    setSelectedDestino({
      nombre: destino,
      tipo: t("recomendador.tipoRecomendado"),
      tour: t("recomendador.tourDefault", { nombre: destino })
    });
    setShowAddModal(true);
  }, [t]);

  const handleConfirmarAgregar = useCallback((data: { 
    fechaInicio: string; 
    duracion: number; 
    nivelExigencia: 1 | 2 | 3 | 4 | 5 
  }) => {
    if (!selectedDestino) return;
    agregarDestino({
      nombre: selectedDestino.nombre,
      tipo: selectedDestino.tipo,
      tourRecomendado: selectedDestino.tour,
      fechaInicio: data.fechaInicio,
      duracion: data.duracion,
      nivelExigencia: data.nivelExigencia,
      actividades: [
        `Visita a ${selectedDestino.nombre}`,
        "Experiencia cultural",
        "Fotografía de paisajes"
      ]
    });
    setShowAddModal(false);
    
    // Feedback visual
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-28 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-2xl z-[99999] animate-in slide-in-from-bottom-4 duration-300';
    toast.textContent = t("recomendador.toastAdded", { name: selectedDestino.nombre });
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('animate-out', 'slide-out-to-bottom', 'duration-300');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, [selectedDestino, agregarDestino]);

  const resumenPreferencias = useMemo(() => {
    const intereses = [];
    if (formulario.Fotografía === "Sí") intereses.push(`📸 ${t("recomendador.interests.photos")}`);
    if (formulario.Comida === "Sí") intereses.push(`🍜 ${t("recomendador.interests.food")}`);
    if (formulario.Trekking === "Sí") intereses.push(`🥾 ${t("recomendador.interests.trekking")}`);
    if (formulario.Naturaleza === "Sí") intereses.push(`🌿 ${t("recomendador.interests.nature")}`);
    if (formulario.Historia === "Sí") intereses.push(`🏛️ ${t("recomendador.interests.history")}`);
    return intereses;
  }, [formulario, t]);

  const getDestinoInfo = (nombre: string) => {
    const key = nombre.toLowerCase().replace(/ /g, '_').replace(/[áéíóú]/g, (c) => "aeiou"["áéíóú".indexOf(c)]);
    return INFO_DESTINOS[key] || INFO_DESTINOS[nombre.toLowerCase().replace(/ /g, '_')] || {
      emoji: "📍",
      color: "from-slate-400 to-slate-600",
      duracion_key: "dur_variable",
      dificultad_key: "dif_moderada",
      tipo_key: "tipo_destino"
    };
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center relative z-10">

        {resultado && resultado.top && resultado.top.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
            <Sparkles size={12} /> {resultado.top.length} {t("recomendador.found")}
          </span>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 relative z-0">
        <section className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full mb-4">
            <Sparkles size={12} /> {t("recomendador.badge")}
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            {t("recomendador.title")}
          </h1>
          <p className="text-slate-500 font-medium">{t("recomendador.subtitle")}</p>
          
          {resumenPreferencias.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {resumenPreferencias.map((item, i) => (
                <span key={i} className="text-xs bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-end">
              <button
                onClick={resetFormulario}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} /> {t("recomendador.reset")}
              </button>
            </div>

            <Section icon={<Users className="text-indigo-500" />} title={t("recomendador.sections.travelers") }>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <InputGroup label={t("recomendador.fields.age")}>
                  <input 
                    type="number" 
                    value={formulario.Edad} 
                    onChange={(e) => handleChange("Edad", Number(e.target.value))} 
                    min={1}
                    max={120}
                    className={inputStyle} 
                  />
                </InputGroup>
                <InputGroup label={t("recomendador.fields.origin")}>
                  <input 
                    type="text" 
                    value={formulario["País / Procedencia"]} 
                    onChange={(e) => handleChange("País / Procedencia", e.target.value)} 
                    className={inputStyle} 
                    placeholder="Ej: Perú, Chile, USA..."
                  />
                </InputGroup>
                <InputGroup label={t("recomendador.fields.children")}>
                  <div className="grid grid-cols-2 gap-2 h-[56px]">
                    {["Sí", "No"].map(op => (
                      <button 
                        key={op} 
                        onClick={() => handleChange("Apto para niños", op)} 
                        className={`${badgeStyle} ${formulario["Apto para niños"] === op ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}
                      >
                        {op}
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>
            </Section>

            <Section icon={<Heart className="text-pink-500" />} title={t("recomendador.sections.interests") }>
              <p className="text-xs text-slate-400 mb-3">{t("recomendador.interests.subtitle")}</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <InterestCard 
                  icon={<Camera size={20} />} 
                  label={t("recomendador.interests.photos")} 
                  active={formulario.Fotografía === "Sí"} 
                  onClick={() => handleChange("Fotografía", formulario.Fotografía === "Sí" ? "No" : "Sí")} 
                />
                <InterestCard 
                  icon={<Utensils size={20} />} 
                  label={t("recomendador.interests.food")} 
                  active={formulario.Comida === "Sí"} 
                  onClick={() => handleChange("Comida", formulario.Comida === "Sí" ? "No" : "Sí")} 
                />
                <InterestCard 
                  icon={<Compass size={20} />} 
                  label={t("recomendador.interests.trekking")} 
                  active={formulario.Trekking === "Sí"} 
                  onClick={() => handleChange("Trekking", formulario.Trekking === "Sí" ? "No" : "Sí")} 
                />
                <InterestCard 
                  icon={<Trees size={20} />} 
                  label={t("recomendador.interests.nature")} 
                  active={formulario.Naturaleza === "Sí"} 
                  onClick={() => handleChange("Naturaleza", formulario.Naturaleza === "Sí" ? "No" : "Sí")} 
                />
                <InterestCard 
                  icon={<Landmark size={20} />} 
                  label={t("recomendador.interests.history")} 
                  active={formulario.Historia === "Sí"} 
                  onClick={() => handleChange("Historia", formulario.Historia === "Sí" ? "No" : "Sí")} 
                />
              </div>
            </Section>

            <Section icon={<Mountain className="text-amber-500" />} title={t("recomendador.sections.physical") }>
              <div className="grid md:grid-cols-3 gap-6 mt-4">
                <InputGroup label={t("recomendador.fields.walking")}>
                  <div className="grid grid-cols-2 gap-2">
                    {["Sí", "No"].map(op => (
                      <button 
                        key={op} 
                        onClick={() => handleChange("Requiere caminata", op)} 
                        className={`${badgeStyle} ${formulario["Requiere caminata"] === op ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600"}`}
                      >
                        {op === "Sí" ? <><Footprints size={16} /> Sí</> : "No"}
                      </button>
                    ))}
                  </div>
                </InputGroup>
                <InputGroup label={t("recomendador.fields.difficulty")}>
                  <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                    {["Bajo", "Medio", "Alto"].map(dif => (
                      <button 
                        key={dif} 
                        onClick={() => handleChange("Nivel de dificultad", dif)} 
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formulario["Nivel de dificultad"] === dif ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                      >
                        {dif}
                      </button>
                    ))}
                  </div>
                </InputGroup>
                <InputGroup label={t("recomendador.fields.altitude")}>
                  <input 
                    type="number" 
                    value={formulario["Altura máxima tolerada"]} 
                    onChange={(e) => handleChange("Altura máxima tolerada", Number(e.target.value))} 
                    min={0}
                    max={7000}
                    className={inputStyle} 
                  />
                </InputGroup>
              </div>
            </Section>

            {/* Sección avanzada */}
            <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                  <Award size={16} className="text-indigo-500" />
                  {t("recomendador.sections.advanced")}
                </span>
                {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              
              {showAdvanced && (
                <div className="p-6 pt-0 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputGroup label={t("recomendador.fields.budget")}>
                      <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                        {["Bajo", "Medio", "Alto"].map(p => (
                          <button
                            key={p}
                            onClick={() => handleChange("Presupuesto", p)}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 ${formulario.Presupuesto === p ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}
                          >
                            {p === "Bajo" && "💰"}
                            {p === "Medio" && "💰💰"}
                            {p === "Alto" && "💰💰💰"}
                            {p}
                          </button>
                        ))}
                      </div>
                    </InputGroup>
                    <InputGroup label={t("recomendador.fields.days")}>
                      <input
                        type="number"
                        value={formulario["Días de viaje"]}
                        onChange={(e) => handleChange("Días de viaje", Number(e.target.value))}
                        min={1}
                        max={30}
                        className={inputStyle}
                      />
                    </InputGroup>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputGroup label={t("recomendador.fields.tripType")}>
                      <select
                        value={formulario["Tipo de viaje"]}
                        onChange={(e) => handleChange("Tipo de viaje", e.target.value)}
                        className={inputStyle}
                      >
                        <option value="Cultural">Cultural</option>
                        <option value="Aventura">Aventura</option>
                        <option value="Relax">Relax</option>
                        <option value="Gastronómico">Gastronómico</option>
                        <option value="Fotográfico">Fotográfico</option>
                      </select>
                    </InputGroup>
                    <InputGroup label={t("recomendador.fields.transport")}>
                      <select
                        value={formulario["Tipo de transporte"]}
                        onChange={(e) => handleChange("Tipo de transporte", e.target.value)}
                        className={inputStyle}
                      >
                        <option value="Bus">Bus</option>
                        <option value="Auto privado">Auto privado</option>
                        <option value="Tren">Tren</option>
                        <option value="Avión">Avión</option>
                      </select>
                    </InputGroup>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={enviarDatos} 
              disabled={loading} 
              className="w-full bg-slate-900 text-white py-5 rounded-3xl text-lg font-bold hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.99] relative overflow-hidden group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> 
                  {t("recomendador.loading")}
                </>
              ) : (
                <>
                  <span className="relative z-10 flex items-center gap-3">
                    {t("recomendador.search")}
                    <Sparkles size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </>
              )}
            </button>
          </div>

          {/* Sidebar de Resultados - MEJORADO */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit z-0">
            {loading ? (
              <div className="bg-white p-8 rounded-[35px] shadow-xl border border-slate-100 text-center animate-pulse">
                <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                  <Loader2 size={32} className="text-indigo-600 animate-spin" />
                </div>
                <p className="font-bold text-slate-800">{t("recomendador.searching")}</p>
                <p className="text-xs text-slate-400 mt-1">{t("recomendador.wait")}</p>
              </div>
            ) : resultado && resultado.top && resultado.top.length > 0 ? (
              <div className="bg-white p-6 rounded-[35px] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-black flex items-center gap-2">🚀 {t("recomendador.topTitle")}</h2>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">
                    {resultado.top.length} {t("recomendador.found")}
                  </span>
                </div>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {resultado.top.map((item, i) => {
                    const pct = item.score != null ? Math.round(item.score * 100) : null;
                    const info = getDestinoInfo(item.destino);
                    const colores = info.color ? info.color.split(' ') : ['from-indigo-500', 'to-purple-600'];
                    
                    return (
                      <div 
                        key={i} 
                        className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:shadow-md"
                      >
                        {/* Badge de posición */}
                        <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-2xl bg-gradient-to-r ${colores.join(' ')}`}>
                          #{i + 1}
                        </div>
                        
                        <div className="flex items-start gap-3 pr-12">
                          <span className="text-2xl">{info.emoji || '📍'}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-sm">{item.destino}</h3>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-full">{t(info.tipo_key || 'tipo_destino')}</span>
                              <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Clock size={9} /> {t(info.duracion_key || 'dur_variable')}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                                info.dificultad_key === 'dif_baja' ? 'bg-green-50 text-green-600' :
                                info.dificultad_key === 'dif_alta' ? 'bg-red-50 text-red-600' :
                                'bg-yellow-50 text-yellow-600'
                              }`}>
                                {t(info.dificultad_key || 'dif_moderada')}
                              </span>
                            </div>
                            {pct !== null && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-slate-200 rounded-full h-1">
                                  <div 
                                    className={`h-1 rounded-full bg-gradient-to-r ${colores.join(' ')} transition-all duration-1000`} 
                                    style={{ width: `${Math.min(pct, 100)}%` }} 
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-slate-500">{pct}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                          {onConsultarChat && (
                            <button
                              onClick={() => onConsultarChat(item.destino)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl py-1.5 transition-colors"
                            >
                              <MessageCircle size={12} /> Chat
                            </button>
                          )}
                          <button
                            onClick={() => handleAgregarItinerario(item.destino)}
                            className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl py-1.5 transition-colors"
                          >
                            <Plus size={12} /> {t("recomendador.addBtn")}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className={`bg-indigo-50/60 p-8 rounded-[35px] border-2 border-dashed border-indigo-100 text-center transition-all ${isFirstLoad ? 'opacity-100' : 'opacity-0'}`}>
                <MapPin className="mx-auto mb-3 text-indigo-500" size={30} />
                <p className="text-indigo-950 font-black text-sm">{t("recomendador.empty.title")}</p>
                <p className="text-indigo-400 text-xs mt-1">{t("recomendador.empty.subtitle")}</p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="text-[10px] bg-white/60 px-3 py-1 rounded-full border border-indigo-100">🌄 Machu Picchu</span>
                  <span className="text-[10px] bg-white/60 px-3 py-1 rounded-full border border-indigo-100">🏔️ Montaña 7 Colores</span>
                  <span className="text-[10px] bg-white/60 px-3 py-1 rounded-full border border-indigo-100">🏞️ Laguna Humantay</span>
                </div>
              </div>
            )}
            {error && (
              <div className="mt-4 text-red-500 text-center font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                <Info size={14} className="inline mr-1.5" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Mapa interactivo */}
        {resultado && resultado.top && resultado.top.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-0">
            <MapaDestinos
              destinos={resultado.top}
              titleOverride={t("recomendador.mapTitle", { count: resultado.top.length })}
              subtitleOverride={t("recomendador.mapCount", { count: resultado.top.length })}
            />
          </div>
        )}
      </main>

      {/* Modal con Portal */}
      {showAddModal && selectedDestino && 
        createPortal(
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 md:p-6 transition-all animate-in fade-in duration-200 z-[99999]">
            <div className="w-full max-w-lg transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
              <AgregarDestinoModal
                lugarNombre={selectedDestino.nombre}
                lugarTipo={selectedDestino.tipo}
                tourRecomendado={selectedDestino.tour}
                onClose={() => setShowAddModal(false)}
                onAgregar={handleConfirmarAgregar}
              />
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
}

// Subcomponentes de UI
function Section({ icon, title, children }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputGroup({ label, children }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-400 uppercase px-1">{label}</label>
      {children}
    </div>
  );
}

function InterestCard({ icon, label, active, onClick }: any) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-xs ${
        active 
          ? "border-indigo-600 bg-indigo-50 text-indigo-600 scale-105 shadow-md" 
          : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white hover:border-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
      {active && <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">✓</span>}
    </button>
  );
}

const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-4 py-4 focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all outline-none";
const badgeStyle = "flex-1 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-transparent shadow-sm";