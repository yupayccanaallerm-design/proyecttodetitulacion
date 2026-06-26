import { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, MapPin, Sparkles, Check, X, RefreshCw, Layers, FileText, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../../api";

interface Tour {
  id: number;
  nombre: string;
  zona_geografica: string;
  descripcion: string;
  estado: number;
  imagen_url?: string;
}

export default function AdminTours() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"crear" | "gestionar">("crear");

  // Estado formulario crear/editar
  const [editando, setEditando] = useState<Tour | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState("Cusco Ciudad");
  const [descripcion, setDescripcion] = useState("");
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [itinerario, setItinerario] = useState([{ titulo: "", descripcion: "" }]);
  const [inclusiones, setInclusiones] = useState([{ item: "" }]);

  // Estado lista
  const [tours, setTours] = useState<Tour[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!archivoImagen) { setVistaPrevia(null); return; }
    const url = URL.createObjectURL(archivoImagen);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivoImagen]);

  const cargarTours = async () => {
    setCargandoLista(true);
    try {
      const res = await fetch(`${API_BASE}/api/tours/admin/todos`);
      if (res.ok) setTours(await res.json());
    } catch (e) { console.error(e); }
    finally { setCargandoLista(false); }
  };

  useEffect(() => {
    if (tab === "gestionar") cargarTours();
  }, [tab]);

  const resetFormulario = () => {
    setNombre(""); setZona("Cusco Ciudad"); setDescripcion("");
    setArchivoImagen(null); setVistaPrevia(null);
    setItinerario([{ titulo: "", descripcion: "" }]);
    setInclusiones([{ item: "" }]);
    setEditando(null);
  };

  const iniciarEdicion = (tour: Tour) => {
    setEditando(tour);
    setNombre(tour.nombre);
    setZona(tour.zona_geografica);
    setDescripcion(tour.descripcion);
    setArchivoImagen(null);
    setVistaPrevia(tour.imagen_url || null);
    setTab("crear");
  };

  const eliminarTour = async (id: number) => {
    if (!window.confirm(t("admin_tours_confirmar_eliminar"))) return;
    try {
      const res = await fetch(`${API_BASE}/api/tours/${id}`, { method: "DELETE" });
      if (res.ok) cargarTours();
      else alert(t("error_generico"));
    } catch (e) { alert(t("admin_tours_error_conexion")); }
  };

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setArchivoImagen(e.target.files[0]);
  };

  const removerImagen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivoImagen(null);
    setVistaPrevia(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !descripcion.trim() || (!editando && !archivoImagen)) {
      alert(t("admin_tours_validacion"));
      return;
    }
    setCargando(true);
    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("zona_geografica", zona);
    formData.append("descripcion", descripcion.trim());
    formData.append("estado", "1");
    formData.append("itinerario", JSON.stringify(itinerario));
    formData.append("inclusiones", JSON.stringify(inclusiones));
    if (archivoImagen) formData.append("imagen", archivoImagen);

    try {
      const url = editando
        ? `${API_BASE}/api/tours/${editando.id}`
        : `${API_BASE}/api/tours`;
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, { method, body: formData });
      if (res.ok) {
        setGuardado(true);
        setTimeout(() => { setGuardado(false); resetFormulario(); }, 2500);
      } else {
        const err = await res.json();
        alert(`Error ${res.status}: ${JSON.stringify(err.detail) || t("error_generico")}`);
      }
    } catch {
      alert(t("admin_tours_error_conexion"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto mb-16">
      {/* Encabezado */}
      <div className="relative p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl text-indigo-400"><Layers size={22} /></div>
          <div>
            <h1 className="text-lg font-bold text-white">{t("admin_tours_titulo")}</h1>
            <p className="text-xs text-slate-300 mt-0.5">{t("admin_tours_desc")}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => { resetFormulario(); setTab("crear"); }}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === "crear" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
        >
          {editando ? `${t("admin_tours_btn_editar") || "Editar Tour"}` : `+ ${t("admin_tours_btn")}`}
        </button>
        <button
          onClick={() => setTab("gestionar")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${tab === "gestionar" ? "bg-white shadow text-indigo-700" : "text-slate-500 hover:text-slate-700"}`}
        >
          {t("admin_tours_gestionar") || "Gestionar Tours"}
        </button>
      </div>

      {/* Tab Crear/Editar */}
      {tab === "crear" && (
        <form onSubmit={manejarGuardar} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-xl space-y-6">
          {editando && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2 text-xs text-indigo-700 font-semibold flex items-center justify-between">
              <span>Editando: <strong>{editando.nombre}</strong></span>
              <button type="button" onClick={resetFormulario} className="text-indigo-400 hover:text-red-500"><X size={14} /></button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t("admin_tours_nombre_label")}</label>
              <input type="text" placeholder={t("admin_tours_nombre_ph")} value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all" required disabled={cargando || guardado} />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><MapPin size={12} />{t("admin_tours_zona_label")}</label>
              <select value={zona} onChange={(e) => setZona(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all" disabled={cargando || guardado}>
                <option value="Cusco Ciudad">{t("admin_tours_zona_cusco")}</option>
                <option value="Valle Sagrado">{t("admin_tours_zona_valle")}</option>
                <option value="Machu Picchu">{t("admin_tours_zona_machu")}</option>
                <option value="Rutas Sur">{t("admin_tours_zona_sur")}</option>
              </select>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5"><FileText size={12} />{t("admin_tours_desc_label")}</label>
              <textarea placeholder={t("admin_tours_desc_ph")} value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                rows={3} className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all resize-none" required disabled={cargando || guardado} />
            </div>
          </div>

          {/* Itinerario */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase">{t("admin_tours_itinerario_label")}</label>
            {itinerario.map((row, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder={t("admin_tours_actividad_ph")} value={row.titulo}
                  className="w-1/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
                  onChange={(e) => { const n = [...itinerario]; n[i].titulo = e.target.value; setItinerario(n); }} />
                <input placeholder={t("admin_tours_desc2_ph")} value={row.descripcion}
                  className="w-2/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
                  onChange={(e) => { const n = [...itinerario]; n[i].descripcion = e.target.value; setItinerario(n); }} />
              </div>
            ))}
            <button type="button" onClick={() => setItinerario([...itinerario, { titulo: "", descripcion: "" }])}
              className="text-[10px] text-indigo-600 font-bold hover:underline">{t("admin_tours_add_actividad")}</button>
          </div>

          {/* Inclusiones */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-500 uppercase">{t("admin_tours_inclusiones_label")}</label>
            {inclusiones.map((row, i) => (
              <input key={i} placeholder={t("admin_tours_inclusion_ph")} value={row.item}
                className="w-full bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
                onChange={(e) => { const n = [...inclusiones]; n[i].item = e.target.value; setInclusiones(n); }} />
            ))}
            <button type="button" onClick={() => setInclusiones([...inclusiones, { item: "" }])}
              className="text-[10px] text-indigo-600 font-bold hover:underline">{t("admin_tours_add_item")}</button>
          </div>

          {/* Imagen */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase">{t("admin_tours_foto_label")}{editando && " (opcional: solo si cambias la imagen)"}</label>
            <input type="file" ref={fileInputRef} onChange={manejarSeleccionArchivo} accept="image/*" className="hidden" />
            <div onClick={() => !archivoImagen && fileInputRef.current?.click()}
              className={`group relative border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center min-h-[160px] overflow-hidden transition-all ${archivoImagen ? "border-emerald-400 bg-emerald-50/5 cursor-default" : "border-slate-200 bg-slate-50 hover:border-indigo-400 cursor-pointer"}`}>
              {vistaPrevia ? (
                <div className="absolute inset-0 group">
                  <img src={vistaPrevia} alt="Preview" className="w-full h-full object-cover brightness-75" />
                  <button type="button" onClick={removerImagen}
                    className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-600 rounded-xl text-white transition-colors"><X size={14} /></button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 text-indigo-600"><ImageIcon size={20} /></div>
                  <p className="text-xs font-semibold text-slate-700">{t("admin_tours_foto_drag")}</p>
                  <p className="text-[10px] text-slate-400">{t("admin_tours_foto_formatos")}</p>
                </div>
              )}
            </div>
          </div>

          <button type="submit" disabled={cargando || guardado}
            className={`w-full text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${guardado ? "bg-emerald-600 text-white" : cargando ? "bg-slate-700 text-slate-300 cursor-wait" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}>
            {guardado ? <><Check size={15} /> {t("admin_tours_btn_guardado")}</> : cargando ? <><RefreshCw size={15} className="animate-spin" /> {t("admin_tours_btn_cargando")}</> : <><Plus size={15} /> {editando ? (t("admin_tours_btn_guardar_cambios") || "Guardar Cambios") : t("admin_tours_btn")}</>}
          </button>
        </form>
      )}

      {/* Tab Gestionar */}
      {tab === "gestionar" && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">{t("admin_tours_lista") || "Tours registrados"}</h2>
            <button onClick={cargarTours} className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"><RefreshCw size={12} /> Actualizar</button>
          </div>
          {cargandoLista ? (
            <div className="p-8 text-center text-xs text-slate-400"><RefreshCw className="animate-spin mx-auto mb-2" size={20} /> Cargando...</div>
          ) : tours.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No hay tours registrados.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {tours.map((tour) => (
                <div key={tour.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                  {tour.imagen_url ? (
                    <img src={tour.imagen_url} alt={tour.nombre} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0"><MapPin size={16} className="text-slate-400" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{tour.nombre}</p>
                    <p className="text-xs text-slate-400 truncate">{tour.zona_geografica}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${tour.estado ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                      {tour.estado ? "Activo" : "Inactivo"}
                    </span>
                    <button onClick={() => iniciarEdicion(tour)} title="Editar"
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => eliminarTour(tour.id)} title="Desactivar"
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
