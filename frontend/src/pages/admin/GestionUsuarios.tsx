import React, { useState, useEffect } from 'react';
// Importamos los íconos necesarios de lucide-react
import { Eye, EyeOff, Edit, Trash2, X } from 'lucide-react';

// SOLUCIÓN 1: Corregimos 'str' por 'string' que es la sintaxis nativa de TypeScript
interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  created_at?: string;
}

export default function GestionUsuarios() {
  // Pestañas activas: 'mi_perfil', 'crear_usuario' o 'lista_usuarios'
  const [activeTab, setActiveTab] = useState<'mi_perfil' | 'crear_usuario' | 'lista_usuarios'>('mi_perfil');

  // --- Estados globales de datos ---
  const [listaUsuarios, setListaUsuarios] = useState<Usuario[]>([]);

  // --- Estados para Pestaña 1: Mi Perfil ---
  const [nombre, setNombre] = useState(localStorage.getItem('admin_name') || '');
  const [email, setEmail] = useState(localStorage.getItem('user_email') || ''); // Cargamos el correo de la sesión actual
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [msgPerfil, setMsgPerfil] = useState({ text: '', isError: false });

  const [showPassActual, setShowPassActual] = useState(false);
  const [showPassNueva, setShowPassNueva] = useState(false);

  // --- Estados para Pestaña 2: Crear Usuario ---
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoEmail, setNuevoEmail] = useState('');
  const [nuevoPass, setNuevoPass] = useState('');
  const [nuevoRol, setNuevoRol] = useState('admin');
  const [msgCrear, setMsgCrear] = useState({ text: '', isError: false });

  const [showNuevoPass, setShowNuevoPass] = useState(false);

  // --- Estados para el Modal de Edición ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [nombreEditando, setNombreEditando] = useState('');
  const [emailEditando, setEmailEditando] = useState('');
  const [rolEditando, setRolEditando] = useState('admin');
  const [passEditando, setPassEditando] = useState('');
  const [showPassEditando, setShowPassEditando] = useState(false);

  // ==========================================
  // EFECTOS: Cargar la lista al cambiar de pestaña
  // ==========================================
  useEffect(() => {
    if (activeTab === 'lista_usuarios') {
      obtenerUsuarios();
    }
  }, [activeTab]);

  const obtenerUsuarios = async () => {
    try {
      // SOLUCIÓN 2: Removemos la barra diagonal '/' del final para evitar el error 404 en FastAPI
      const res = await fetch('http://127.0.0.1:8000/api/usuarios');
      if (res.ok) {
        const data = await res.json();
        setListaUsuarios(data);
      } else {
        console.error("FastAPI respondió con un error al listar:", res.status);
      }
    } catch (err) {
      console.error("Error al obtener la lista de usuarios:", err);
    }
  };

  // ==========================================
  // HANDLERS: Pestaña 1 y Pestaña 2
  // ==========================================
  const handleActualizarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPerfil({ text: '', isError: false });

    // SOLUCIÓN 3: Leemos el id de forma reactiva al hacer click para que no se quede trabado en ID 1
    const idUsuarioLogueado = localStorage.getItem('user_id');
    if (!idUsuarioLogueado) {
      setMsgPerfil({ text: 'Sesión inválida o expirada. Inicie sesión de nuevo.', isError: true });
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/usuarios/actualizar-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: parseInt(idUsuarioLogueado), nombre, email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al actualizar');
      
      localStorage.setItem('admin_name', nombre);
      localStorage.setItem('user_email', email);
      setMsgPerfil({ text: '¡Perfil actualizado con éxito!', isError: false });
    } catch (err: any) {
      setMsgPerfil({ text: err.message, isError: true });
    }
  };

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgPerfil({ text: '', isError: false });

    const idUsuarioLogueado = localStorage.getItem('user_id');
    if (!idUsuarioLogueado) {
      setMsgPerfil({ text: 'Sesión inválida o expirada.', isError: true });
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/usuarios/cambiar-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: parseInt(idUsuarioLogueado),
          password_actual: passActual,
          password_nueva: passNueva
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al cambiar contraseña');
      
      setPassActual('');
      setPassNueva('');
      setMsgPerfil({ text: '¡Contraseña modificada con éxito!', isError: false });
    } catch (err: any) {
      setMsgPerfil({ text: err.message, isError: true });
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgCrear({ text: '', isError: false });
    try {
      const res = await fetch('http://127.0.0.1:8000/api/usuarios/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre, email: nuevoEmail, password: nuevoPass, rol: nuevoRol })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al crear usuario');

      setNuevoNombre('');
      setNuevoEmail('');
      setNuevoPass('');
      setMsgCrear({ text: `Usuario registrado con éxito (ID: ${data.id_usuario})`, isError: false });
    } catch (err: any) {
      setMsgCrear({ text: err.message, isError: true });
    }
  };

  // ==========================================
  // HANDLERS NUEVOS: Editar y Eliminar de la Tabla
  // ==========================================
  const handleEliminar = async (idUsuario: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar permanentemente este usuario?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/usuarios/eliminar/${idUsuario}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || 'Error al eliminar');
      
      alert("Usuario eliminado correctamente.");
      obtenerUsuarios(); // Refrescamos la tabla
    } catch (err: any) {
      alert(err.message);
    }
  };

  const abrirModalEdicion = (u: Usuario) => {
    setIdEditando(u.id);
    setNombreEditando(u.nombre);
    setEmailEditando(u.email);
    setRolEditando(u.rol);
    setPassEditando(''); // Vacío por defecto para no alterarla a menos que se escriba una nueva
    setIsModalOpen(true);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idEditando === null) return;

    try {
      const res = await fetch('http://127.0.0.1:8000/api/usuarios/editar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: idEditando,
          nombre: nombreEditando,
          email: emailEditando,
          rol: rolEditando,
          password: passEditando.trim() === "" ? null : passEditando
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || 'Error al actualizar');

      alert("Usuario actualizado con éxito");
      setIsModalOpen(false);
      obtenerUsuarios(); // Refrescamos la tabla
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-md mt-6 font-sans">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Control de Usuarios - SGEV</h2>

      {/* --- DISEÑO DE LAS PESTAÑAS (TABS) --- */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'mi_perfil' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('mi_perfil')}
        >
          Mi Perfil y Contraseña
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'crear_usuario' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('crear_usuario')}
        >
          Asignar / Crear Usuarios
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'lista_usuarios' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('lista_usuarios')}
        >
          Lista de Personal
        </button>
      </div>

      {/* PESTAÑA 1: MI PERFIL */}
      {activeTab === 'mi_perfil' && (
        <div className="space-y-8">
          {msgPerfil.text && (
            <div className={`p-3 rounded text-sm ${msgPerfil.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {msgPerfil.text}
            </div>
          )}
          <form onSubmit={handleActualizarPerfil} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Actualizar Datos Personales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
              </div>
            </div>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium">Guardar Cambios</button>
          </form>

          <form onSubmit={handleCambiarPassword} className="bg-gray-50 p-4 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Cambiar Contraseña</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                <div className="relative mt-1">
                  <input type={showPassActual ? "text" : "password"} value={passActual} onChange={(e) => setPassActual(e.target.value)} required className="block w-full rounded-md border-gray-300 p-2 pr-10 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
                  <button type="button" onClick={() => setShowPassActual(!showPassActual)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">{showPassActual ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <div className="relative mt-1">
                  <input type={showPassNueva ? "text" : "password"} value={passNueva} onChange={(e) => setPassNueva(e.target.value)} required className="block w-full rounded-md border-gray-300 p-2 pr-10 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
                  <button type="button" onClick={() => setShowPassNueva(!showPassNueva)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">{showPassNueva ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
            </div>
            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium">Actualizar Contraseña</button>
          </form>
        </div>
      )}

      {/* PESTAÑA 2: CREAR USUARIOS */}
      {activeTab === 'crear_usuario' && (
        <form onSubmit={handleCrearUsuario} className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Registrar un Nuevo Integrante</h3>
          {msgCrear.text && (
            <div className={`p-3 rounded text-sm ${msgCrear.isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {msgCrear.text}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
              <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
              <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña de Asignación</label>
              <div className="relative mt-1">
                <input type={showNuevoPass ? "text" : "password"} value={nuevoPass} onChange={(e) => setNuevoPass(e.target.value)} required className="block w-full rounded-md border-gray-300 p-2 pr-10 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
                <button type="button" onClick={() => setShowNuevoPass(!showNuevoPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">{showNuevoPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rol del Usuario</label>
              <select value={nuevoRol} onChange={(e) => setNuevoRol(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500">
                <option value="admin">Administrador</option>
                <option value="empleado">Empleado / Operador</option>
                <option value="guia">Guía Turístico</option>
              </select>
            </div>
          </div>
          <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 text-sm font-medium mt-2">Registrar Usuario</button>
        </form>
      )}

      {/* PESTAÑA 3: LISTA DE USUARIOS CON TABLA */}
      {activeTab === 'lista_usuarios' && (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Correo Electrónico</th>
                <th className="px-6 py-3">Rol asignado</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-900">
              {listaUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">No hay usuarios registrados en el sistema.</td>
                </tr>
              ) : (
                listaUsuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{user.id}</td>
                    <td className="px-6 py-4 font-medium">{user.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        user.rol === 'admin' ? 'bg-purple-100 text-purple-800' : user.rol === 'guia' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.rol === 'admin' ? 'Administrador' : user.rol === 'guia' ? 'Guía Turístico' : 'Empleado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      <button onClick={() => abrirModalEdicion(user)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 font-medium transition-colors">
                        <Edit size={16} /> Editar
                      </button>
                      <button onClick={() => handleEliminar(user.id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1 font-medium transition-colors">
                        <Trash2 size={16} /> Borrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- VENTANA MODAL EMERGENTE: EDITAR INTEGRANTE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Modificar Datos de Usuario (ID: {idEditando})</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleGuardarEdicion} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" value={nombreEditando} onChange={(e) => setNombreEditando(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input type="email" value={emailEditando} onChange={(e) => setEmailEditando(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol Administrativo</label>
                <select value={rolEditando} onChange={(e) => setRolEditando(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 p-2 text-gray-900 bg-white border outline-none focus:border-indigo-500">
                  <option value="admin">Administrador</option>
                  <option value="empleado">Empleado / Operador</option>
                  <option value="guia">Guía Turístico</option>
                </select>
              </div>

              <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                <label className="block text-sm font-medium text-amber-800">Forzar Nueva Contraseña (Opcional)</label>
                <div className="relative mt-1">
                  <input type={showPassEditando ? "text" : "password"} value={passEditando} onChange={(e) => setPassEditando(e.target.value)} placeholder="Dejar vacío para no cambiarla" className="block w-full rounded-md border-amber-300 p-2 pr-10 text-gray-900 bg-white border outline-none focus:border-amber-500" />
                  <button type="button" onClick={() => setShowPassEditando(!showPassEditando)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-amber-600 hover:text-amber-800">{showPassEditando ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                <span className="text-xs text-amber-700 mt-1 block">Si el usuario tenía clave PHP antigua ($2y$), ingresar una clave aquí la actualizará automáticamente a Python ($2b$).</span>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}