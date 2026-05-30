import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Heart, Users, Activity, Sparkles, 
  Camera, Utensils, Trees, Landmark, Compass,
  ShieldAlert, Globe, Coins, ShieldCheck, BaggageClaim, ArrowRight
} from "lucide-react";

export default function PerfilViajero() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        edad: "",
        pais: "",
        idioma: "Español",
        presupuesto: "medio",
        dias: "",
        tipoViaje: "cultural",
        caminar: "medio",
        movilidad: "normal",
        salud: "no",
        alergias: "no",
        naturaleza: "no",
        historia: "no",
        fotografia: "no",
        comida: "no",
        dificultad: "medio",
        altura: "",
        transporte: "bus",
        adultoMayor: "no",
        ninos: "no",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleValueChange = (name: string, value: string) => {
        setForm({ ...form, [name]: value });
    };

    // LÓGICA DE DETECCIÓN DINÁMICA DE PAQUETE BASE
    const obtenerConfiguracionPaquete = () => {
        let titulo = "Cusco Tradicional & Confort";
        let tags: string[] = [];
        let baseRuta = "Valle Sagrado + Machu Picchu Clásico";

        if (form.movilidad === "silla" || form.salud === "si" || form.dificultad === "bajo" || form.adultoMayor === "si") {
            titulo = "Cusco Accesible & Plácido";
            baseRuta = "Machu Picchu en Tren Premium + City Tour Adaptado";
            tags = ["Bajo Impacto", "Oxígeno Controlado", "Transporte Privado"];
        } else if (form.tipoViaje === "aventura" && (form.caminar === "mucho" || form.dificultad === "alto")) {
            titulo = "Expedición Inca Extrema";
            baseRuta = "Salkantay Trek o Choquequirao + Humantay Directo";
            tags = ["Alta Exigencia", "Trekking 4000+ msnm", "Adrenalina"];
        } else if (form.historia === "si" && form.naturaleza === "si") {
            titulo = "Inca Crónicas & Paisajes";
            baseRuta = "Ollantaytambo + Pisac Profundo + Maras Moray";
            tags = ["Inmersión Cultural", "Paisajes de Postal"];
        }

        // Añadir dinámicamente extras basados en los intereses encendidos
        if (form.comida === "si") tags.push("Ruta Gastronómica Inka Fusion");
        if (form.fotografia === "si") tags.push("Sesiones Early-Bird (Luz Óptima)");

        return { titulo, baseRuta, tags };
    };

    const paqueteActual = obtenerConfiguracionPaquete();

    const procesarYEnviar = () => {
        // Serializamos los datos para que el motor inteligente reciba todo el ADN del viaje
        const queryParams = new URLSearchParams({
            ...form,
            paqueteSugerido: paqueteActual.titulo
        }).toString();
        
        navigate(`/planificador?${queryParams}`);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 text-slate-100 font-sans relative overflow-hidden selection:bg-cyan-500/30">
            
            {/* BACKGROUND FUTURISTA */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-t from-indigo-500/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

            {/* CONTENEDOR SPLIT: Formulario Izquierda | Pre-visualización Paquete Derecha */}
            <div className="w-full max-w-6xl bg-slate-900/30 backdrop-blur-2xl border border-slate-800/80 rounded-[40px] p-6 md:p-8 shadow-2xl relative grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* COLUMNA FORMULARIO (2 tercios en desktop) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* ENCABEZADO */}
                    <div className="border-b border-slate-800/60 pb-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
                            <Sparkles size={14} className="animate-spin" /> Configuración de ADN de Viaje
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                            Pasaporte <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400">Inteligente</span>
                        </h1>
                    </div>

                    {/* FILA 1: LOGÍSTICA FLUIDA */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 border border-slate-800/80 p-5 rounded-3xl">
                        <CustomInput icon={<Globe size={14} />} label="Procedencia" name="pais" value={form.pais} placeholder="Ej: México" onChange={handleInputChange} />
                        <CustomInput icon={<Activity size={14} />} label="Edad exacta" name="edad" type="number" value={form.edad} placeholder="Ej: 25" onChange={handleInputChange} />
                        <CustomInput icon={<Coins size={14} />} label="Días libres" name="dias" type="number" value={form.dias} placeholder="Ej: 7" onChange={handleInputChange} />
                    </div>

                    {/* FILA 1.5: PRESUPUESTO */}
                    <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-3xl">
                        <span className="text-[11px] font-mono tracking-wider text-slate-500 uppercase block mb-2">Rango Económico Proyectado</span>
                        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                            {["económico", "medio", "alto"].map((p) => (
                                <button key={p} onClick={() => handleValueChange("presupuesto", p)} className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${form.presupuesto === p ? "bg-cyan-500 text-slate-950 font-black shadow-lg" : "text-slate-500 hover:text-slate-300"}`}>
                                    {p === "alto" ? "Premium" : p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FILA 2: INTERESES DE EXPERIENCIA */}
                    <div>
                        <span className="text-[11px] font-mono tracking-wider text-slate-500 uppercase block mb-2.5 px-1">Sección II: Impulsores de Experiencia (Filtros Algorítmicos)</span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            <FeatureCard icon={<Camera size={18} />} label="Fotografía" active={form.fotografia === "si"} onClick={() => handleValueChange("fotografia", form.fotografia === "si" ? "no" : "si")} color="border-cyan-500/40 text-cyan-400 bg-cyan-500/5" />
                            <FeatureCard icon={<Utensils size={18} />} label="Comida Local" active={form.comida === "si"} onClick={() => handleValueChange("comida", form.comida === "si" ? "no" : "si")} color="border-yellow-500/40 text-yellow-400 bg-yellow-500/5" />
                            <FeatureCard icon={<Trees size={18} />} label="Naturaleza" active={form.naturaleza === "si"} onClick={() => handleValueChange("naturaleza", form.naturaleza === "si" ? "no" : "si")} color="border-emerald-500/40 text-emerald-400 bg-emerald-500/5" />
                            <FeatureCard icon={<Landmark size={18} />} label="Arqueología" active={form.historia === "si"} onClick={() => handleValueChange("historia", form.historia === "si" ? "no" : "si")} color="border-indigo-500/40 text-indigo-400 bg-indigo-50/5" />
                            <FeatureCard icon={<Compass size={18} />} label="Aventura" active={form.tipoViaje === "aventura"} onClick={() => handleValueChange("tipoViaje", form.tipoViaje === "aventura" ? "cultural" : "aventura")} color="border-pink-500/40 text-pink-400 bg-pink-500/5" />
                        </div>
                    </div>

                    {/* FILA 3: CONDICIONES FÍSICAS */}
                    <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-[30px] space-y-4">
                        <span className="text-[11px] font-mono tracking-wider text-slate-500 uppercase block">Sección III: Capacidad Física & Umbrales</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400">Preferencia de marcha:</label>
                                <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                                    {["poco", "medio", "mucho"].map((c) => (
                                        <button key={c} onClick={() => handleValueChange("caminar", c)} className={`py-1.5 text-xs font-semibold rounded-lg ${form.caminar === c ? "bg-slate-800 text-white font-bold" : "text-slate-500"}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400">Desafío físico aceptado:</label>
                                <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-800 text-center">
                                    {["bajo", "medio", "alto"].map((d) => (
                                        <button key={d} onClick={() => handleValueChange("dificultad", d)} className={`py-1.5 text-xs font-semibold rounded-lg uppercase ${form.dificultad === d ? "bg-red-500/20 text-red-400 border border-red-500/30" : "text-slate-500"}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-slate-400">Límite de altitud:</label>
                                <div className="relative">
                                    <input type="number" name="altura" value={form.altura} onChange={handleInputChange} placeholder="Ej: 3400" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500/50" />
                                    <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-500">MSNM</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-4 border-t border-slate-800/40">
                            <SafetyToggle label="Alergias Clínicas" active={form.alergias === "si"} onClick={() => handleValueChange("alergias", form.alergias === "si" ? "no" : "si")} />
                            <SafetyToggle label="Asistencia Cardio" active={form.salud === "si"} onClick={() => handleValueChange("salud", form.salud === "si" ? "no" : "si")} />
                            <SafetyToggle label="Adulto Mayor" active={form.adultoMayor === "si"} onClick={() => handleValueChange("adultoMayor", form.adultoMayor === "si" ? "no" : "si")} />
                            <SafetyToggle label="Menores de Edad" active={form.ninos === "si"} onClick={() => handleValueChange("ninos", form.ninos === "si" ? "no" : "si")} />
                        </div>
                    </div>
                </div>

                {/* COLUMNA DE PRE-ARMADO DEL PAQUETE (La gran diferencia visual y de negocio) */}
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-[30px] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
                    {/* Líneas estéticas decorativas */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div>
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-mono tracking-wider uppercase mb-4 pb-2 border-b border-slate-800">
                            <BaggageClaim size={16} className="text-cyan-400" /> Estado del Paquete Reactivo
                        </div>

                        {/* Contenedor del Título de Paquete Dinámico */}
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Modelo de Ruta Detectado</span>
                                <h3 className="text-xl font-black text-white tracking-tight mt-0.5 text-cyan-400">
                                    {paqueteActual.titulo}
                                </h3>
                            </div>

                            <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block">Columna Vertebral del Viaje</span>
                                <p className="text-xs text-slate-300 font-medium bg-slate-950 p-3 rounded-xl border border-slate-800/60 mt-1 leading-relaxed">
                                    {paqueteActual.baseRuta}
                                </p>
                            </div>

                            {/* Tags dinámicos según clicks */}
                            <div>
                                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-2">Inyecciones Inteligentes incorporadas</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {paqueteActual.tags.length > 0 ? (
                                        paqueteActual.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                                                • {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-600 italic">Personaliza las opciones de arriba para inyectar experiencias...</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GATILLO DE SALIDA DEL COMPONENTE */}
                    <div className="mt-8 pt-4 border-t border-slate-800/80">
                        <div className="bg-slate-950 p-3 rounded-xl mb-4 border border-slate-900">
                            <p className="text-[11px] text-slate-500 text-center font-mono">
                                Al presionar el botón inferior se compilará este paquete base con Inteligencia Artificial.
                            </p>
                        </div>
                        <button
                            onClick={procesarYEnviar}
                            className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-mono py-4 rounded-xl text-xs uppercase tracking-widest font-black transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 group"
                        >
                            <span>Estructurar Mi Experiencia</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}

// SUBCOMPONENTES INTERNOS ENCAPSULADOS //

function CustomInput({ label, icon, ...props }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono tracking-wider text-slate-500 uppercase flex items-center gap-1">
                {icon} {label}
            </label>
            <input {...props} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 outline-none focus:border-cyan-500/40 transition-all placeholder:text-slate-700" />
        </div>
    );
}

function FeatureCard({ icon, label, active, onClick, color }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-3.5 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 font-bold text-xs ${
                active 
                ? `${color} scale-105 shadow-md font-black` 
                : "border-slate-800 bg-slate-950 text-slate-500 hover:border-slate-700 hover:text-slate-400"
            }`}
        >
            {icon}
            <span className="text-[10px] tracking-tight">{label}</span>
        </button>
    );
}

function SafetyToggle({ label, active, onClick }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                active 
                ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold" 
                : "bg-slate-950 border-slate-800/60 text-slate-500 hover:border-slate-800"
            }`}
        >
            <span className="text-[10px] tracking-tight">{label}</span>
            {active ? <ShieldCheck size={12} className="text-cyan-400" /> : <ShieldAlert size={12} className="text-slate-700" />}
        </button>
    );
}