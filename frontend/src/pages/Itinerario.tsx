import { useLocation } from "react-router-dom";
import { Users, Wallet, Clock, ShieldCheck, Check } from "lucide-react";

export default function Itinerario() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const tour = params.get("tour");
  const price = Number(params.get("price") || 0);
  const personas = 4;
  const total = price * personas;

  const itin = [
    {
      dia: "D\u00eda 1",
      actividades: [
        "Recojo del hotel en Cusco",
        "Transporte tur\u00edstico privado",
        "Visita guiada al destino principal",
        "Almuerzo incluido en restaurante local",
        "Tiempo libre para explorar"
      ]
    },
    {
      dia: "D\u00eda 2",
      actividades: [
        "Desayuno buffet en el hotel",
        "Tour complementario por la ma\u00f1ana",
        "Almuerzo campestre",
        "Retorno a Cusco por la tarde",
        "Traslado al hotel"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 selection:bg-indigo-100">
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <section className="text-center mb-12">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Itinerario Personalizado
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-4 mb-3">
            {tour || "Paquete Tur\u00edstico"}
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            Experiencia dise\u00f1ada por <span className="font-semibold text-indigo-600">GRUPO TUMPERU</span> &mdash; cada detalle pensado para ti
          </p>
        </section>

        {/* Timeline del itinerario */}
        <div className="space-y-6">
          {itin.map((item, idx) => (
            <div key={idx} className="bg-white p-6 md:p-8 rounded-[35px] shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                  {idx + 1}
                </div>
                <h2 className="text-lg font-black text-slate-800">{item.dia}</h2>
              </div>
              <ul className="space-y-3">
                {item.actividades.map((act, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-indigo-600" />
                    </span>
                    <span className="text-sm text-slate-600">{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Detalles adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duraci\u00f3n</p>
              <p className="text-sm font-bold text-slate-800">2 D\u00edas / 1 Noche</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Viajeros</p>
              <p className="text-sm font-bold text-slate-800">{personas} personas</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <ShieldCheck size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seguridad</p>
              <p className="text-sm font-bold text-slate-800">Certificado SGEV</p>
            </div>
          </div>
        </div>

        {/* Resumen de precio */}
        <div className="mt-8 bg-gradient-to-br from-indigo-50 to-white p-8 rounded-[35px] border border-indigo-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Wallet size={18} className="text-indigo-600" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Resumen de Reserva</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Precio por persona</span>
              <span className="font-bold text-slate-800">$ {price} USD</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">N\u00famero de viajeros</span>
              <span className="font-bold text-slate-800">{personas}</span>
            </div>
            <div className="border-t border-indigo-200 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-slate-800 uppercase">Total</span>
                <span className="text-2xl font-black text-indigo-600">$ {total} USD</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
