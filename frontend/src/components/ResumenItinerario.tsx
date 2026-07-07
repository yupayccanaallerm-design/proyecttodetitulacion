import { useTranslation } from "react-i18next";
import { CalendarDays, Compass, Sparkles, Trash2 } from "lucide-react";
import { useItinerario } from "../contexts/ItinerarioContext";

export function ResumenItinerario() {
  const { t } = useTranslation();
  const { destinos, limpiarItinerario, eliminarDestino } = useItinerario();

  if (destinos.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[120] w-[min(92vw,380px)] rounded-3xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-slate-800">
            <Sparkles size={16} className="text-indigo-500" />
            {t("itinerario_titulo") || "Mi itinerario"}
          </p>
          <p className="text-xs text-slate-500">
            {destinos.length} {destinos.length === 1 ? (t("itinerario_destino") || "destino") : (t("itinerario_destinos") || "destinos")}
          </p>
        </div>
        <button
          type="button"
          onClick={limpiarItinerario}
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
          title={t("itinerario_limpiar") || "Limpiar todo"}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-3 space-y-2">
        {destinos.map((destino) => (
          <div key={destino.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-slate-800">{destino.nombre}</p>
                <p className="mt-1 text-xs text-slate-500">{destino.tourRecomendado}</p>
              </div>
              <button
                type="button"
                onClick={() => eliminarDestino(destino.id)}
                className="text-xs text-slate-400 transition hover:text-rose-600"
              >
                ×
              </button>
            </div>
            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CalendarDays size={12} /> {destino.fechaInicio || "Sin fecha"}
              </span>
              <span className="flex items-center gap-1">
                <Compass size={12} /> {destino.duracion} {t("itinerario_dias") || "días"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
