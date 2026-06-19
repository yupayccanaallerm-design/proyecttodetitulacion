import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  FolderHeart, 
  MapPin, 
  Layers, 
  LogOut, 
  Map,
  Menu,
  X,
  Bell,
  Sparkles,
  Users
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperamos los datos reales del usuario logueado en tiempo de ejecución
  const nombreUsuario = localStorage.getItem('admin_name') || 'Usuario Activo';
  const rolUsuario = localStorage.getItem('user_role') || 'Operador SGEV';

  // Extraemos las iniciales dinámicamente para el Avatar
  const iniciales = nombreUsuario
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Estructura de navegación del SGEV corregida (Icono de Usuarios correcto)
  const menuItems = [
    { 
      icon: <FolderHeart size={18} />, 
      label: "Bandeja de Planes IA", 
      path: "reservas" 
    },
    { 
      icon: <MapPin size={18} />, 
      label: "Registrar Atractivos / IA", 
      path: "tours" 
    },
    { 
      icon: <Layers size={18} />, 
      label: "Diseñar Paquetes", 
      path: "paquetes" 
    },
    { 
      icon: <Users size={18} />, 
      label: "Gestión de Usuarios", 
      path: "usuarios" 
    },
  ];

  const handleLogout = () => {
    if (window.confirm("¿Seguro que deseas cerrar la sesión operativa actual?")) {
      localStorage.clear();
      navigate("/login");    
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans antialiased text-slate-800 flex">
      
      {/* 1. SIDEBAR NAVEGACIÓN */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 text-slate-400 p-5 flex flex-col justify-between transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 transition-transform duration-300 ease-in-out border-r border-slate-900 shadow-xl`}>
        <div className="space-y-8">
          {/* Logo Corporativo */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-900 pb-5">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-600/20">
              <Map size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white uppercase">
                TUMPERU <span className="text-indigo-500">SGEV</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Panel Operativo</span>
            </div>
          </div>

          {/* Enlaces a los submódulos de la Tesis */}
          <nav className="space-y-1">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname.endsWith(item.path);

              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 font-semibold translate-x-1"
                      : "hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <span className={isActive ? "text-white" : "text-slate-500"}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Botón de Salida */}
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 text-xs font-medium tracking-wide rounded-xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200 w-full cursor-pointer mt-auto border-t border-slate-900 pt-5"
        >
          <LogOut size={18} />
          Cerrar Sesión Operativa
        </button>
      </aside>

      {/* Sombra de fondo para móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. CUERPO DE TRABAJO PRINCIPAL */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* BARRA SUPERIOR GLOBAL CORREGIDA Y MEJORADA */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-30">
          
          {/* LADO IZQUIERDO: Control móvil e Información Operativa */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-slate-600 p-2 hover:bg-slate-100 rounded-xl md:hidden transition-colors cursor-pointer"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Pequeños Badges de estado en tiempo real para la Tesis */}
            <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                <Sparkles size={12} className="text-indigo-500" />
                Motor IA Activo
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60">
                Sede Central Cusco
              </span>
            </div>
          </div>

          {/* LADO DERECHO: Notificaciones y Perfil Organizado */}
          <div className="flex items-center gap-3.5">
            {/* Icono Notificaciones */}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl relative transition-colors cursor-pointer">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>
            
            <div className="h-7 w-px bg-slate-200" />
            
            {/* Contenedor del Perfil Dinámico */}
            <div className="flex items-center gap-2.5">
              {/* Avatar con Gradiente */}
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-md shadow-indigo-500/20">
                {iniciales}
              </div>
              
              {/* Textos Informativos */}
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[120px]">
                  {nombreUsuario}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 capitalize">
                  {rolUsuario === 'admin' ? 'Administrador' : rolUsuario}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* 3. AQUÍ SE RENDERIZAN LOS COMPONENTES INTERNOS INDEPENDIENTES */}
        <main className="flex-grow p-4 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* El Outlet inyecta dinámicamente tu bandeja de reservas, tus tours, etc. */}
          <Outlet /> 
        </main>
      </div>

    </div>
  );
}