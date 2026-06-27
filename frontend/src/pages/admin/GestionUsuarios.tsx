import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Edit, Trash2, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_BASE, authFetch } from '../../api';

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  created_at?: string;
}

type Msg = { text: string; isError: boolean };

export default function GestionUsuarios() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'mi_perfil' | 'crear_usuario' | 'lista_usuarios'>('mi_perfil');
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);

  const [nombre, setNombre] = useState(localStorage.getItem('admin_name') || '');
  const [email, setEmail] = useState(localStorage.getItem('user_email') || '');
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [msgPerfil, setMsgPerfil] = useState<Msg>({ text: '', isError: false });
  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);

  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPass, setNuevoPass] = useState('');
  const [nuevoRol, setNuevoRol] = useState('admin');
  const [msgCrear, setMsgCrear] = useState<Msg>({ text: '', isError: false });
  const [showNuevoPass, setShowNuevoPass] = useState(false);
  const [msgLista, setMsgLista] = useState<Msg>({ text: '', isError: false });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nombreEditando, setNombreEditando] = useState('');
  const [emailEditando, setEmailEditando] = useState('');
  const [rolEditando, setRolEditando] = useState('admin');
  const [passEditando, setPassEditando] = useState('');
  const [showPassEditando, setShowPassEditando] = useState(false);

  useEffect(() => {
    if (activeTab === 'lista_usuarios') obtenerUsuarios();
  }, [activeTab]);

  const obtenerUsuarios = async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios`);
      if (res.ok) {
        const data = await res.json();
        setListaUsuarios(data);
      }
    } catch {
      setMsgLista({ text: t('error_generico') || 'Error al cargar usuarios', isError: true });
    }
  };

  const handleActualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPerfil({ text: '', isError: false });
    const idUsuarioLogueado = localStorage.getItem('user_id');
    if (!idUsuarioLogueado) {
      setMsgPerfil({ text: t('gestion_sesion_invalida'), isError: true });
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/actualizar-perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: parseInt(idUsuarioLogueado), nombre, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('error_generico'));
      localStorage.setItem('admin_name', nombre);
      localStorage.setItem('user_email', email);
      setMsgPerfil({ text: t('gestion_perfil_exito'), isError: false });
    } catch (err: any) {
      setMsgPerfil({ text: err.message, isError: true });
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPerfil({ text: '', isError: false });
    const idUsuarioLogueado = localStorage.getItem('user_id');
    if (!idUsuarioLogueado) {
      setMsgPerfil({ text: t('gestion_sesion_expirada'), isError: true });
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/cambiar-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: parseInt(idUsuarioLogueado),
          password_actual: passActual,
          password_nueva: passNueva,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('error_generico'));
      setPassActual('');
      setPassNueva('');
      setMsgPerfil({ text: t('gestion_password_exito'), isError: false });
    } catch (err: any) {
      setMsgPerfil({ text: err.message, isError: true });
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgCrear({ text: '', isError: false });
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre, email: nuevoEmail, password: nuevoPass, rol: nuevoRol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('error_generico'));
      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoPass('');
      setMsgCrear({ text: t('gestion_crear_exito', { id: data.id_usuario }), isError: false });
    } catch (err: any) {
      setMsgCrear({ text: err.message, isError: true });
    }
  };

  const handleEliminar = async (idUsuario: number) => {
    if (!window.confirm(t('gestion_eliminar_confirm'))) return;
    setMsgLista({ text: '', isError: false });
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/eliminar/${idUsuario}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('error_generico'));
      setMsgLista({ text: t('gestion_eliminar_exito'), isError: false });
      obtenerUsuarios();
    } catch (err: any) {
      setMsgLista({ text: err.message, isError: true });
    }
  };

  const abrirModalEdicion = (u: Usuario) => {
    setIdEditando(u.id);
    setNombreEditando(u.nombre);
    setEmailEditando(u.email);
    setRolEditando(u.rol);
    setPassEditando('');
    setIsModalOpen(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idEditando === null) return;
    try {
      const res = await authFetch(`${API_BASE}/api/usuarios/editar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idEditando,
          nombre: nombreEditando,
          email: emailEditando,
          rol: rolEditando,
          password: passEditando.trim() === "" ? null : passEditando,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || t('error_generico'));
      setMsgLista({ text: t('gestion_actualizar_exito'), isError: false });
      setIsModalOpen(false);
      obtenerUsuarios();
    } catch (err: any) {
      setMsgLista({ text: err.message, isError: true });
    }
  };

  const getRolLabel = (rol: string) => {
    if (rol === 'admin') return t('gestion_rol_admin');
    if (rol === 'guia') return t('gestion_rol_guia');
    return t('gestion_rol_empleado');
  };

  const MsgAlert = ({ msg }: { msg: Msg }) =>
    msg.text ? (
      <div className={`flex items-center gap-2 p-3 rounded-xl text-sm border ${
        msg.isError
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      }`}>
        {msg.isError ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
        {msg.text}
      </div>
    ) : null;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 font-sans">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">{t('gestion_titulo')}</h2>

      {/* TABS */}
      <div className="flex border-b border-slate-200 mb-6">
        {[
          { key: 'mi_perfil',      label: t('gestion_tab_perfil') },
          { key: 'crear_usuario',  label: t('gestion_tab_crear') },
          { key: 'lista_usuarios', label: t('gestion_tab_lista') },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
              activeTab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab(key as any)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PESTAÑA 1: MI PERFIL */}
      {activeTab === 'mi_perfil' && (
        <div className="space-y-8">
          <MsgAlert msg={msgPerfil} />
          <form onSubmit={handleActualizarPerfil} className="bg-slate-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">{t('gestion_perfil_titulo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_nombre')}</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors">{t('gestion_guardar')}</button>
          </form>

          <form onSubmit={handleCambiarPassword} className="bg-slate-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-slate-700">{t('gestion_password_titulo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_password_actual')}</label>
                <div className="relative mt-1">
                  <input type={showPassActual ? "text" : "password"} value={passActual} onChange={(e) => setPassActual(e.target.value)} required className="block w-full rounded-xl border border-slate-300 p-2 pr-10 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  <button type="button" onClick={() => setShowPassActual(!showPassActual)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showPassActual ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_password_nueva')}</label>
                <div className="relative mt-1">
                  <input type={showPassNueva ? "text" : "password"} value={passNueva} onChange={(e) => setPassNueva(e.target.value)} required className="block w-full rounded-xl border border-slate-300 p-2 pr-10 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                  <button type="button" onClick={() => setShowPassNueva(!showPassNueva)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showPassNueva ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
            </div>
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors">{t('gestion_password_btn')}</button>
          </form>
        </div>
      )}

      {/* PESTAÑA 2: CREAR USUARIOS */}
      {activeTab === 'crear_usuario' && (
        <form onSubmit={handleCrearUsuario} className="bg-slate-50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">{t('gestion_crear_titulo')}</h3>
          <MsgAlert msg={msgCrear} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('gestion_nombre')}</label>
              <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('gestion_email')}</label>
              <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('gestion_crear_password')}</label>
              <div className="relative mt-1">
                <input type={showNuevoPass ? "text" : "password"} value={nuevoPass} onChange={(e) => setNuevoPass(e.target.value)} required className="block w-full rounded-xl border border-slate-300 p-2 pr-10 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
                <button type="button" onClick={() => setShowNuevoPass(!showNuevoPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600">{showNuevoPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">{t('gestion_crear_rol')}</label>
              <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                <option value="admin">{t('gestion_rol_admin')}</option>
                <option value="empleado">{t('gestion_rol_empleado')}</option>
                <option value="guia">{t('gestion_rol_guia')}</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium mt-2 transition-colors">{t('gestion_crear_btn')}</button>
        </form>
      )}

      {/* PESTAÑA 3: LISTA */}
      {activeTab === 'lista_usuarios' && (
        <div className="space-y-4">
          <MsgAlert msg={msgLista} />
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-700 uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-3">{t('gestion_lista_id')}</th>
                  <th className="px-6 py-3">{t('gestion_lista_nombre')}</th>
                  <th className="px-6 py-3">{t('gestion_lista_email')}</th>
                  <th className="px-6 py-3">{t('gestion_lista_rol')}</th>
                  <th className="px-6 py-3 text-center">{t('gestion_lista_acciones')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-900">
                {listaUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-slate-500">{t('gestion_lista_vacia')}</td>
                  </tr>
                ) : (
                  listaUsuarios.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{user.id}</td>
                      <td className="px-6 py-4 font-medium">{user.nombre}</td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : user.rol === 'guia' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {getRolLabel(user.rol)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center space-x-3">
                        <button onClick={() => abrirModalEdicion(user)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-medium transition-colors">
                          <Edit size={16} /> {t('gestion_editar')}
                        </button>
                        <button onClick={() => handleEliminar(user.id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 font-medium transition-colors">
                          <Trash2 size={16} /> {t('gestion_borrar')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDICIÓN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{t('gestion_modal_titulo', { id: idEditando })}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_nombre')}</label>
                <input type="text" value={nombreEditando} onChange={(e) => setNombreEditando(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_email')}</label>
                <input type="email" value={emailEditando} onChange={(e) => setEmailEditando(e.target.value)} required className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">{t('gestion_modal_rol')}</label>
                <select value={rolEditando} onChange={(e) => setRolEditando(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 p-2 text-slate-900 bg-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100">
                  <option value="admin">{t('gestion_rol_admin')}</option>
                  <option value="empleado">{t('gestion_rol_empleado')}</option>
                  <option value="guia">{t('gestion_rol_guia')}</option>
                </select>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                <label className="block text-sm font-medium text-amber-800">{t('gestion_modal_pass_label')}</label>
                <div className="relative mt-1">
                  <input type={showPassEditando ? "text" : "password"} value={passEditando} onChange={(e) => setPassEditando(e.target.value)} placeholder={t('gestion_modal_pass_ph')} className="block w-full rounded-xl border border-amber-300 p-2 pr-10 text-slate-900 bg-white outline-none focus:border-amber-500" />
                  <button type="button" onClick={() => setShowPassEditando(!showPassEditando)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600 hover:text-amber-800">{showPassEditando ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <span className="text-xs text-amber-700 mt-1 block">{t('gestion_modal_pass_nota')}</span>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">{t('gestion_cancelar')}</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">{t('gestion_guardar')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
