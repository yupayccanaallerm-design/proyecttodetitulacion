import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation } from "lucide-react";

// Fix del ícono por defecto de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Coordenadas EXACTAS (verificadas) de los destinos en Cusco
const COORDENADAS_DESTINOS: Record<string, [number, number]> = {
  machupicchu: [-13.163141, -72.545829],
  sacsayhuaman: [-13.508889, -71.981667],
  qorikancha: [-13.518056, -71.978611],
  moray: [-13.328333, -72.192500],
  salineras: [-13.323889, -72.198056],
  tipon: [-13.578056, -71.863611],
  "7colores": [-13.855278, -71.301389],
  laguna_huamantay: [-13.394722, -71.079722],
  ollantaytambo: [-13.259722, -72.263333],
  rainbow_mountain: [-13.855278, -71.301389],
  valle_sagrado: [-13.316667, -72.083333],
};

const ALIAS_COORDENADAS: Record<string, string> = {
  machu_picchu: "machupicchu",
  machu_picchu_cusco: "machupicchu",
  machu_pichu: "machupicchu",
  sacsayhuaman: "sacsayhuaman",
  sacsayhuaman_cusco: "sacsayhuaman",
  qorikancha_cusco: "qorikancha",
  moray_cusco: "moray",
  salineras_de_maras: "salineras",
  salineras_maras: "salineras",
  montana_7_colores: "7colores",
  montaña_7_colores: "7colores",
  laguna_humantay: "laguna_huamantay",
  laguna_huamantay_cusco: "laguna_huamantay",
  montana_7_colores_cusco: "7colores",
};

const CUSCO_CENTER: [number, number] = [-13.5319, -71.9675];

function normalizarNombre(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function obtenerCoordenadas(nombre: string): [number, number] {
  const key = normalizarNombre(nombre);
  const destinoClave = COORDENADAS_DESTINOS[key] ? key : ALIAS_COORDENADAS[key] || key;
  return COORDENADAS_DESTINOS[destinoClave] || CUSCO_CENTER;
}

function generarLinkComoLlegar(nombre: string) {
  const query = `${nombre}, Cusco, Perú`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

// Icono personalizado con número de posición
function crearIconoNumerado(numero: number) {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: linear-gradient(135deg, #6366f1, #9333ea);
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">${numero}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function AjustarVista({ posiciones }: { posiciones: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (posiciones.length === 0) return;
    if (posiciones.length === 1) {
      map.setView(posiciones[0], 13);
    } else {
      const bounds = L.latLngBounds(posiciones);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [posiciones, map]);

  return null;
}

interface MapaDestinosProps {
  destinos: Array<{ destino?: string; nombre?: string; score?: number }>;
  titleOverride?: string;
  subtitleOverride?: string;
}

export default function MapaDestinos({ destinos, titleOverride, subtitleOverride }: MapaDestinosProps) {
  const puntos = useMemo(
    () =>
      destinos.map((item, index) => {
        const nombre = item.destino || item.nombre || `Destino ${index + 1}`;
        return {
          nombre,
          coords: obtenerCoordenadas(nombre),
          score: item.score,
          index,
        };
      }),
    [destinos]
  );

  const posiciones = useMemo(() => puntos.map((p) => p.coords), [puntos]);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-800">{titleOverride || "Mapa de destinos"}</h3>
        <p className="text-sm text-slate-500">
          {subtitleOverride || "Vista rápida de los destinos recomendados"}
        </p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-100" style={{ height: 420 }}>
        <MapContainer
          center={CUSCO_CENTER}
          zoom={9}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AjustarVista posiciones={posiciones} />

          {puntos.map((punto) => (
            <Marker
              key={`${punto.nombre}-${punto.index}`}
              position={punto.coords}
              icon={crearIconoNumerado(punto.index + 1)}
            >
              <Popup minWidth={220}>
                <div className="text-sm">
                  <p className="font-bold text-slate-800 mb-1">{punto.nombre}</p>

                  {punto.score != null && (
                    <p className="text-xs text-indigo-600 font-semibold mb-2">
                      Coincidencia: {Math.round(punto.score * 100)}%
                    </p>
                  )}

                  <p className="text-[11px] text-slate-400 mb-2">
                    {punto.coords[0].toFixed(5)}, {punto.coords[1].toFixed(5)}
                  </p>

                  <a
                    href={generarLinkComoLlegar(punto.nombre)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Navigation size={13} /> Cómo llegar
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Lista debajo del mapa con botón de navegación directo */}
      <div className="grid gap-3 md:grid-cols-2 mt-4">
        {puntos.map((punto) => (
          <div
            key={`lista-${punto.nombre}-${punto.index}`}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-3 flex items-center gap-3"
          >
            <span className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {punto.index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{punto.nombre}</p>
              <p className="text-xs text-slate-500">Destino seleccionado</p>
            </div>

            <a
              href={generarLinkComoLlegar(punto.nombre)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
              aria-label={`Cómo llegar a ${punto.nombre}`}
            >
              <Navigation size={12} /> Ir
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}