import { useState } from "react";
import { 
  Plane, MapPin, Heart, Activity, Camera, 
  Users, Mountain, Wallet, Calendar, Check, 
  Utensils, Compass, Trees, Landmark, Footprints, Baby
} from "lucide-react";

export default function RecomendadorModerno() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState("");

  const [formulario, setFormulario] = useState({
    Edad: 25,
    "País / Procedencia": "Perú",
    Idioma: "Español",
    Presupuesto: "Medio",
    "Días de viaje": 5,
    "Tipo de viaje": "Cultural",
    
    // Filtros de Salud y Restricciones
    "Problemas respiratorios": "No",
    "Movilidad reducida": "No",
    Alergias: "No",
    "Apto para adulto mayor": "Sí",
    "Apto para niños": "No", // Añadido por solicitud de niños

    // Intereses (Cambiados a booleanos conceptuales para la UI)
    Comida: "Sí",
    Naturaleza: "Sí",
    Historia: "Sí", // Arqueológico / Historia
    Fotografía: "Sí",
    Trekking: "Sí", // Trekking añadido

    // Configuración física de la ruta
    "Nivel de dificultad": "Medio", // Bajo, Medio, Alto
    "Requiere caminata": "Sí",
    "Altura máxima tolerada": 3500,

    // Datos extra por defecto para el backend
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
    try {
      const response = await fetch("/recomendacion/recomendar", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(formulario),
});
      const data = await response.json();
      setResultado(data);
    } catch (err) {
      setError("¡Ups! No pudimos conectar con el experto en viajes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      {/* Navbar */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">
            <Plane size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase italic">CuscoGo!</span>
        </div>
        <button className="text-sm font-bold bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200">
          Explorar Destinos
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Hero */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
            Diseña tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">experiencia épica</span>
          </h1>
          <p className="text-slate-500 text-base max-w-2xl mx-auto font-medium">
            Personaliza tus intereses running en Cusco y deja que nuestro motor inteligente arme tu itinerario ideal.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* SECCIÓN 1: PERFIL & COMPAÑÍA */}
            <Section icon={<Users className="text-indigo-500" />} title="¿Quiénes viajan?">
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <InputGroup label="Edad del perfil principal">
                  <input type="number" value={formulario.Edad} onChange={(e) => handleChange("Edad", Number(e.target.value))} className={inputStyle} />
                </InputGroup>
                <InputGroup label="¿De dónde nos visitas?">
                  <input type="text" value={formulario["País / Procedencia"]} onChange={(e) => handleChange("País / Procedencia", e.target.value)} className={inputStyle} />
                </InputGroup>
                <InputGroup label="¿Viajas con niños?">
                  <div className="grid grid-cols-2 gap-2 h-[56px]">
                    {["Sí", "No"].map((op) => (
                      <button key={op} onClick={() => handleChange("Apto para niños", op)} className={`${badgeStyle} ${formulario["Apto para niños"] === op ? "bg-indigo-600 text-white" : "bg-slate-50 text-slate-600"}`}>
                        {op}
                      </button>
                    ))}
                  </div>
                </InputGroup>
              </div>
            </Section>

            {/* SECCIÓN 2: INTERESES Y VIBRAS */}
            <Section icon={<Heart className="text-pink-500" />} title="¿Qué te enciende el alma? (Tus intereses)">
              <p className="text-xs text-slate-400 mb-4">Selecciona los elementos que no pueden faltar en tu viaje.</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <InterestCard icon={<Camera size={20} />} label="Fotografía" active={formulario.Fotografía === "Sí"} onClick={() => handleChange("Fotografía", formulario.Fotografía === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Utensils size={20} />} label="Comida local" active={formulario.Comida === "Sí"} onClick={() => handleChange("Comida", formulario.Comida === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Compass size={20} />} label="Trekking" active={formulario.Trekking === "Sí"} onClick={() => handleChange("Trekking", formulario.Trekking === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Trees size={20} />} label="Naturaleza" active={formulario.Naturaleza === "Sí"} onClick={() => handleChange("Naturaleza", formulario.Naturaleza === "Sí" ? "No" : "Sí")} />
                <InterestCard icon={<Landmark size={20} />} label="Arqueología" active={formulario.Historia === "Sí"} onClick={() => handleChange("Historia", formulario.Historia === "Sí" ? "No" : "Sí")} />
              </div>
            </Section>

            {/* SECCIÓN 3: CONFIGURACIÓN DE AVENTURA FÍSICA */}
            <Section icon={<Mountain className="text-amber-500" />} title="Nivel de Aventura y Desafío">
              <div className="grid md:grid-cols-3 gap-6 mt-4">
                
                <InputGroup label="¿Te gusta caminar?">
                  <div className="grid grid-cols-2 gap-2">
                    {["Sí", "No"].map((op) => (
                      <button key={op} onClick={() => handleChange("Requiere caminata", op)} className={`${badgeStyle} ${formulario["Requiere caminata"] === op ? "bg-amber-500 text-white" : "bg-slate-50 text-slate-600"}`}>
                        {op === "Sí" ? <><Footprints size={16} /> Sí</> : "No"}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup label="Dificultad preferida">
                  <div className="flex bg-slate-50 p-1 rounded-2xl gap-1">
                    {["Bajo", "Medio", "Alto"].map((dif) => (
                      <button key={dif} onClick={() => handleChange("Nivel de dificultad", dif)} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${formulario["Nivel de dificultad"] === dif ? "bg-white shadow-sm text-slate-900 scale-105" : "text-slate-400 hover:text-slate-600"}`}>
                        {dif}
                      </button>
                    ))}
                  </div>
                </InputGroup>

                <InputGroup label="Altura máx. tolerada (msnm)">
                  <div className="relative">
                    <input type="number" value={formulario["Altura máxima tolerada"]} onChange={(e) => handleChange("Altura máxima tolerada", Number(e.target.value))} className={`${inputStyle} pr-12`} />
                    <span className="absolute right-4 top-4 text-xs font-bold text-slate-400">msnm</span>
                  </div>
                </InputGroup>

              </div>
            </Section>

            {/* BOTÓN DISPARADOR */}
            <button
              onClick={enviarDatos}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-3xl text-lg font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 active:scale-[0.99]"
            >
              {loading ? "Analizando coordenadas..." : "Buscar Destinos Ideales 🧭"}
            </button>
          </div>

          {/* Sidebar de Resultados */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 h-fit">
            {resultado ? (
                <div className="bg-white p-6 rounded-[35px] shadow-xl border border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                    <span>🚀</span> Match de Aventura
                  </h2>
                  <div className="space-y-3">
                    {resultado.top && resultado.top.length > 0 ? (
                      resultado.top.map((item: any, i: number) => (
                        <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-500 hover:bg-white transition-all cursor-pointer">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Destino Recomendado</span>
                            <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                              {i+1}
                            </div>
                          </div>
                          <p className="text-base font-black text-slate-800">{item.destino}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">No se encontraron resultados</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-indigo-50/60 backdrop-blur-md p-8 rounded-[35px] border-2 border-dashed border-indigo-100 text-center">
                  <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm text-indigo-500">
                    <MapPin size={26} />
                  </div>
                  <p className="text-indigo-950 font-black text-sm">Configura tu brújula</p>
                  <p className="text-indigo-400 text-xs mt-1">Elige tus preferencias a la izquierda para ver tu recomendación al instante.</p>
                </div>
              )}
            {error && <p className="mt-4 text-red-500 text-center font-bold text-sm bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

// COMPONENTES AUXILIARES CON ESTILO //

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <h3 className="text-lg font-black tracking-tight text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InputGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">{label}</label>
      {children}
    </div>
  );
}

function InterestCard({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 font-bold text-xs ${
        active 
        ? "border-indigo-600 bg-indigo-50/50 text-indigo-600 scale-105 shadow-md shadow-indigo-50" 
        : "border-slate-100 bg-slate-50/50 text-slate-400 hover:border-slate-200 hover:bg-white"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// ESTILOS EN CONSTANTES
const inputStyle = "w-full bg-slate-50 border-none rounded-2xl px-4 py-4 focus:ring-4 focus:ring-indigo-100 font-bold text-sm transition-all placeholder:text-slate-300";
const badgeStyle = "flex-1 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-transparent shadow-sm";