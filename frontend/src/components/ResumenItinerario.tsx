import { useItinerario } from '../contexts/ItinerarioContext';
import {
  MapPin, Calendar, Trash2, Send, X, Eye,
  Clock, Users, AlertCircle, CheckCircle,
  TrendingUp, Sparkles
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

export function ResumenItinerario() {
  const { t, i18n } = useTranslation();
  const { destinos, eliminarDestino, limpiarItinerario, totalDias, totalDestinos } = useItinerario();
  const [isOpen, setIsOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormularioCliente, setMostrarFormularioCliente] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);
  const [clienteData, setClienteData] = useState(() => {
    const saved = localStorage.getItem('cliente_datos');
    return saved ? JSON.parse(saved) : { nombre: '', email: '', telefono: '', comentarios: '' };
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (clienteData.nombre || clienteData.email || clienteData.telefono) {
      localStorage.setItem('cliente_datos', JSON.stringify(clienteData));
    }
  }, [clienteData]);

  useEffect(() => {
    if (mostrarFormularioCliente && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [mostrarFormularioCliente]);

  const estadisticas = {
    totalDias: destinos.reduce((acc, d) => acc + d.duracion, 0),
    nivelPromedio: destinos.length > 0 ? Math.round(destinos.reduce((acc, d) => acc + d.nivelExigencia, 0) / destinos.length) : 0,
    tipos: [...new Set(destinos.map(d => d.tipo))],
    actividades: destinos.flatMap(d => d.actividades || []),
  };

  const destinosOrdenados = [...destinos].sort((a, b) =>
    new Date(a.fechaInicio + "T00:00:00").getTime() - new Date(b.fechaInicio + "T00:00:00").getTime()
  );

  if (destinos.length === 0) return null;

  const handleEnviarReserva = async () => {
    if (!clienteData.nombre || !clienteData.email || !clienteData.telefono) {
      setMostrarFormularioCliente(true);
      return;
    }

    setEnviando(true);

    const payload = {
      cliente: {
        nombre: clienteData.nombre,
        email: clienteData.email,
        telefono: clienteData.telefono,
        comentarios: clienteData.comentarios || "",
      },
      itinerario: destinos.map((d: any) => ({
        lugar: d.nombre,
        tipo: d.tipo,
        fechaInicio: d.fechaInicio,
        duracion: d.duracion,
        nivelExigencia: d.nivelExigencia,
        tourRecomendado: d.tourRecomendado || "",
        actividades: d.actividades || [],
      })),
      totalDias,
      totalDestinos,
      estadisticas,
      fechaReserva: new Date().toISOString(),
    };

    console.log("📤 Enviando reserva desde itinerario:", payload);

    try {
      const response = await fetch('http://localhost:8000/api/reservas/itinerario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Reserva creada:", data);
        
        setEnviadoExitoso(true);
        setTimeout(() => {
          alert(t('itinerario_exito') || '✅ ¡Reserva enviada con éxito!\n\nLos proveedores se pondrán en contacto contigo en las próximas 24 horas.');
          limpiarItinerario();
          setIsOpen(false);
          setMostrarFormularioCliente(false);
          setEnviadoExitoso(false);
          setClienteData({ nombre: '', email: '', telefono: '', comentarios: '' });
          localStorage.removeItem('cliente_datos');
        }, 500);
      } else {
        const errorData = await response.json();
        console.error("❌ Error del servidor:", errorData);
        throw new Error(errorData.detail || 'Error en el servidor');
      }
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert(t('itinerario_error') || '❌ Error al enviar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  const getNivelEmoji = (nivel: number) => {
    if (nivel <= 2) return '🟢';
    if (nivel <= 4) return '🟡';
    return '🔴';
  };

  const getNivelTexto = (nivel: number) => {
    if (nivel <= 2) return t('itinerario_nivel_suave') || 'Suave';
    if (nivel <= 4) return t('itinerario_nivel_moderado') || 'Moderado';
    return t('itinerario_nivel_exigente') || 'Exigente';
  };

  const locale = i18n.language === "en" ? "en-US" : "es-ES";

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl shadow-indigo-500/40 transition-all z-40 flex items-center gap-2 group animate-bounce-once"
      >
        <MapPin size={24} className="group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
          {destinos.length}
        </span>
        <span className="max-w-0 group-hover:max-w-xs overflow-hidden transition-all duration-300 text-sm font-bold whitespace-nowrap">
          {t('itinerario_ver') || 'Ver mi itinerario'}
        </span>
        <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
      </button>

      {/* PANEL LATERAL */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[99999] flex justify-end animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <div
              ref={panelRef}
              className="bg-white w-full max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-300 p-6 flex flex-col relative"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
                      <Eye size={18} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">{t('itinerario_titulo') || 'Mi itinerario'}</h2>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-xs text-slate-400">
                      {totalDestinos} {totalDestinos === 1 ? (t('itinerario_destino') || 'destino') : (t('itinerario_destinos') || 'destinos')} • {totalDias} {totalDias === 1 ? (t('itinerario_dia') || 'día') : (t('itinerario_dias') || 'días')}
                    </p>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <TrendingUp size={10} />
                      {t('itinerario_nivel') || 'Nivel'} {estadisticas.nivelPromedio}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600 hover:rotate-90 duration-300"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ESTADÍSTICAS */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 mb-4 border border-indigo-100">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('itinerario_stat_destinos') || 'Destinos'}</p>
                    <p className="text-lg font-black text-indigo-600">{totalDestinos}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('itinerario_stat_dias') || 'Días'}</p>
                    <p className="text-lg font-black text-indigo-600">{totalDias}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t('itinerario_stat_nivel') || 'Nivel'}</p>
                    <p className="text-lg font-black text-indigo-600">{estadisticas.nivelPromedio}</p>
                  </div>
                </div>
                {estadisticas.tipos.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2 justify-center">
                    {estadisticas.tipos.map((tipo, i) => (
                      <span key={i} className="text-[9px] bg-white/60 px-2 py-0.5 rounded-full text-slate-500 border border-indigo-100">
                        {tipo}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTA DE DESTINOS */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {destinos.map((destino: any, index: number) => {
                  const fechaInicioActual = new Date(destino.fechaInicio + "T00:00:00");
                  const fechaFinActual = new Date(fechaInicioActual);
                  fechaFinActual.setDate(fechaFinActual.getDate() + destino.duracion - 1);

                  const tieneCruce = destinos.some((d: any) => {
                    if (d.id === destino.id) return false;
                    const exInicio = new Date(d.fechaInicio + "T00:00:00");
                    const exFin = new Date(exInicio);
                    exFin.setDate(exFin.getDate() + d.duracion - 1);
                    return fechaInicioActual <= exFin && fechaFinActual >= exInicio;
                  });

                  const indexOrdenado = destinosOrdenados.findIndex(d => d.id === destino.id);
                  let tieneHuecoCritico = false;
                  let diasDeDiferencia = 0;

                  if (indexOrdenado > 0) {
                    const destinoAnterior = destinosOrdenados[indexOrdenado - 1];
                    const fechaInicioAnterior = new Date(destinoAnterior.fechaInicio + "T00:00:00");
                    const fechaFinAnterior = new Date(fechaInicioAnterior);
                    fechaFinAnterior.setDate(fechaFinAnterior.getDate() + destinoAnterior.duracion - 1);
                    const diferenciaTiempo = fechaInicioActual.getTime() - fechaFinAnterior.getTime();
                    diasDeDiferencia = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));
                    if (diasDeDiferencia > 7) tieneHuecoCritico = true;
                  }

                  return (
                    <div key={destino.id} className="space-y-2 animate-in fade-in duration-300">
                      {tieneHuecoCritico && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-[11px] px-3 py-2 rounded-xl flex items-center gap-1.5 mx-1 transition-all">
                          <AlertCircle size={13} className="shrink-0 text-amber-500" />
                          <span dangerouslySetInnerHTML={{ __html: t('itinerario_hueco', { dias: diasDeDiferencia }).replace(String(diasDeDiferencia), `<strong>${diasDeDiferencia}</strong>`) }} />
                        </div>
                      )}

                      <div
                        className={`rounded-2xl p-4 border transition-all hover:shadow-md group relative overflow-hidden ${
                          tieneCruce
                            ? 'bg-red-50/70 border-red-200 hover:border-red-300'
                            : 'bg-slate-50 border-slate-100 hover:border-indigo-200'
                        }`}
                      >
                        <div className={`absolute top-0 left-0 h-1 transition-all duration-700 ${
                          destino.nivelExigencia <= 2 ? 'bg-green-400' :
                          destino.nivelExigencia <= 4 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} style={{ width: `${(destino.nivelExigencia / 5) * 100}%` }} />

                        {tieneCruce && (
                          <span className="absolute top-3 right-12 text-[9px] font-black uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded animate-pulse">
                            {t('itinerario_cruce') || '⚠️ Fechas Cruzadas'}
                          </span>
                        )}

                        <div className="flex items-start justify-between pt-1">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">#{index + 1}</span>
                              <h4 className="font-bold text-slate-800 text-sm">{destino.nombre}</h4>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mt-1.5 text-[10px]">
                              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{destino.tipo}</span>
                              <span className={`px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                                destino.nivelExigencia <= 2 ? 'bg-green-50 text-green-600' :
                                destino.nivelExigencia <= 4 ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                              }`}>
                                {getNivelEmoji(destino.nivelExigencia)} {getNivelTexto(destino.nivelExigencia)}
                              </span>
                              <span className="bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Clock size={10} /> {destino.duracion} {t('itinerario_dias') || 'días'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 bg-white/70 inline-flex px-2 py-1 rounded-lg border border-slate-100">
                              <Calendar size={11} className="text-slate-400" />
                              <p className="text-[10px] text-slate-600 font-semibold">
                                {new Date(destino.fechaInicio + "T00:00:00").toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
                                {' — '}
                                {fechaFinActual.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>

                            {destino.actividades?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {destino.actividades.slice(0, 2).map((act: string, i: number) => (
                                  <span key={i} className="text-[9px] bg-white px-1.5 py-0.5 rounded-full text-slate-400 border border-slate-200">{act}</span>
                                ))}
                                {destino.actividades.length > 2 && (
                                  <span className="text-[9px] text-slate-400">+{destino.actividades.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => eliminarDestino(destino.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-all shrink-0 ml-2 opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* FORMULARIO CLIENTE */}
              {mostrarFormularioCliente && (
                <div className="border-t border-slate-100 pt-4 mt-4 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-indigo-500" />
                    <p className="text-xs font-bold text-slate-600">{t('itinerario_contacto_titulo') || 'Tus datos de contacto'}</p>
                    <span className="text-[9px] text-red-400">* {t('itinerario_obligatorios') || 'obligatorios'}</span>
                  </div>
                  <input
                    ref={firstInputRef}
                    type="text"
                    placeholder={t('itinerario_nombre_ph') || 'Nombre completo *'}
                    value={clienteData.nombre}
                    onChange={(e) => setClienteData({ ...clienteData, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50/50"
                  />
                  <input
                    type="email"
                    placeholder={t('itinerario_email_ph') || 'Correo electrónico *'}
                    value={clienteData.email}
                    onChange={(e) => setClienteData({ ...clienteData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50/50"
                  />
                  <input
                    type="tel"
                    placeholder={t('itinerario_telefono_ph') || 'Teléfono / WhatsApp *'}
                    value={clienteData.telefono}
                    onChange={(e) => setClienteData({ ...clienteData, telefono: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50/50"
                  />
                  <textarea
                    placeholder={t('itinerario_comentarios_ph') || 'Comentarios adicionales (opcional)'}
                    value={clienteData.comentarios || ''}
                    onChange={(e) => setClienteData({ ...clienteData, comentarios: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-slate-50/50 resize-none"
                  />
                </div>
              )}

              {/* BOTONES */}
              <div className="border-t border-slate-100 pt-4 mt-4 space-y-2.5">
                <div className="flex gap-2">
                  <button
                    onClick={limpiarItinerario}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('itinerario_limpiar') || '🗑️ Limpiar todo'}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {t('itinerario_seguir') || '✏️ Seguir editando'}
                  </button>
                </div>

                <button
                  onClick={handleEnviarReserva}
                  disabled={enviando}
                  className={`w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 ${
                    enviando ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {enviando ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('itinerario_enviando') || 'Enviando reserva...'}</>
                  ) : enviadoExitoso ? (
                    <><CheckCircle size={18} /> {t('itinerario_enviado') || '¡Enviado!'}</>
                  ) : (
                    <><Send size={16} /> {t('itinerario_enviar') || 'Enviar reserva'} <Sparkles size={14} className="opacity-50" /></>
                  )}
                </button>

                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle size={12} className="text-slate-300" />
                  <p className="text-[9px] text-slate-400 text-center leading-relaxed">
                    {t('itinerario_aviso') || 'Solo guardamos tu reserva. El pago se realiza directamente con los proveedores.'}
                    <br />
                    <span className="text-indigo-400 font-medium">{t('itinerario_aviso_24h') || 'Los proveedores te contactarán en 24h.'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        @keyframes bounce-once { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .animate-bounce-once { animation: bounce-once 0.6s ease-in-out 1; }
      `}</style>
    </>
  );
}