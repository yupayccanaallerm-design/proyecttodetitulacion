import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import { 
  Map, Menu, X, Globe, ArrowRight, MessageSquare, ShieldCheck, Sparkles, 
  Compass, Leaf, Star, Award
} from "lucide-react";
import { useTranslation } from "react-i18next";

// IMPORTS DE COMPONENTES
import Tours from "./pages/Tours";
import Reservas from "./pages/Reservas";
import ChatBot from "./pages/ChatBot";
import Planificador from "./pages/Recomendador";
import PerfilViajero from "./pages/PerfilViajero";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminTours from "./pages/admin/AdminTours";
import AdminPaquetes from "./pages/admin/AdminPaquetes";
import DetalleTour from "./pages/DetalleTour";
import Login from "./pages/Login";
import GestiónUsuarios from "./pages/admin/GestionUsuarios";



function AppContent() {
  const [visible, setVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatContext, setChatContext] = useState<string>("");

  const { i18n, t } = useTranslation();
  const navigate = useNavigate(); // 👈 Hook para la redirección del doble clic

  useEffect(() => {
    setVisible(true);
  }, []);

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">

      {/* 🔝 NAVBAR PREMIUM CLIENTE */}
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl px-6 py-3 shadow-xs">

          {/* 🔐 LOGO CORPORATIVO CON ACCESO SECRETO POR DOBLE CLIC */}
          <div 
            onDoubleClick={() => navigate("/login")} // ← CAMBIADO DE "/admin" A "/login"
            className="flex items-center gap-2.5 group cursor-pointer select-none"
            title="Doble clic para acceso operativo de administración"
          >
            <Link to="/" className="flex items-center gap-2.5">
              <div className="bg-indigo-600 p-2 rounded-xl text-white group-hover:bg-indigo-700 transition-colors">
                <Map size={18} />
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">
                GRUPO TUMPERU<span className="text-indigo-600 font-bold">.</span>
              </span>
            </Link>
          </div>

          {/* ENLACES DESKTOP (PÚBLICOS Y LIMPIOS) */}
          <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-wider text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
            <Link to="/tours" className="hover:text-indigo-600 transition-colors">Tours</Link>
            <Link to="/reservas" className="hover:text-indigo-600 transition-colors">Reservas</Link>
            <Link to="/planificador" className="hover:text-indigo-600 transition-colors">Planificador</Link>
            <Link to="/perfilviajero" className="hover:text-indigo-600 transition-colors">Perfil Viajero</Link>
          </div>

          {/* SECCIÓN DERECHA */}
          <div className="flex items-center gap-4">
            {/* Idiomas */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-[11px] font-medium border border-slate-200/40">
              <Globe size={12} className="text-slate-400 ml-1.5 hidden sm:inline" />
              <button
                onClick={() => changeLang("es")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${i18n.language === "es" ? "bg-white text-indigo-600 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                ES
              </button>
              <button
                onClick={() => changeLang("en")}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${i18n.language === "en" ? "bg-white text-indigo-600 shadow-xs font-semibold" : "text-slate-500 hover:text-slate-900"}`}
              >
                EN
              </button>
            </div>

            {/* Botón Chat IA */}
            <button
              onClick={() => {
                setOpenChat(!openChat);
                if (!openChat) setChatContext(""); 
              }}
              className={`p-2 rounded-xl transition-all duration-300 cursor-pointer border ${openChat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-indigo-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <MessageSquare size={18} />
            </button>

            {/* Mobile Menu Trigger */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600 p-1">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MENU MOBILE CLIENTE */}
      {isMenuOpen && (
        <div className="fixed top-[76px] left-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-lg z-50 flex flex-col gap-4 text-center text-sm font-medium">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">Inicio</Link>
          <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">Tours</Link>
          <Link to="/reservas" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">Reservas</Link>
          <Link to="/planificador" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">Planificador</Link>
          <Link to="/perfilviajero" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">Perfil Viajero</Link>
        </div>
      )}

      {/* CHAT FLOTANTE */}
      {openChat && (
        <div className="fixed bottom-24 right-4 md:right-8 w-[350px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-xl z-[200] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-4 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            <span className="text-xs font-medium tracking-wide">Concierge Virtual SGEV</span>
            <button onClick={() => setOpenChat(false)} className="text-slate-400 hover:text-white cursor-pointer text-xs">✕</button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-50/50">
            <ChatBot initialContext={openChat && chatContext ? chatContext : ""} />
          </div>
        </div>
      )}

      {/* NAVEGACIÓN DE VISTAS */}
      <main className="flex-grow pt-20">
        <Routes>
          {/* Rutas Públicas de la Experiencia del Viajero */}
          <Route path="/" element={<Home visible={visible} />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/planificador" element={<Planificador onConsultarChat={(destino) => { setChatContext(destino); setOpenChat(true); }} />} />
          <Route path="/perfilviajero" element={<PerfilViajero onPlaceDetected={(place) => { setChatContext(place); setOpenChat(true); }} />} />
          <Route path="/detalle/:id" element={<DetalleTour />} />
          <Route path="/login" element={<Login />} />
          {/* 🔐 CONTROL INTERNO (ADMINISTRACIÓN ANIDADA) */}
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminReservas />} /> 
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="paquetes" element={<AdminPaquetes />} /> 
            <Route path="usuarios" element={<GestiónUsuarios />} />  
          </Route>
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-white border-t border-slate-200/60 text-center text-slate-400 text-[11px] font-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 GRUPO TUMPERU. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <p className="font-normal text-slate-500">SGEV — Gestión Turística Inteligente</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 📦 CONTENEDOR ENVOLTORIO OBLIGATORIO PARA EL HOOK useNavigate
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

/* 🏠 VISTA HOME COMPLETA */
function Home({ visible }: { visible: boolean }) {
  const acronimo = [
    { letra: "G", texto: "Grandes experiencias diseñadas para ti." },
    { letra: "T", texto: "Tu pasión por viajar es nuestra inspiración." },
    { letra: "P", texto: "Promovemos el turismo sostenible y exclusivo." },
    { letra: "T", texto: "Te llevamos a explorar destinos extraordinarios." },
    { letra: "R", texto: "Respaldamos tus sueños con itinerarios únicos." },
    { letra: "A", texto: "Aventuras que conectan con la cultura y la naturaleza." },
    { letra: "V", texto: "Viajes llenos de excelencia y dedicación." },
    { letra: "E", texto: "Emociones que recordarás toda la vida." },
    { letra: "L", texto: "Lealtad y confianza en cada paso de tu travesía." }
  ];

  return (
    <div className="space-y-20">
      {/* 1. CARÁTULA PRINCIPAL (HERO) */}
      <div className="px-4 md:px-8 pt-4">
        <header className="min-h-[85vh] flex items-center justify-center text-center relative rounded-3xl overflow-hidden shadow-xs">
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-102"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587595431973-160d0d94add1')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-slate-900/60 to-slate-950/80" />

          <div className={`relative z-10 max-w-2xl px-4 transition-all duration-700 transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
              <Sparkles size={12} className="text-amber-400" /> Turismo Exclusivo y Sostenible
            </span>
            <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-white mb-4">
              GRUPO TUMPERU TRAVEL
            </h1>
            <p className="text-sm md:text-base text-slate-300 mb-8 max-w-md mx-auto font-light leading-relaxed">
              Turismo inteligente con IA en Cusco. Diseñamos experiencias memorables y soluciones a tu medida.
            </p>
            <Link to="/tours">
              <button className="bg-white text-slate-900 px-8 py-3.5 rounded-full text-xs font-medium tracking-wide hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2 group mx-auto cursor-pointer">
                Explorar Paquetes
                <ArrowRight size={14} className="text-indigo-600 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </header>
      </div>

      {/* 2. SECCIÓN CONÓCENOS & HISTORIA */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Nuestra Historia
          </span>
          <h2 className="text-3xl font-light tracking-tight text-slate-900 mt-3 mb-6">
            Comprometidos con la <span className="font-semibold text-indigo-600">excelencia</span>
          </h2>
          <div className="space-y-4 text-slate-500 font-light text-sm leading-relaxed">
            <p>
              GRUPO TUMPERU nació de la iniciativa de un grupo de profesionales multidisciplinarios con amplia experiencia en el sector turístico, quienes decidieron unir sus conocimientos y pasión por el Perú para ofrecer una propuesta única y exclusiva.
            </p>
            <p>
              A través de itinerarios exclusivos, atención personalizada y un profundo compromiso con el turismo sostenible, la agencia se ha consolidado como un referente para aquellos que buscan vivir experiencias auténticas e inolvidables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Compass size={14} className="text-indigo-600" /> Misión
              </h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Crear itinerarios únicos y personalizados conectando a los viajeros con la riqueza cultural del Perú mediante turismo sostenible.
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Leaf size={14} className="text-emerald-600" /> Visión
              </h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                Ser la agencia referente de turismo sostenible en el país, llevando la esencia del Perú al mundo con respeto al medio ambiente.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 text-white">
            <Map size={240} />
          </div>
          <h3 className="text-lg font-light tracking-wide mb-6">
            ¿Qué significa <span className="font-semibold text-indigo-400">GRUPO TUMPERU</span>?
          </h3>
          <div className="space-y-3.5">
            {acronimo.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 group">
                <span className="bg-white/10 text-indigo-300 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {item.letra}
                </span>
                <p className="text-xs text-slate-300 font-light leading-normal self-center">
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN VALORES CORPORATIVOS */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Filosofía de Viaje
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 mt-3">
              Nuestros Pilares Fundamentales
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Award className="text-indigo-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">Autenticidad</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">Experiencias culturales genuinas, resaltando la verdadera riqueza histórica de cada destino.</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Leaf className="text-emerald-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">Sostenibilidad</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">Respeto absoluto por la conservación del patrimonio natural y el soporte a economías locales.</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <ShieldCheck className="text-indigo-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">Confianza</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">Garantía de un servicio transparente y completamente seguro en cada fase de tu travesía.</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Star className="text-amber-500" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">Exclusividad</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">Máxima personalización y cuidado meticuloso en cada pequeño detalle de tu itinerario.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}