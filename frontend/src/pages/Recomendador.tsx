import { useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import {
  Plane, MapPin, Heart, Camera, Users, Mountain,
  Utensils, Compass, Trees, Landmark, Loader2, Footprints, MessageCircle
} from "lucide-react";
import MapaDestinos from "../components/MapaDestinos";

// Inicialización de seguridad para silenciar advertencias de idioma en la consola
if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {},
    lng: "es",
    fallbackLng: "es",
    interpolation: { escapeValue: false }
  });
}

interface Destino {
  destino: string;
  score?: number;
}

interface RecomendadorProps {
  onConsultarChat?: (destino: string) => void;
}

export default function RecomendadorModerno({ onConsultarChat }: RecomendadorProps = {}) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{ top: Destino[] } | null>(null);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    Edad: 25,
    "País / Procedencia": "Perú",
    Idioma: "Español",
    Presupuesto: "Medio", // "Bajo", "Medio", "Alto"
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
    "Nivel de dificultad": "Medio", // "Bajo", "Medio", "Alto"
    "Requiere caminata": "Sí",
    "Altura máxima tolerada": 3500,
    "Recomendación médica": "No",
    "Tipo de transporte": "Bus",
    "Tour recomendado": "Full Day",
    "Riesgo por altura": "Medio",
  });

  const handleChange = (name: string, value: any) => {
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const enviarDatos = async () => {
    setLoading(true);
    setError("");
    setResultado(null);
    
    // --- MAPEO DE TEXTO A NÚMERO EXCLUSIVO PARA EL MODELO IA DE PYTHON ---
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
      const response = await fetch("/recomendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosFormateados), // Enviamos la estructura numérica limpia
      });

      if (!response.ok) throw new Error("Error en la respuesta del servidor");
      
      const data = await response.json();
      console.log("Datos crudos recibidos del Backend:", data);

      let listaExtraida: any[] = [];

      // Extractor flexible de listas en el JSON de respuesta
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
        const formateado = listaExtraida.map(item => {
          if (typeof item === 'string') return { destino: item };
          const nombre = item.destino || item.nombre || item.lugar || Object.values(item).find(v => typeof v === 'string');
          return { destino: String(nombre || "Destino sugerido") };
        });
        setResultado({ top: formateado });
      } else {
        // En caso de que el backend retorne un objeto de error o vacío, lo imprimimos como destino de contingencia
        setResultado({ top: [{ destino: data.message || data.error || JSON.stringify(data) }] });
      }

    } catch (err: any) {
      setError("No pudimos conectar con el modelo. Verifica tu API en el puerto 8000.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white"><Plane size={24} /></div>
          <span className="text-xl font-black tracking-tighter uppercase italic">CuscoGo!</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Diseña tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">experiencia épica</span>
          </h1>
          <p className="text-slate-500 font-medium">Motor de Inteligencia Turística — Tumperu Cusco</p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-8 space-y-8">
            <Section icon={<Users className="text-indigo-500" />} title="¿Quiénes viajan?">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <InputGroup label="Edad">
                  <input type="number" value={formulario.Edad} onChange={(e) => handleChange("Edad", Number(e.target.value))} className={inputStyle} />
                </InputGroup>
                <InputGroup label="Procedencia">
                  <input type="text" value={formulario["País / Procedencia"]} onChange={(e) => handleChange("País / Procedencia", e.target.value)} className={inputStyle} />
                </InputGroup>
                <InputGroup label="¿Viajas con niños?">
                  <div className="grid grid-cols-2 gap-2 h-[56px]">
                    {["Sí", "No"].map(op => (
                      <button key={op} onClick={() => handleChange("Apto para niños", op)} className={`${badgeStyle} ${formulario["Apto para niños"] === op ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}>{op}</button>
                    ))}
                  </div>
                </InputGroup>
              </div>
            </Section>

            <Section icon={<Heart className="text-pink-500" />} title="Tus Intereses">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                <InterestCard icon={<Camera size={20} />} label="Fotos" active={formulario.Fotografía === "Sí"} onClick={() => handleChange("Fotografía", formulario.Fotografía === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Utensils size={20} />} label="Comida" active={formulario.Comida === "Sí"} onClick={() => handleChange("Comida", formulario.Comida === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Compass size={20} />} label="Trekking" active={formulario.Trekking === "Sí"} onClick={() => handleChange("Trekking", formulario.Trekking === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Trees size={20} />} label="Naturaleza" active={formulario.Naturaleza === "Sí"} onClick={() => handleChange("Naturaleza", formulario.Naturaleza === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Landmark size={20} />} label="Historia" active={formulario.Historia === "Sí"} onClick={() => handleChange("Historia", formulario.Historia === "Sí" ? "No" : "Sí")} />
              </div>
            </Section>

            <Section icon={<Mountain className="text-amber-500" />} title="Configuración Física">
              <div className="grid md:grid-cols-3 gap-6 mt-4">
                <InputGroup label="¿Deseas caminata?">
                  <div className="grid grid-cols-2 gap-2">
                    {["Sí", "No"].map(op => (
                      <button key={op} onClick={() => handleChange("Requiere caminata", op)} className={`${badgeStyle} ${formulario["Requiere caminata"] === op ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600"}`}>
                        {op === "Sí" ? <><Footprints size={16} /> Sí</> : "No"}
                      </button>
                    ))}
                  </div>
                </InputGroup>
                <InputGroup label="Dificultad">
                  <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                    {["Bajo", "Medio", "Alto"].map(dif => (
                      <button key={dif} onClick={() => handleChange("Nivel de dificultad", dif)} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formulario["Nivel de dificultad"] === dif ? "bg-white shadow-sm text-slate-900" : "text-slate-400"}`}>{dif}</button>
                    ))}
                  </div>
                </InputGroup>
                <InputGroup label="Altura Máx (msnm)">
                  <input type="number" value={formulario["Altura máxima tolerada"]} onChange={(e) => handleChange("Altura máxima tolerada", Number(e.target.value))} className={inputStyle} />
                </InputGroup>
              </div>
            </Section>

            <button onClick={enviarDatos} disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-3xl text-lg font-bold hover:bg-indigo-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 active:scale-[0.99]">
              {loading ? <><Loader2 className="animate-spin" /> Analizando coordenadas...</> : "Buscar Destinos Ideales 🧭"}
            </button>
          </div>

          {/* Columna Derecha: Sidebar de Resultados */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
            {resultado && resultado.top && resultado.top.length > 0 ? (
              <div className="bg-white p-6 rounded-[35px] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                <h2 className="text-xl font-black mb-4 flex items-center gap-2">🚀 Match de Aventura</h2>
                <div className="space-y-3">
                  {resultado.top.map((item, i) => {
                    const pct = item.score != null ? Math.round(item.score * 100) : null;
                    const barColor = i === 0 ? "bg-indigo-600" : i === 1 ? "bg-indigo-400" : "bg-slate-300";
                    return (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-500 transition-all">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black uppercase text-indigo-500">Destino Recomendado</span>
                          <div className="flex items-center gap-2">
                            {pct !== null && (
                              <span className="text-[10px] font-bold text-slate-500">{pct}%</span>
                            )}
                            <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">{i + 1}</div>
                          </div>
                        </div>
                        <p className="text-base font-black text-slate-800 mb-2">{item.destino}</p>
                        {pct !== null && (
                          <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                            <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        )}
                        {onConsultarChat && (
                          <button
                            onClick={() => onConsultarChat(item.destino)}
                            className="w-full flex items-center justify-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl py-2 transition-colors"
                          >
                            <MessageCircle size={13} /> Preguntar al asistente
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/60 p-8 rounded-[35px] border-2 border-dashed border-indigo-100 text-center">
                {!loading ? (
                  <>
                    <MapPin className="mx-auto mb-3 text-indigo-500" size={30} />
                    <p className="text-indigo-950 font-black text-sm">Configura tu brújula</p>
                    <p className="text-indigo-400 text-xs mt-1">Elige tus preferencias a la izquierda para ver tu recomendación al instante.</p>
                  </>
                ) : <p className="animate-pulse font-bold text-indigo-600">Consultando al experto en Cusco...</p>}
              </div>
            )}
            {error && <p className="mt-4 text-red-500 text-center font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          </div>
        </div>

        {/* Mapa interactivo: aparece debajo cuando hay resultados */}
        {resultado && resultado.top && resultado.top.length > 0 && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MapaDestinos destinos={resultado.top} />
          </div>
        )}
      </main>
    </div>
  );
}

// Subcomponentes de UI Estilizados con Tailwind
function Section({ icon, title, children }: any) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100">
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
    <button type="button" onClick={onClick} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 font-bold text-xs ${active ? "border-indigo-600 bg-indigo-50 text-indigo-600 scale-105 shadow-md" : "border-slate-100 bg-slate-50 text-slate-400 hover:bg-white"}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-4 py-4 focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all";
const badgeStyle = "flex-1 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-transparent shadow-sm";