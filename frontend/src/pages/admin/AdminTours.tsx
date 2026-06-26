import { useState, useRef, useEffect } from "react";
import { Plus, Image as ImageIcon, MapPin, Sparkles, Check, X, RefreshCw, Layers, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AdminTours() {
  const { t } = useTranslation();
  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [zona, setZona] = useState("Cusco Ciudad");
  const [descripcion, setDescripcion] = useState("");
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [itinerario, setItinerario] = useState([{ titulo: "", descripcion: "" }]);
  const [inclusiones, setInclusiones] = useState([{ item: "" }]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!archivoImagen) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivoImagen);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivoImagen]);

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoImagen(e.target.files[0]);
    }
  };

  const removerImagen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setArchivoImagen(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !descripcion.trim() || !archivoImagen) {
      alert(t("admin_tours_validacion"));
      return;
    }

    setCargando(true);

    const formData = new FormData();
    formData.append("nombre", nombre.trim());
    formData.append("zona_geografica", zona);
    formData.append("descripcion", descripcion.trim());
    formData.append("estado", "1");
    formData.append("imagen", archivoImagen);
    formData.append("itinerario", JSON.stringify(itinerario));
    formData.append("inclusiones", JSON.stringify(inclusiones));

    try {
      const res = await fetch("http://localhost:8000/api/tours", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setGuardado(true);
        setTimeout(() => {
          setGuardado(false);
          setNombre("");
          setDescripcion("");
          setZona("Cusco Ciudad");
          setArchivoImagen(null);
          setItinerario([{ titulo: "", descripcion: "" }]);
          setInclusiones([{ item: "" }]);
        }, 2500);
      } else {
        const errorData = await res.json();
        console.error("Detalles del error de validación:", errorData.detail);
        alert(`Error ${res.status}: ${JSON.stringify(errorData.detail) || t("error_generico")}`);
      }
    } catch (error) {
      console.error("Error de conexión con la API:", error);
      alert(t("admin_tours_error_conexion"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto mb-16 animate-fade-in">

      {/* ENCABEZADO */}
      <div className="relative p-6 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl shadow-xl overflow-hidden group">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-700" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-indigo-400 shadow-inner">
            <Layers size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide">{t("admin_tours_titulo")}</h1>
            <p className="text-xs text-slate-300 font-light mt-0.5 max-w-md leading-relaxed">
              {t("admin_tours_desc").split("SGEV").map((part, i, arr) =>
                i < arr.length - 1
                  ? <span key={i}>{part}<span className="font-semibold text-indigo-300">SGEV</span></span>
                  : <span key={i}>{part}</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO */}
      <form onSubmit={manejarGuardar} className="bg-white border border-slate-100 rounded-2xl p-7 shadow-xl shadow-slate-200/40 space-y-6 relative">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <span>{t("admin_tours_nombre_label")}</span>
            </label>
            <input
              type="text"
              placeholder={t("admin_tours_nombre_ph")}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-normal text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
              required
              disabled={cargando || guardado}
            />
          </div>

          {/* Zona */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              <span>{t("admin_tours_zona_label")}</span>
            </label>
            <select
              value={zona}
              onChange={(e) => setZona(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 outline-none cursor-pointer focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all appearance-none"
              disabled={cargando || guardado}
            >
              <option value="Cusco Ciudad">{t("admin_tours_zona_cusco")}</option>
              <option value="Valle Sagrado">{t("admin_tours_zona_valle")}</option>
              <option value="Machu Picchu">{t("admin_tours_zona_machu")}</option>
              <option value="Rutas Sur">{t("admin_tours_zona_sur")}</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-slate-400" />
              <span>{t("admin_tours_desc_label")}</span>
            </label>
            <textarea
              placeholder={t("admin_tours_desc_ph")}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full bg-slate-50/70 border border-slate-200/80 px-4 py-3 rounded-xl text-xs font-normal text-slate-700 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
              required
              disabled={cargando || guardado}
            />
          </div>
        </div>

        {/* ITINERARIO */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 uppercase">{t("admin_tours_itinerario_label")}</label>
          {itinerario.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder={t("admin_tours_actividad_ph")}
                value={row.titulo}
                className="w-1/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
                onChange={(e) => {
                  const nuevo = [...itinerario];
                  nuevo[i].titulo = e.target.value;
                  setItinerario(nuevo);
                }}
              />
              <input
                placeholder={t("admin_tours_desc2_ph")}
                value={row.descripcion}
                className="w-2/3 bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
                onChange={(e) => {
                  const nuevo = [...itinerario];
                  nuevo[i].descripcion = e.target.value;
                  setItinerario(nuevo);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() => setItinerario([...itinerario, { titulo: "", descripcion: "" }])}
            className="text-[10px] text-indigo-600 font-bold hover:underline"
          >
            {t("admin_tours_add_actividad")}
          </button>
        </div>

        {/* INCLUSIONES */}
        <div className="space-y-3 pt-6 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-500 uppercase">{t("admin_tours_inclusiones_label")}</label>
          {inclusiones.map((row, i) => (
            <input
              key={i}
              placeholder={t("admin_tours_inclusion_ph")}
              value={row.item}
              className="w-full bg-slate-50 p-2 rounded-lg text-xs border border-slate-200 outline-none focus:border-indigo-400"
              onChange={(e) => {
                const nuevo = [...inclusiones];
                nuevo[i].item = e.target.value;
                setInclusiones(nuevo);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => setInclusiones([...inclusiones, { item: "" }])}
            className="text-[10px] text-indigo-600 font-bold hover:underline"
          >
            {t("admin_tours_add_item")}
          </button>
        </div>

        {/* FOTO */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {t("admin_tours_foto_label")}
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={manejarSeleccionArchivo}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => !archivoImagen && fileInputRef.current?.click()}
            className={`group relative border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-350 flex flex-col items-center justify-center min-h-[190px] overflow-hidden ${
              archivoImagen
                ? "border-emerald-400/70 bg-emerald-50/5 cursor-default"
                : "border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-indigo-400 cursor-pointer"
            }`}
          >
            {vistaPrevia ? (
              <div className="absolute inset-0 w-full h-full animate-fade-in group">
                <img
                  src={vistaPrevia}
                  alt="Vista previa"
                  className="w-full h-full object-cover brightness-[0.85] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <button
                  type="button"
                  onClick={removerImagen}
                  className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-600 backdrop-blur-md border border-white/10 rounded-xl text-white transition-colors cursor-pointer shadow-lg animate-fade-in"
                >
                  <X size={14} />
                </button>

                <div className="absolute bottom-4 left-4 right-4 text-left flex items-end justify-between">
                  <div className="text-white space-y-0.5">
                    <p className="text-xs font-semibold line-clamp-1">{archivoImagen?.name}</p>
                    <p className="text-[10px] text-slate-300 font-light">{(archivoImagen!.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <div className="bg-emerald-500 border border-emerald-400 px-2.5 py-1 rounded-lg text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-900/20">
                    <Sparkles size={9} /> {t("admin_tours_extraccion")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                  <ImageIcon size={20} />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700">{t("admin_tours_foto_drag")}</p>
                  <p className="text-[10px] text-slate-400 font-light">{t("admin_tours_foto_formatos")}</p>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-100 px-3 py-1.5 rounded-xl text-[10px] font-semibold tracking-wide shadow-xs">
                  <Sparkles size={11} className="text-purple-500" />
                  {t("admin_tours_preparado")}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={cargando || guardado}
          className={`w-full text-xs font-bold py-3.5 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-[0.99] ${
            guardado
              ? "bg-emerald-600 text-white shadow-emerald-600/20"
              : cargando
                ? "bg-slate-700 text-slate-300 cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/20 text-white"
          }`}
        >
          {guardado ? (
            <><Check size={15} className="animate-bounce" /> {t("admin_tours_btn_guardado")}</>
          ) : cargando ? (
            <><RefreshCw size={15} className="animate-spin" /> {t("admin_tours_btn_cargando")}</>
          ) : (
            <><Plus size={15} /> {t("admin_tours_btn")}</>
          )}
        </button>

      </form>
    </div>
  );
}
