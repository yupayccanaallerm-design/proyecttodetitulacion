import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Map, Menu, X, Globe, ArrowRight, Bot, ShieldCheck, Sparkles,
  Compass, Leaf, Star, Award, Users, Brain, Camera, MapPin, Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";

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
import AdminClientes from "./pages/admin/AdminClientes";
import { ItinerarioProvider } from "./contexts/ItinerarioContext";
import { ResumenItinerario } from "./components/ResumenItinerario";
import FloatingWhatsAppButton from "./components/FloatingWhatsAppButton";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <ItinerarioProvider>
        <AppContent />
      </ItinerarioProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const [visible, setVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [chatContext, setChatContext] = useState<string>("");

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => { setVisible(true); }, []);

  const changeLang = (lang: string) => {
    localStorage.setItem("lang", lang);
    window.location.reload();
  };

  const navLinks = [
    { to: "/", label: i18n.t("nav_inicio") },
    { to: "/tours", label: i18n.t("nav_tours") },
    { to: "/planificador", label: i18n.t("nav_planificador") },
    { to: "/descubre", label: i18n.t("nav_descubre") },
    { to: "/paquetes", label: i18n.t("nav_paquetes") },
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-[100] px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/90 backdrop-blur-lg border border-slate-200/60 rounded-2xl px-5 py-2.5 shadow-sm">
          <div
            onDoubleClick={() => navigate("/login")}
            title={t("app_admin_tooltip")}
            className="cursor-pointer select-none"
          >
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:bg-indigo-700 transition-colors">
                <Map size={16} />
              </div>
              <span className="text-sm font-bold tracking-tight text-slate-900">
                GRUPO TUMPERU<span className="text-indigo-600">.</span>
              </span>
            </Link>
          </div>

          <div className="hidden md:flex gap-7 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="hover:text-indigo-600 transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100 px-1 py-1 rounded-lg text-[11px] font-medium border border-slate-200/50">
              <Globe size={11} className="text-slate-400 ml-1 hidden sm:inline" />
              {["es", "en"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => changeLang(lang)}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer uppercase ${
                    i18n.language === lang
                      ? "bg-white text-indigo-600 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setOpenChat(!openChat); if (!openChat) setChatContext(""); }}
              title="Asistente IA"
              className={`p-2 rounded-xl transition-all duration-200 cursor-pointer border text-sm ${
                openChat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-indigo-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <Bot size={16} />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="fixed top-[72px] left-4 right-4 bg-white/98 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl z-50 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsMenuOpen(false)}
              className="py-2.5 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      {/* CHATBOT PANEL */}
      {openChat && (
        <ChatBot
          isFloating={true}
          onClose={() => setOpenChat(false)}
          initialContext={openChat && chatContext ? chatContext : ""}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-grow pt-[68px]">
        <Routes>
          <Route path="/" element={<Home visible={visible} />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route
            path="/planificador"
            element={
              <Planificador
                onConsultarChat={(destino) => { setChatContext(destino); setOpenChat(true); }}
              />
            }
          />
          <Route
            path="/descubre"
            element={
              <Descubre
                onPlaceDetected={(place) => { setChatContext(place); setOpenChat(true); }}
              />
            }
          />
          <Route path="/detalle/:id" element={<DetalleTour />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/detalle-paquete/:id" element={<DetallePaquete />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminReservas />} />
            <Route path="reservas" element={<AdminReservas />} />
            <Route path="tours" element={<AdminTours />} />
            <Route path="paquetes" element={<AdminPaquetes />} />
            <Route path="clientes" element={<AdminClientes />} />
            <Route path="usuarios" element={<GestiónUsuarios />} />
          </Route>
        </Routes>
      </main>

      <ResumenItinerario />
      <FloatingWhatsAppButton />

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 pt-14 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 pb-10 border-b border-slate-800">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Map size={15} className="text-white" />
                </div>
                <span className="text-white font-bold tracking-tight text-sm">
                  GRUPO TUMPERU<span className="text-indigo-400">.</span>
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{i18n.t("footer_sgev")}</p>
            </div>

            <div className="flex flex-wrap gap-8 md:gap-12">
              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">
                  Explorar
                </p>
                <div className="space-y-2.5">
                  {navLinks.slice(1).map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">
                  Tecnología IA
                </p>
                <div className="space-y-2.5 text-xs text-slate-500">
                  <p>Asistente de Viaje</p>
                  <p>Recomendador Inteligente</p>
                  <p>Reconocimiento Visual</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-slate-600">{i18n.t("footer_derechos")}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <ShieldCheck size={11} className="text-indigo-500" />
              Sistema SGEV — Grupo TUMPERU Travel Assistant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// HOME PAGE
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

  const stats = [
    { icon: Clock,  value: "15+",  label: "Años de experiencia" },
    { icon: MapPin, value: "50+",  label: "Destinos activos"    },
    { icon: Star,   value: "4.9",  label: "Calificación promedio" },
    { icon: Users,  value: "10K+", label: "Viajeros atendidos"  },
  ];

  const aiFeatures = [
    {
      icon: Bot,
      iconClass: "bg-indigo-500/15 border border-indigo-500/25 text-indigo-400",
      title: "Asistente de Viaje",
      desc: "Chat inteligente entrenado con información turística de Cusco. Responde consultas sobre tours, hoteles, gastronomía y cultura local en tiempo real.",
    },
    {
      icon: Brain,
      iconClass: "bg-violet-500/15 border border-violet-500/25 text-violet-400",
      title: "Recomendador Inteligente",
      desc: "Motor de recomendación con IA que analiza tu perfil de viajero para sugerirte los destinos más afines a tus preferencias y restricciones.",
    },
    {
      icon: Camera,
      iconClass: "bg-emerald-500/15 border border-emerald-500/25 text-emerald-400",
      title: "Reconocimiento Visual",
      desc: "Fotografía cualquier atractivo turístico y nuestra IA lo identifica al instante, entregando información detallada y tours relacionados.",
    },
  ];

  const pilares = [
    { icon: Award,      bg: "bg-indigo-50", color: "text-indigo-600", title: t("home_pilar1_titulo"), desc: t("home_pilar1_desc") },
    { icon: Leaf,       bg: "bg-emerald-50", color: "text-emerald-600", title: t("home_pilar2_titulo"), desc: t("home_pilar2_desc") },
    { icon: ShieldCheck, bg: "bg-blue-50", color: "text-blue-600", title: t("home_pilar3_titulo"), desc: t("home_pilar3_desc") },
    { icon: Star,       bg: "bg-amber-50", color: "text-amber-500", title: t("home_pilar4_titulo"), desc: t("home_pilar4_desc") },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transition-transform duration-[10s]"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/35 via-slate-900/55 to-slate-950/90" />

        <div
          className={`relative z-10 text-center max-w-4xl px-4 md:px-6 mx-auto transition-all duration-1000 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="inline-flex items-center gap-2 text-[10px] sm:text-[11px] font-semibold text-slate-300 uppercase tracking-widest mb-6 md:mb-8 bg-white/10 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-white/15">
            <MapPin size={11} className="text-indigo-400" />
            {t("home_badge")}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-5 leading-[1.08] tracking-tight">
            {t("home_hero_titulo")}
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-slate-300/85 mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed font-light">
            {t("home_hero_desc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/tours">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all shadow-2xl shadow-indigo-900/60 flex items-center gap-2 group cursor-pointer w-full sm:w-auto justify-center">
                {t("home_hero_btn")}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <Link to="/planificador">
              <button className="bg-white/10 hover:bg-white/18 backdrop-blur-md text-white border border-white/20 hover:border-white/35 px-8 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center">
                <Sparkles size={15} className="text-indigo-300" />
                {t("nav_planificador")}
              </button>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-35 pointer-events-none">
          <span className="text-[9px] text-white uppercase tracking-[0.2em] font-medium">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white to-transparent" />
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-100">
          {stats.map((s, i) => (
            <div key={i} className="bg-white flex flex-col items-center text-center py-6 md:py-9 px-4 gap-2">
              <s.icon size={17} className="text-indigo-500" />
              <span className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI FEATURES */}
      <section className="bg-slate-950 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full">
              Inteligencia Artificial
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mt-5 mb-3 tracking-tight">
              Tecnología al servicio de tu viaje
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
              Tres módulos de IA diseñados para personalizar cada aspecto de tu experiencia en Cusco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiFeatures.map((f, i) => (
              <div
                key={i}
                className="bg-white/[0.04] hover:bg-white/[0.07] border border-white/8 hover:border-white/15 rounded-2xl p-5 md:p-7 transition-all duration-300 group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${f.iconClass}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="text-white font-bold text-[15px] mb-2.5">{f.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <div>
          <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            {t("home_about_badge")}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-slate-900 mt-4 mb-5 leading-tight">
            {t("home_about_titulo")}
          </h2>
          <div className="space-y-4 text-slate-500 text-sm leading-relaxed">
            <p>{t("home_about_p1")}</p>
            <p>{t("home_about_p2")}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2.5">
                <Compass size={13} className="text-indigo-600" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{t("home_mision_titulo")}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home_mision_desc")}</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-2 mb-2.5">
                <Leaf size={13} className="text-emerald-600" />
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">{t("home_vision_titulo")}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{t("home_vision_desc")}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-6 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden border border-white/5">
          <div className="absolute -right-14 -bottom-14 opacity-[0.035]">
            <Map size={320} />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
            {t("home_acronimo_titulo").split("GRUPO TUMPERU").map((part, i, arr) =>
              i < arr.length - 1
                ? <span key={i}>{part}<span className="text-white font-bold">GRUPO TUMPERU</span></span>
                : <span key={i}>{part}</span>
            )}
          </p>
          <div className="space-y-3">
            {acronimo.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="bg-white/8 border border-white/10 text-indigo-300 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                  {item.letra}
                </span>
                <p className="text-sm text-slate-300 font-light">{item.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-slate-50 border-y border-slate-100 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-8 md:mb-14">
            <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              {t("home_pilares_badge")}
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-4">
              {t("home_pilares_titulo")}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pilares.map((p, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4"
              >
                <div className={`w-10 h-10 rounded-xl ${p.bg} ${p.color} flex items-center justify-center`}>
                  <p.icon size={19} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1.5">{p.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 md:p-16 text-center overflow-hidden shadow-2xl shadow-indigo-900/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.1)_0%,_transparent_65%)]" />
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={24} className="text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
                Empieza a planificar tu viaje
              </h2>
              <p className="text-indigo-200/80 mb-8 text-sm max-w-md mx-auto leading-relaxed">
                Usa nuestro recomendador con IA y descubre los destinos perfectos según tu perfil de viajero.
              </p>
              <Link to="/planificador" className="flex justify-center">
                <button className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 md:px-10 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center gap-2.5 cursor-pointer w-full sm:w-auto justify-center">
                  <Brain size={16} />
                  Ir al Planificador IA
                  <ArrowRight size={15} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
