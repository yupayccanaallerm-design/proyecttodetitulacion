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
import Descubre from "./pages/Descubre";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReservas from "./pages/admin/AdminReservas";
import AdminTours from "./pages/admin/AdminTours";
import AdminPaquetes from "./pages/admin/AdminPaquetes";
import DetalleTour from "./pages/DetalleTour";
import Login from "./pages/Login";
import Paquetes from "./pages/Paquetes";
import DetallePaquete from "./pages/DetallePaquete";
import GestiónUsuarios from "./pages/admin/GestionUsuarios";
import { ItinerarioProvider } from './contexts/ItinerarioContext';
import { ResumenItinerario } from './components/ResumenItinerario';


// ============================================================
// 🆕 COMPONENTE PRINCIPAL - El Provider envuelve TODO
// ============================================================
export default function App() {
  return (
    <BrowserRouter>
      <ItinerarioProvider>
        <AppContent />
      </ItinerarioProvider>
    </BrowserRouter>
  );
}

// ============================================================
// TODO EL CONTENIDO DE LA APP (DENTRO DEL PROVIDER)
// ============================================================
function AppContent() {
  const [visible, setVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatContext, setChatContext] = useState<string>("");

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    setVisible(true);
  }, []);

  const changeLang = (lang: string) => {
    localStorage.setItem("lang", lang);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* 🔝 NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-2xl px-6 py-3 shadow-xs">
          <div 
            onDoubleClick={() => navigate("/login")} 
            className="flex items-center gap-2.5 group cursor-pointer select-none"
            title={t("app_admin_tooltip")}
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

          <div className="hidden md:flex gap-8 text-xs font-medium uppercase tracking-wider text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">{i18n.t("nav_inicio")}</Link>
            <Link to="/tours" className="hover:text-indigo-600 transition-colors">{i18n.t("nav_tours")}</Link>
            <Link to="/planificador" className="hover:text-indigo-600 transition-colors">{i18n.t("nav_planificador")}</Link>
            <Link to="/descubre" className="hover:text-indigo-600 transition-colors">{i18n.t("nav_descubre")}</Link>
            <Link to="/paquetes" className="hover:text-indigo-600 transition-colors">{i18n.t("nav_paquetes")}</Link>
          </div>

          <div className="flex items-center gap-4">
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

            <button
              onClick={() => {
                setOpenChat(!openChat);
                if (!openChat) setChatContext(""); 
              }}
              className={`p-2 rounded-xl transition-all duration-300 cursor-pointer border ${openChat ? "bg-slate-900 text-white border-slate-900" : "bg-white text-indigo-600 border-slate-200 hover:bg-slate-50"}`}
            >
              <MessageSquare size={18} />
            </button>

            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-slate-600 p-1">
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed top-[76px] left-4 right-4 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-slate-200 shadow-lg z-50 flex flex-col gap-4 text-center text-sm font-medium">
          <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">{i18n.t("nav_inicio")}</Link>
          <Link to="/tours" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">{i18n.t("nav_tours")}</Link>
          <Link to="/planificador" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">{i18n.t("nav_planificador")}</Link>
          <Link to="/descubre" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">{i18n.t("nav_descubre")}</Link>
          <Link to="/paquetes" onClick={() => setIsMenuOpen(false)} className="py-2 hover:bg-slate-50 rounded-xl">{i18n.t("nav_paquetes")}</Link>
        </div>
      )}

      {openChat && (
        <div className="fixed bottom-24 right-4 md:right-8 w-[350px] h-[500px] bg-white border border-slate-200 rounded-2xl shadow-xl z-[200] overflow-hidden flex flex-col">
          <div className="flex justify-between items-center px-4 py-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
            <span className="text-xs font-medium tracking-wide">{i18n.t("app_concierge")}</span>
            <button onClick={() => setOpenChat(false)} className="text-slate-400 hover:text-white cursor-pointer text-xs">✕</button>
          </div>
          <div className="flex-1 overflow-auto bg-slate-50/50">
            <ChatBot initialContext={openChat && chatContext ? chatContext : ""} />
          </div>
        </div>
      )}

      {/* 🆕 MAIN CON ROUTES - AHORA DENTRO DEL PROVIDER */}
      <main className="flex-grow pt-20">
        <Routes>
          <Route path="/" element={<Home visible={visible} />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/planificador" element={<Planificador onConsultarChat={(destino) => { setChatContext(destino); setOpenChat(true); }} />} />
          <Route path="/descubre" element={<Descubre onPlaceDetected={(place) => { setChatContext(place); setOpenChat(true); }} />} />
          <Route path="/detalle/:id" element={<DetalleTour />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/detalle-paquete/:id" element={<DetallePaquete />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<AdminReservas />} /> 
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="paquetes" element={<AdminPaquetes />} /> 
            <Route path="usuarios" element={<GestiónUsuarios />} />  
          </Route>
        </Routes>
      </main>

      {/* 🆕 ResumenItinerario - AHORA DENTRO DEL PROVIDER */}
      <ResumenItinerario />

      <footer className="py-8 bg-white border-t border-slate-200/60 text-center text-slate-400 text-[11px] font-light">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>{i18n.t("footer_derechos")}</p>
          <div className="flex items-center gap-4">
            <p className="font-normal text-slate-500">{i18n.t("footer_sgev")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// 🏠 HOME
// ============================================================
function Home({ visible }: { visible: boolean }) {
  const { t } = useTranslation();
  const acronimo = [
    { letra: "G", texto: t("home_acronimo_g") },
    { letra: "T", texto: t("home_acronimo_t1") },
    { letra: "P", texto: t("home_acronimo_p") },
    { letra: "T", texto: t("home_acronimo_t2") },
    { letra: "R", texto: t("home_acronimo_r") },
    { letra: "A", texto: t("home_acronimo_a") },
    { letra: "V", texto: t("home_acronimo_v") },
    { letra: "E", texto: t("home_acronimo_e") },
    { letra: "L", texto: t("home_acronimo_l") },
  ];

  return (
    <div className="space-y-20">
      {/* HERO */}
      <div className="px-4 md:px-8 pt-4">
        <header className="min-h-[85vh] flex items-center justify-center text-center relative rounded-3xl overflow-hidden shadow-xs">
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-102"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587595431973-160d0d94add1')" }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-slate-900/60 to-slate-950/80" />

          <div className={`relative z-10 max-w-2xl px-4 transition-all duration-700 transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
              <Sparkles size={12} className="text-amber-400" /> {t("home_badge")}
            </span>
            <h1 className="text-4xl md:text-6xl font-extralight tracking-tight text-white mb-4">
              {t("home_hero_titulo")}
            </h1>
            <p className="text-sm md:text-base text-slate-300 mb-8 max-w-md mx-auto font-light leading-relaxed">
              {t("home_hero_desc")}
            </p>
            <Link to="/tours">
              <button className="bg-white text-slate-900 px-8 py-3.5 rounded-full text-xs font-medium tracking-wide hover:bg-slate-50 transition-all shadow-lg flex items-center gap-2 group mx-auto cursor-pointer">
                {t("home_hero_btn")}
                <ArrowRight size={14} className="text-indigo-600 transform group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
          </div>
        </header>
      </div>

      {/* SECCIÓN CONÓCENOS */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            {t("home_about_badge")}
          </span>
          <h2 className="text-3xl font-light tracking-tight text-slate-900 mt-3 mb-6">
            {t("home_about_titulo")}
          </h2>
          <div className="space-y-4 text-slate-500 font-light text-sm leading-relaxed">
            <p>{t("home_about_p1")}</p>
            <p>{t("home_about_p2")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Compass size={14} className="text-indigo-600" /> {t("home_mision_titulo")}
              </h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {t("home_mision_desc")}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-2">
                <Leaf size={14} className="text-emerald-600" /> {t("home_vision_titulo")}
              </h4>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {t("home_vision_desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 text-white">
            <Map size={240} />
          </div>
          <h3 className="text-lg font-light tracking-wide mb-6">
            {t("home_acronimo_titulo").split("GRUPO TUMPERU").map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<span className="font-semibold text-indigo-400">GRUPO TUMPERU</span></span>
                : <span key={i}>{part}</span>
            )}
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

      {/* VALORES */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              {t("home_pilares_badge")}
            </span>
            <h2 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 mt-3">
              {t("home_pilares_titulo")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Award className="text-indigo-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">{t("home_pilar1_titulo")}</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">{t("home_pilar1_desc")}</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Leaf className="text-emerald-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">{t("home_pilar2_titulo")}</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">{t("home_pilar2_desc")}</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <ShieldCheck className="text-indigo-600" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">{t("home_pilar3_titulo")}</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">{t("home_pilar3_desc")}</p>
            </div>
            <div className="p-5 rounded-2xl hover:bg-slate-50 transition-colors flex flex-col gap-3">
              <Star className="text-amber-500" size={24} />
              <h3 className="text-sm font-semibold text-slate-800">{t("home_pilar4_titulo")}</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">{t("home_pilar4_desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}