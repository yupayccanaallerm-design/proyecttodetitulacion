import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  CalendarDays, 
  User, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Users,
  Clock,
  DollarSign,
  Package,
  AlertCircle,
  Loader2,
  Send,
  MessageSquare,
  MapPin,
  Building2
} from "lucide-react";

export default function Reservas() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Capturar datos de la URL
  const paqueteNombre = searchParams.get("package") || "Paquete Seleccionado";
  const paquetePrecio = parseFloat(searchParams.get("price") || "0");
  const paqueteId = searchParams.get("id") || "";
  const duracion = searchParams.get("duracion") || "2 días";
  const tipo = searchParams.get("tipo") || "Cultural";

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [fecha, setFecha] = useState("");
  const [pasajeros, setPasajeros] = useState(1);
  const [comentarios, setComentarios] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [error, setError] = useState("");
  const [fechaMinima, setFechaMinima] = useState("");

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setFechaMinima(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    // Validaciones
    if (!nombre.trim()) {
      setError("Por favor ingresa tu nombre completo");
      setEnviando(false);
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError("Por favor ingresa un correo electrónico válido");
      setEnviando(false);
      return;
    }
    if (!telefono.trim() || telefono.length < 7) {
      setError("Por favor ingresa un número de teléfono válido");
      setEnviando(false);
      return;
    }
    if (!fecha) {
      setError("Por favor selecciona una fecha de viaje");
      setEnviando(false);
      return;
    }

    // Datos a enviar - SOLO información del cliente y su interés
    const datosCliente = {
      paquete_id: paqueteId,
      paquete_nombre: paqueteNombre,
      precio_referencial: paquetePrecio,
      nombre_cliente: nombre,
      email_cliente: email,
      telefono_cliente: telefono,
      fecha_viaje: fecha,
      numero_pasajeros: pasajeros,
      comentarios: comentarios,
      tipo: tipo,
      duracion: duracion,
      fecha_solicitud: new Date().toISOString()
    };

    try {
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosCliente)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al enviar la solicitud");
      }

      setExito(true);
      
    } catch (err: any) {
      setError(err.message || "Error al enviar la solicitud. Intenta nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  // Pantalla de éxito
  if (exito) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-2xl text-center animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-emerald-500" size={40} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 mb-2">✅ ¡Solicitud Enviada!</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Hemos recibido tu interés en <span className="font-semibold text-indigo-600">{paqueteNombre}</span>
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Los proveedores se pondrán en contacto contigo en las próximas 24 horas.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Resumen de tu solicitud</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Contacto</span>
                <p className="font-bold text-slate-800 truncate">{nombre}</p>
              </div>
              <div>
                <span className="text-slate-400">Email</span>
                <p className="font-bold text-slate-800 truncate text-[10px]">{email}</p>
              </div>
              <div>
                <span className="text-slate-400">Fecha</span>
                <p className="font-bold text-slate-800">{new Date(fecha).toLocaleDateString('es-ES')}</p>
              </div>
              <div>
                <span className="text-slate-400">Pasajeros</span>
                <p className="font-bold text-slate-800">{pasajeros}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
            >
              Ir al Inicio
            </button>
            <button
              onClick={() => navigate("/tours")}
              className="flex-1 py-3 bg-white border-2 border-slate-200 hover:border-indigo-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Ver más Tours
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 font-sans text-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/tours" className="hover:text-indigo-600 transition-colors">Tours</Link>
            <span>/</span>
            <span className="text-slate-600 font-medium truncate">{paqueteNombre}</span>
          </nav>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-3">
              <Building2 size={28} className="text-indigo-600" />
              Solicitar Información
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Completa tus datos y los proveedores se pondrán en contacto contigo.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <User size={20} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Tus Datos</h2>
                  <p className="text-xs text-slate-400">Los proveedores usarán esta información para contactarte</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Nombre Completo <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Correo Electrónico <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Teléfono / WhatsApp <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="tel"
                        required
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        placeholder="+51 987 654 321"
                        className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Fecha de Viaje <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="date"
                        required
                        value={fecha}
                        min={fechaMinima}
                        onChange={(e) => setFecha(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Número de Viajeros <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <select
                        value={pasajeros}
                        onChange={(e) => setPasajeros(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700 appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <option key={num} value={num}>
                            {num} {num === 1 ? "Pasajero" : "Pasajeros"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Comentarios adicionales
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <textarea
                      value={comentarios}
                      onChange={(e) => setComentarios(e.target.value)}
                      placeholder="Requerimientos especiales, alergias, preferencias, etc."
                      className="w-full bg-slate-50 border border-slate-200 py-3 pl-10 pr-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-sm text-slate-700 resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar Solicitud
                    </>
                  )}
                </button>

                <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    <span className="font-bold text-slate-700">Sin compromiso de compra.</span>
                    <br />
                    Solo enviamos tu información a los proveedores para que te contacten.
                    <br />
                    <span className="text-indigo-500 font-medium">El pago y seguimiento se realizan directamente con ellos.</span>
                  </p>
                </div>

                <p className="text-[9px] text-slate-400 text-center">
                  Al enviar, aceptas que tus datos sean compartidos con los proveedores del tour.
                </p>
              </form>
            </div>
          </div>

          {/* RESUMEN DEL PAQUETE - LADO DERECHO */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 border border-slate-700 shadow-xl sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Package size={16} className="text-indigo-400" />
                </div>
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">Tu Selección</span>
              </div>
              
              <h3 className="text-lg font-bold text-white leading-tight mb-1 line-clamp-2">{paqueteNombre}</h3>
              <p className="text-xs text-slate-400">{tipo} • {duracion}</p>

              <div className="space-y-2 text-xs border-t border-slate-700/50 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio referencial</span>
                  <span className="font-medium text-white">${paquetePrecio.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pasajeros</span>
                  <span className="font-medium text-white">x {pasajeros}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700/50 pt-2 mt-2">
                  <span className="text-slate-400">Total referencial</span>
                  <span className="text-lg font-bold text-indigo-400">
                    ${(paquetePrecio * pasajeros).toFixed(2)} USD
                  </span>
                </div>
                <p className="text-[8px] text-slate-500 text-center mt-1">* El precio final lo confirma el proveedor</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <div className="p-0.5 bg-emerald-500/20 rounded">
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  </div>
                  <span>Sin pago anticipado en la web</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <div className="p-0.5 bg-blue-500/20 rounded">
                    <Clock size={12} className="text-blue-400" />
                  </div>
                  <span>Contacto en 24h por parte del proveedor</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-300">
                  <div className="p-0.5 bg-purple-500/20 rounded">
                    <ShieldCheck size={12} className="text-purple-400" />
                  </div>
                  <span>Gestión directa con el proveedor</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}