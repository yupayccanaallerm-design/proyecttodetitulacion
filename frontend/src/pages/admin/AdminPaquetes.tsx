import { useState, useEffect } from "react";
import { Plus, Sparkles, Check, Clock, Layers, DollarSign, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
}

export default function AdminPaquetes() {
  const { t } = useTranslation();
  const [guardado, setGuardado] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [perfil, setPerfil] = useState("Aventurero");
  const [duracion, setDuracion] = useState("1");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [toursDisponibles, setToursDisponibles] = useState<Tour[]>([]);
  const [toursSeleccionados, setToursSeleccionados] = useState<number[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/tours")
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        return res.json();
      })
      .then((data) => setToursDisponibles(data))
      .catch((err) => {
        console.error("Error loading tours:", err);
        setToursDisponibles([
          { id: 1, nombre: "Machu Picchu Tradicional", zona_geografica: "Machu Picchu" },
          { id: 2, nombre: "Valle Sagrado de los Incas", zona_geografica: "Valle Sagrado" },
          { id: 3, nombre: "Montaña de 7 Colores", zona_geografica: "Cusco Sur" },
          { id: 4, nombre: "City Tour Arqueológico", zona_geografica: "Cusco Centro" },
        ]);
      });
  }, []);

  const manejarSeleccionTour = (id: number) => {
    if (toursSeleccionados.includes(id)) {
      setToursSeleccionados(toursSeleccionados.filter((tourId) => tourId !== id));
    } else {
      setToursSeleccionados([...toursSeleccionados, id]);
    }
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || toursSeleccionados.length === 0) {
      alert(t("admin_paquetes_validacion"));
      return;
    }

    const nuevoPaquete = {
      nombre: titulo,
      descripcion_base: descripcion,
      duracion_dias: parseInt(duracion),
      perfil_usuario: perfil,
      precio_sugerido: parseFloat(precio) || 0.00,
      tours: toursSeleccionados,
    };

    try {
      const res = await fetch("http://localhost:8000/api/paquetes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevoPaquete),
      });

      if (res.ok) {
        setGuardado(true);
        setTimeout(() => {
          setGuardado(false);
          setTitulo("");
          setPrecio("");
          setDescripcion("");
          setToursSeleccionados([]);
        }, 2500);
      } else {
        const errorData = await res.json();
        alert(`${t("error_generico")}: ${errorData.detail || ""}`);
      }
    } catch (error) {
      console.error("Error de red al intentar conectar con FastAPI:", error);
      alert(t("admin_paquetes_error_servidor"));
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-10">
      {/* CABECERA */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{t("admin_paquetes_titulo")}</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">{t("admin_paquetes_desc")}</p>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={manejarGuardar} className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs space-y-5">

        {/* Título */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("admin_paquetes_nombre_label")}</label>
          <input
            type="text"
            placeholder={t("admin_paquetes_nombre_ph")}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Perfil */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("admin_paquetes_perfil_label")}</label>
            <select
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
            >
              <option value="Aventurero">{t("admin_paquetes_perfil_aventurero")}</option>
              <option value="Cultural">{t("admin_paquetes_perfil_cultural")}</option>
              <option value="Gastronomico">{t("admin_paquetes_perfil_gastro")}</option>
              <option value="Relajacion">{t("admin_paquetes_perfil_premium")}</option>
            </select>
          </div>

          {/* Duración */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("admin_paquetes_duracion_label")}</label>
            <div className="relative">
              <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={duracion}
                onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 pl-10 rounded-xl text-xs font-medium text-slate-600 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
              >
                <option value="1">{t("admin_paquetes_duracion_1")}</option>
                <option value="2">{t("admin_paquetes_duracion_2")}</option>
                <option value="3">{t("admin_paquetes_duracion_3")}</option>
                <option value="4">{t("admin_paquetes_duracion_4")}</option>
              </select>
            </div>
          </div>

          {/* Precio */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("admin_paquetes_precio_label")}</label>
            <div className="relative">
              <DollarSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 pl-10 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700"
                required
              />
            </div>
          </div>
        </div>

        {/* Tours */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide block">
            {t("admin_paquetes_tours_label")} ({t("admin_paquetes_tours_sel", { count: toursSeleccionados.length })})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/50">
            {toursDisponibles.map((tour) => (
              <div
                key={tour.id}
                onClick={() => manejarSeleccionTour(tour.id)}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  toursSeleccionados.includes(tour.id)
                    ? "bg-indigo-50/70 border-indigo-200"
                    : "bg-white border-slate-200/60 hover:bg-slate-50"
                }`}
              >
                <div className="space-y-0.5">
                  <p className="text-xs font-medium text-slate-700">{tour.nombre}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <MapPin size={10} />
                    <span>{tour.zona_geografica}</span>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  toursSeleccionados.includes(tour.id)
                    ? "bg-indigo-600 border-indigo-600 text-white"
                    : "border-slate-300 bg-white"
                }`}>
                  {toursSeleccionados.includes(tour.id) && <Check size={10} strokeWidth={3} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itinerario */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t("admin_paquetes_itin_label")}</label>
          <textarea
            rows={3}
            placeholder={t("admin_paquetes_itin_ph")}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-light outline-none focus:border-indigo-500 focus:bg-white transition-all text-slate-700 resize-none"
            required
          />
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          className={`w-full text-xs font-medium py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
            guardado
              ? "bg-emerald-600 text-white shadow-emerald-600/10"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10"
          }`}
        >
          {guardado ? (
            <><Check size={14} /> {t("admin_paquetes_btn_guardado")}</>
          ) : (
            <><Layers size={14} /> {t("admin_paquetes_btn")}</>
          )}
        </button>

      </form>
    </div>
  );
}
