import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Globe,
  CreditCard,
  Activity,
  ShieldCheck,
  ChevronLeft,
  CheckCircle2,
  Home
} from "lucide-react";

export default function Reservas() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const query = new URLSearchParams(useLocation().search);
  const tourName = query.get("tour") || t("tour_default");
  const precioBase = Number(query.get("price")) || 100;

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    nacionalidad: "",
    pasaporte: "",
    fechaTour: "",
    personas: 1,
    condicionSalud: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [bookingCode, setBookingCode] = useState("");

  const total = precioBase * form.personas;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingCode(`TUM-${Date.now().toString(36).toUpperCase()}`);
    setSubmitted(true);
  };

  // Clases compartidas para los inputs (Estilo Premium Clean)
  const inputStyle =
    "w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 p-3 pl-11 rounded-xl text-slate-800 font-normal transition-all outline-none text-sm";

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-100 shadow-sm p-8 md:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-500" size={36} />
          </div>
          <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Reserva confirmada
          </span>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight text-slate-900 mt-4 mb-2">
            {t("reserva_exitosa")}
          </h1>
          <p className="text-sm text-slate-400 font-light mb-8">
            Te enviaremos los detalles a <span className="font-medium text-slate-600">{form.email}</span>. Guarda tu código de reserva.
          </p>

          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-5 mb-8">
            <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1">Código de reserva</p>
            <p className="text-2xl font-bold tracking-widest text-indigo-600">{bookingCode}</p>
          </div>

          <div className="space-y-2.5 text-sm text-left bg-slate-50 rounded-2xl p-5 mb-8">
            <div className="flex justify-between text-slate-500">
              <span className="font-light">{t("tour")}</span>
              <span className="font-medium text-slate-800">{tourName}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span className="font-light">{t("personas")}</span>
              <span className="font-medium text-slate-800">{form.personas}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span className="font-light">Fecha</span>
              <span className="font-medium text-slate-800">{form.fechaTour || "—"}</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-2.5 border-t border-slate-200">
              <span className="font-light">{t("total")}</span>
              <span className="font-semibold text-indigo-600">${total} USD</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/tours")}
              className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-medium text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Ver más tours
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home size={16} /> Ir al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-800 pb-20 p-4 md:p-6">

      {/* BOTÓN VOLVER SUTIL */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium text-sm transition group cursor-pointer"
        >
          <ChevronLeft size={18} className="transform group-hover:-translate-x-0.5 transition-transform" /> 
          {t("volver")}
        </button>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <div className="mb-10">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Checkout Seguro
          </span>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-slate-900 mt-3">
            {t("finalizar_reserva")}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* FORMULARIO PRINCIPAL */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

            {/* SECCIÓN: DATOS PERSONALES */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-6 pb-2 border-b border-slate-100">
                1. {t("datos_personales")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("nombre")}</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input name="nombre" type="text" placeholder="Ej. Juan Pérez" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input name="email" type="email" placeholder="juan@ejemplo.com" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("telefono")}</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input name="telefono" type="tel" placeholder="+51 987 654 321" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                {/* Nacionalidad */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("nacionalidad")}</label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input name="nacionalidad" type="text" placeholder="Peruana" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                {/* Pasaporte o Documento */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{t("pasaporte")}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input name="pasaporte" type="text" placeholder="Número de Pasaporte o DNI" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN: DETALLES LOGÍSTICOS Y SALUD */}
            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-6 pb-2 border-b border-slate-100">
                2. {t("datos_viaje")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Fecha */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Fecha del viaje</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input type="date" name="fechaTour" onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>

                {/* Nro Personas */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Número de viajeros</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input type="number" name="personas" min="1" value={form.personas} onChange={handleChange} className={inputStyle} required />
                  </div>
                </div>
              </div>

              {/* Condición de Salud (Clave para operaciones de turismo de aventura) */}
              <div className="flex flex-col gap-1.5 mt-5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Condiciones médicas relevantes o alergias</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <textarea
                    name="condicionSalud"
                    placeholder={t("salud") + " (Ej. Asma, problemas cardíacos, intolerancias alimentarias o ninguna)"}
                    onChange={handleChange}
                    className={`${inputStyle} min-h-[100px] pt-3 resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* BOTÓN DE CONFIRMACIÓN PRINCIPAL */}
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-medium text-sm tracking-wide hover:bg-indigo-700 active:scale-98 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm shadow-indigo-100 hover:shadow-md cursor-pointer">
              {t("confirmar")} <ShieldCheck size={18} />
            </button>

          </form>

          {/* TARJETA LATERAL: RESUMEN DE LA RESERVA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-6">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
              {t("resumen")}
            </h2>

            <div className="space-y-5">
              {/* Nombre de la Experiencia */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{t("tour")}</p>
                <p className="font-medium text-slate-800 text-sm mt-0.5">{tourName}</p>
              </div>

              {/* Desglose de Precios */}
              <div className="space-y-2.5 text-sm px-1">
                <div className="flex justify-between text-slate-500">
                  <span className="font-light">{t("personas")}</span>
                  <span className="font-medium text-slate-800">{form.personas}</span>
                </div>

                <div className="flex justify-between text-slate-500">
                  <span className="font-light">{t("precio")} por persona</span>
                  <span className="font-medium text-slate-800">${precioBase}</span>
                </div>
              </div>

              {/* Total Destacado */}
              <div className="border-t border-slate-100 pt-4 mt-2 px-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">{t("total")}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-semibold tracking-tight text-indigo-600">${total}</span>
                  <span className="text-xs text-slate-400 font-light">USD</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}