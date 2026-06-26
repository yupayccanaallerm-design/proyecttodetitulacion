import { useState, useEffect } from "react";
import { Plus, Sparkles, Check, Clock, Layers, DollarSign, MapPin, Pencil, Trash2, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../api";

interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
}

interface Paquete {
  id: number;
  nombre: string;
  duracion_dias: number;
  precio_sugerido: number;
  perfil_usuario: string;
  estado: number;
  imagen_base64?: string;
}

export default function AdminPaquetes() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"crear" | "gestionar">("crear");
  const [editando, setEditando] = useState<Paquete | null>(null);

  const [guardado, setGuardado] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [perfil, setPerfil] = useState("Aventurero");
  const [duracion, setDuracion] = useState("1");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [toursDisponibles, setToursDisponibles] = useState<Tour[]>([]);
  const [toursSeleccionados, setToursSeleccionados] = useState<number[]>([]);

  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/tours`)
      .then((r) => r.json())
      .then(setToursDisponibles)
      .catch(() => setToursDisponibles([]));
  }, []);

  const cargarPaquetes = async () => {
    setCargandoLista(true);
    try {
      const res = await fetch(`${API_BASE}/api/paquetes`);
      if (res.ok) setPaquetes(await res.json());
    } catch (e) { console.error(e); }
    finally { setCargandoLista(false); }
  };

  useEffect(() => {
    if (tab === "gestionar") cargarPaquetes();
  }, [tab]);

  const resetFormulario = () => {
    setTitulo(""); setPerfil("Aventurero"); setDuracion("1");
    setPrecio(""); setDescripcion(""); setToursSeleccionados([]);
    setEditando(null);
  };

  const iniciarEdicion = async (paquete: Paquete) => {
    setEditando(paquete);
    setTitulo(paquete.nombre);
    setPerfil(paquete.perfil_usuario);
    setDuracion(String(paquete.duracion_dias));
    setPrecio(String(paquete.precio_sugerido));
    // Cargar tours del paquete
    try {
      const res = await fetch(`${API_BASE}/api/paquetes/${paquete.id}`);
      if (res.ok) {
        const data = await res.json();
        setDescripcion(data.descripcion_base || "");
        setToursSeleccionados((data.tours || []).map((t: any) => t.id));
      }
    } catch { /**/ }
    setTab("crear");
  };

  const eliminarPaquete = async (id: number) => {
    if (!window.confirm(t("admin_paquetes_confirmar_eliminar") || "¿Desactivar este paquete?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/paquetes/${id}`, { method: "DELETE" });
      if (res.ok) cargarPaquetes();
      else alert(t("error_generico"));
    } catch { alert(t("admin_paquetes_error_servidor")); }
  };

  const manejarSeleccionTour = (id: number) => {
    setToursSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || toursSeleccionados.length === 0) {
      alert(t("admin_paquetes_validacion"));
      return;
    }
    const payload = {
      nombre: titulo,
      descripcion_base: descripcion,
      duracion_dias: parseInt(duracion),
      perfil_usuario: perfil,
      precio_sugerido: parseFloat(precio) || 0,
      tours: toursSeleccionados,
    };
    try {
      const url = editando ? `${API_BASE}/api/paquetes/${editando.id}` : `${API_BASE}/api/paquetes`;
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setGuardado(true);
        setTimeout(() => { setGuardado(false); resetFormulario(); }, 2500);
      } else {
        const err = await res.json();
        alert(`${t("error_generico")}: ${err.detail || ""}`);
      }
    } catch { alert(t("admin_paquetes_error_servidor")); }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto mb-10">
      {/* Encabezado */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{t("admin_paquetes_titulo")}</h1>
        <p className="text-xs text-slate-400 font-light mt-0.5">{t("admin_paquetes_desc")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button onClick={() => { resetFormulario(); setTab("crear"); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === "crear" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
          {editando ? "Editar Paquete" : `+ ${t("admin_paquetes_titulo")}`}
        </button>
        <button onClick={() => setTab("gestionar")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === "gestionar" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}>
          Gestionar Paquetes
        </button>
      </div>

      {/* Tab Crear/Editar */}
      {tab === "crear" && (
        <form onSubmit={manejarGuardar} className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-xs space-y-5">
          {editando && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-xs text-indigo-700 font-semibold flex items-center justify-between">
              <span>Editando: <strong>{editando.nombre}</strong></span>
              <button type="button" onClick={resetFormulario} className="text-indigo-400 hover:text-red-500"><X size={14} /></button>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{t("admin_paquetes_nombre_label")}</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={t("admin_paquetes_nombre_ph")} required
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all" />
          </div>

          {/* Perfil + Duración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{t("admin_paquetes_perfil_label")}</label>
              <select value={perfil} onChange={(e) => setPerfil(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all">
                {["Aventurero", "Familias", "Cultural", "Romántico", "Senior"].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1"><Clock size={10} />{t("admin_paquetes_duracion_label")}</label>
              <input type="number" min="1" max="30" value={duracion} onChange={(e) => setDuracion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all" />
            </div>
          </div>

          {/* Precio */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1"><DollarSign size={10} />{t("admin_paquetes_precio_label")}</label>
            <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all" />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{t("admin_paquetes_desc_label")}</label>
            <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3}
              placeholder={t("admin_paquetes_desc_ph")}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all resize-none" />
          </div>

          {/* Selección de tours */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">{t("admin_paquetes_tours_label")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {toursDisponibles.map((tour) => {
                const sel = toursSeleccionados.includes(tour.id);
                return (
                  <button key={tour.id} type="button" onClick={() => manejarSeleccionTour(tour.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left ${sel ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"}`}>
                    <MapPin size={12} className={sel ? "text-indigo-200" : "text-slate-400"} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-semibold">{tour.nombre}</p>
                      <p className={`text-[9px] truncate ${sel ? "text-indigo-200" : "text-slate-400"}`}>{tour.zona_geografica}</p>
                    </div>
                    {sel && <Check size={12} className="text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit"
            className={`w-full text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${guardado ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            {guardado ? <><Check size={14} /> {t("admin_paquetes_guardado")}</> : <><Plus size={14} /> {editando ? "Guardar Cambios" : t("admin_paquetes_btn")}</>}
          </button>
        </form>
      )}

      {/* Tab Gestionar */}
      {tab === "gestionar" && (
        <div className="bg-white border border-slate-200/60 rounded-xl shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Paquetes registrados</h2>
            <button onClick={cargarPaquetes} className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"><RefreshCw size={12} /> Actualizar</button>
          </div>
          {cargandoLista ? (
            <div className="p-8 text-center text-xs text-slate-400"><RefreshCw className="animate-spin mx-auto mb-2" size={20} /> Cargando...</div>
          ) : paquetes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No hay paquetes registrados.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {paquetes.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {p.imagen_base64 ? (
                    <img src={p.imagen_base64} alt={p.nombre} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><Layers size={16} className="text-slate-400" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                    <p className="text-xs text-slate-400">{p.perfil_usuario} · {p.duracion_dias} días · ${p.precio_sugerido}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${p.estado ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {p.estado ? "Activo" : "Inactivo"}
                    </span>
                    <button onClick={() => iniciarEdicion(p)} title="Editar"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => eliminarPaquete(p.id)} title="Desactivar"
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
