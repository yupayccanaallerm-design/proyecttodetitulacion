import { useLocation } from "react-router-dom";

export default function Itinerario() {

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const tour = params.get("tour");
  const price = Number(params.get("price") || 0);

  const personas = 4; // luego dinámico
  const total = price * personas;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">

      <h1 className="text-4xl font-bold mb-6 text-cyan-400">
        Itinerario del Tour
      </h1>

      {/* INFO GENERAL */}
      <div className="bg-slate-900 p-6 rounded-2xl mb-6">
        <h2 className="text-2xl font-bold">{tour}</h2>
        <p className="text-gray-400">Paquete turístico personalizado</p>
      </div>

      {/* DÍA 1 */}
      <div className="bg-slate-900 p-6 rounded-2xl mb-4">
        <h3 className="text-xl font-bold text-cyan-300 mb-2">Día 1</h3>
        <ul className="text-gray-300 space-y-2">
          <li>Recojo del hotel</li>
          <li>Transporte turístico</li>
          <li>Visita guiada</li>
          <li>Almuerzo incluido</li>
        </ul>
      </div>

      {/* DÍA 2 */}
      <div className="bg-slate-900 p-6 rounded-2xl mb-6">
        <h3 className="text-xl font-bold text-cyan-300 mb-2">Día 2</h3>
        <ul className="text-gray-300 space-y-2">
          <li>Desayuno</li>
          <li>Tour complementario</li>
          <li>Retorno a Cusco</li>
        </ul>
      </div>

      {/* RESUMEN */}
      <div className="bg-cyan-500/10 border border-cyan-500 p-6 rounded-2xl">
        <h3 className="text-xl font-bold mb-4">Resumen de Reserva</h3>

        <div className="space-y-2">
          <p>Precio por persona: <b>$ {price}</b></p>
          <p>Personas: <b>{personas}</b></p>
          <p className="text-lg font-bold text-green-400">
            Total: $ {total}
          </p>
        </div>
      </div>

    </div>
  );
}