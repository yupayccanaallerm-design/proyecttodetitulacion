import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";

interface AgregarDestinoModalProps {
  lugarNombre: string;
  lugarTipo: string;
  tourRecomendado: string;
  onClose: () => void;
  onAgregar: (data: { fechaInicio: string; duracion: number; nivelExigencia: 1 | 2 | 3 | 4 | 5 }) => void;
}

export function AgregarDestinoModal({
  lugarNombre,
  lugarTipo,
  tourRecomendado,
  onClose,
  onAgregar,
}: AgregarDestinoModalProps) {
  const { t } = useTranslation();
  const [fechaInicio, setFechaInicio] = useState("");
  const [duracion, setDuracion] = useState(1);
  const [nivelExigencia, setNivelExigencia] = useState<1 | 2 | 3 | 4 | 5>(2);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onAgregar({ fechaInicio, duracion, nivelExigencia });
  };

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600">{t("modal_agregar") || "Agregar al itinerario"}</p>
          <h3 className="mt-1 text-xl font-black text-slate-800">{lugarNombre}</h3>
          <p className="mt-1 text-sm text-slate-500">{lugarTipo} · {tourRecomendado}</p>
        </div>
        <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Fecha</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(event) => setFechaInicio(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Duración (días)</label>
          <input
            type="number"
            min={1}
            max={7}
            value={duracion}
            onChange={(event) => setDuracion(Number(event.target.value))}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-400">Nivel de exigencia</label>
          <select
            value={nivelExigencia}
            onChange={(event) => setNivelExigencia(Number(event.target.value) as 1 | 2 | 3 | 4 | 5)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          >
            <option value={1}>1 · Muy suave</option>
            <option value={2}>2 · Suave</option>
            <option value={3}>3 · Moderado</option>
            <option value={4}>4 · Exigente</option>
            <option value={5}>5 · Muy exigente</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100">
            {t("itinerario_seguir") || "Seguir editando"}
          </button>
          <button type="submit" className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700">
            {t("itinerario_enviar") || "Agregar"}
          </button>
        </div>
      </form>
    </div>
  );
}
