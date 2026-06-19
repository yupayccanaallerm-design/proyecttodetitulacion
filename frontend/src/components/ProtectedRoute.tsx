import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  // Revisa si existe el token que guardamos en el Login
  const token = localStorage.getItem('admin_token');

  // Si no hay token, lo expulsa y lo manda al /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si hay token, lo deja pasar a las páginas hijas (admin)
  return <Outlet />;
}