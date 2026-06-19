import React, { useState } from 'react';
// IMPORTAMOS LOS ÍCONOS DEL OJO POR SI DESEAS AGREGARLO DESPUÉS
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Enviamos los datos del formulario a la API de FastAPI
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Si el backend responde con un error (FastAPI usa data.detail para las excepciones)
      if (!response.ok) {
        throw new Error(data.detail || 'Credenciales incorrectas');
      }

      // 3. ¡Éxito! Guardamos el token y TODOS los datos cruciales en el localStorage
      localStorage.setItem('admin_token', data.token);
      
      // SOLUCIÓN CLAVE: Guardamos el id del usuario dinámicamente como string
      localStorage.setItem('user_id', data.usuario.id.toString()); 
      localStorage.setItem('admin_name', data.usuario.nombre);
      localStorage.setItem('user_email', data.usuario.email);
      localStorage.setItem('user_rol', data.usuario.rol);

      // 4. Redirigimos al Panel de Administración
      window.location.href = '/admin';

    } catch (err: any) {
      // Mostramos el mensaje de error en la pantalla
      setError(err.message || 'Hubo un problema al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800">Panel Administrativo</h2>
          <p className="text-gray-500 mt-2">SGEV - Control de Accesos</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="admin@turismo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 transition-colors"
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

      </div>
    </div>
  );
}