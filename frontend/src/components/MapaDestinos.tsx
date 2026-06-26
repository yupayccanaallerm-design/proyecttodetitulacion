import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

// -------------------------------------------------------
// Coordenadas de todos los destinos turísticos de Cusco
// -------------------------------------------------------
const COORDS: Record<string, [number, number]> = {
  // Machu Picchu y alrededores
  "machu picchu": [-13.1631, -72.5450],
  "machupicchu": [-13.1631, -72.5450],

  // Ciudad de Cusco y sitios urbanos
  "centro histórico de cusco": [-13.5226, -71.9674],
  "centro historico de cusco": [-13.5226, -71.9674],
  "cusco": [-13.5226, -71.9674],
  "city tour cusco": [-13.5226, -71.9674],
  "qorikancha": [-13.5177, -71.9763],
  "templo del sol": [-13.5177, -71.9763],

  // Ruinas cercanas a Cusco
  "sacsayhuamán": [-13.5094, -71.9819],
  "sacsayhuaman": [-13.5094, -71.9819],

  // Valle Sagrado
  "valle sagrado": [-13.3167, -72.0833],
  "pisac": [-13.4155, -71.8461],
  "ollantaytambo": [-13.2589, -72.2620],
  "chinchero": [-13.3833, -72.0500],
  "moray": [-13.3359, -72.1957],
  "salineras de maras": [-13.3355, -72.1699],
  "maras": [-13.3355, -72.1699],

  // Valle Sur
  "tipón": [-13.5756, -71.8765],
  "tipon": [-13.5756, -71.8765],
  "andahuaylillas": [-13.6677, -71.6760],
  "pikillacta": [-13.6237, -71.7350],

  // Alta montaña
  "montaña de 7 colores": [-13.8631, -71.2714],
  "montana de 7 colores": [-13.8631, -71.2714],
  "vinicunca": [-13.8631, -71.2714],
  "arcoiris": [-13.8631, -71.2714],
  "7 colores": [-13.8631, -71.2714],
  "laguna humantay": [-13.5038, -72.5558],
  "humantay": [-13.5038, -72.5558],
  "salkantay": [-13.3379, -72.5571],
  "nevado salkantay": [-13.3379, -72.5571],

  // Otros destinos
  "choquequirao": [-13.5356, -72.7897],
};

// Centro del mapa por defecto: Cusco
const CUSCO_CENTER: [number, number] = [-13.53, -71.97];

// Colores por posición en el ranking
const RANK_COLORS = ["#4f46e5", "#7c3aed", "#0891b2", "#0d9488", "#64748b"];
const RANK_LABELS = ["1°", "2°", "3°", "4°", "5°"];

interface Destino {
  destino: string;
  score?: number;
}

interface MapaDestinosProps {
  destinos: Destino[];
  titleOverride?: string;
  subtitleOverride?: string;
}

function resolveCoords(nombre: string): [number, number] | null {
  const key = nombre.toLowerCase().trim();
  // Búsqueda exacta
  if (COORDS[key]) return COORDS[key];
  // Búsqueda parcial: si el nombre contiene alguna clave conocida
  for (const [k, v] of Object.entries(COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

export default function MapaDestinos({ destinos, titleOverride, subtitleOverride }: MapaDestinosProps) {
  const { t } = useTranslation();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destruir mapa anterior si existe
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: CUSCO_CENTER,
      zoom: 9,
      zoomControl: true,
      scrollWheelZoom: false, // Evita zoom accidental al hacer scroll en la página
    });

    mapRef.current = map;

    // Tile layer de OpenStreetMap (gratuito)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    const bounds: [number, number][] = [];

    destinos.forEach((item, i) => {
      const coords = resolveCoords(item.destino);
      if (!coords) return;

      bounds.push(coords);

      const color = RANK_COLORS[i] ?? RANK_COLORS[RANK_COLORS.length - 1];
      const rank = RANK_LABELS[i] ?? `${i + 1}°`;
      const pct = item.score != null ? Math.round(item.score * 100) : null;

      // Icono personalizado con número de ranking
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            width: 36px; height: 36px;
            background: ${color};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            display: flex; align-items: center; justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-weight: 900;
              font-size: 11px;
              font-family: sans-serif;
              line-height: 1;
            ">${rank}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -38],
      });

      const popup = L.popup({
        maxWidth: 220,
        className: "custom-popup",
      }).setContent(`
        <div style="font-family: sans-serif; padding: 4px 2px;">
          <div style="
            display: inline-block;
            background: ${color};
            color: white;
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 2px 8px;
            border-radius: 999px;
            margin-bottom: 6px;
          ">${i18n.t("mapa_recomendacion")} ${rank}</div>
          <div style="font-weight: 900; font-size: 14px; color: #1e293b; margin-bottom: 4px; line-height: 1.3;">
            ${item.destino}
          </div>
          ${pct !== null ? `
            <div style="margin-top: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <span style="font-size: 10px; color: #64748b; font-weight: 600;">${i18n.t("mapa_compatibilidad")}</span>
                <span style="font-size: 11px; font-weight: 900; color: ${color};">${pct}%</span>
              </div>
              <div style="background: #e2e8f0; border-radius: 999px; height: 5px; overflow: hidden;">
                <div style="background: ${color}; width: ${Math.min(pct, 100)}%; height: 100%; border-radius: 999px;"></div>
              </div>
            </div>
          ` : ""}
        </div>
      `);

      L.marker(coords, { icon }).addTo(map).bindPopup(popup);
    });

    // Ajustar el mapa para que se vean todos los marcadores
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 11);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [destinos]);

  return (
    <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-black text-slate-800">{titleOverride || t("mapa_titulo")}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{subtitleOverride || t("mapa_clic")}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {destinos.slice(0, 3).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm"
              style={{ background: RANK_COLORS[i] }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Contenedor del mapa */}
      <div ref={containerRef} style={{ height: "340px", width: "100%" }} />

      {/* Leyenda */}
      <div className="px-6 py-4 border-t border-slate-100">
        <div className="flex flex-wrap gap-2">
          {destinos.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: RANK_COLORS[i] ?? RANK_COLORS[RANK_COLORS.length - 1] }}
              />
              <span className="truncate max-w-[120px]">{item.destino}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
