import { useState } from 'react';
import { X, Calendar, Clock, Mountain, AlertCircle } from 'lucide-react';

interface Props {
  lugarNombre: string;
  lugarTipo: string;
  tourRecomendado: string;
  onClose: () => void;
  onAgregar: (data: {
    fechaInicio: string;
    duracion: number;
    nivelExigencia: 1 | 2 | 3 | 4 | 5;
  }) => void;
}

export function AgregarDestinoModal({ 
  lugarNombre, 
  lugarTipo, 
  tourRecomendado, 
  onClose, 
  onAgregar 
}: Props) {
  const [fechaInicio, setFechaInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [nivelExigencia, setNivelExigencia] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!fechaInicio) {
      setError('Por favor selecciona una fecha de inicio');
      return;
    }
    setError('');
    onAgregar({ fechaInicio, duracion, nivelExigencia });
    onClose();
  };

  const getNivelDescripcion = (n: number) => {
    if (n <= 2) return '🟢 Suave - Para todos';
    if (n <= 4) return '🟡 Moderado - Algo de caminata';
    return '🔴 Exigente - Alta montaña';
  };

  const getNivelColor = (n: number) => {
    if (n <= 2) return 'bg-green-100 text-green-700 hover:bg-green-200';
    if (n <= 4) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    return 'bg-red-100 text-red-700 hover:bg-red-200';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[35px] max-w-md w-full p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{lugarNombre}</h3>
            <p className="text-xs text-slate-400">{lugarTipo}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Tour recomendado */}
        <div className="bg-indigo-50 rounded-xl p-3 mb-4">
          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Tour recomendado</p>
          <p className="text-xs text-slate-600">{tourRecomendado}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Formulario */}
        <div className="space-y-4">
          {/* Fecha */}
          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-1.5">
              <Calendar size={14} /> Fecha de inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Duración */}
          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-1.5">
              <Clock size={14} /> Duración (días)
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((d) => (
                <button
                  key={d}
                  onClick={() => setDuracion(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    duracion === d 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          {/* Nivel de exigencia */}
          <div>
            <label className="text-xs font-bold text-slate-600 flex items-center gap-2 mb-1.5">
              <Mountain size={14} /> Nivel de exigencia física
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setNivelExigencia(n as 1 | 2 | 3 | 4 | 5)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    nivelExigencia === n 
                      ? `${getNivelColor(n)} shadow-lg` 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              {getNivelDescripcion(nivelExigencia)}
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose} 
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Agregar al itinerario
          </button>
        </div>
      </div>
    </div>
  );
}