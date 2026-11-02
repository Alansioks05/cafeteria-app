import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      
      // Guardamos el token temporalmente
      localStorage.setItem('cafeteria_token', response.data.token);
      
      // Decodificamos el token para verificar el rol
      const payload = JSON.parse(atob(response.data.token.split('.')[1]));
      const roles = payload.roles || [];
      const isAdmin = roles.includes('ROLE_ADMIN');

      if (!isAdmin) {
        localStorage.removeItem('cafeteria_token');
        toast.error('Esta app es solo para administradores. Usa la app del barista.', {
          style: { background: '#ef4444', color: '#fff' }
        });
        return;
      }

      toast.success('¡Bienvenido Administrador! ☕', {
        style: { background: '#22c55e', color: '#fff' }
      });
      navigate('/');
    } catch (error) {
      localStorage.removeItem('cafeteria_token');
      toast.error('Usuario o contraseña incorrectos.', {
        style: { background: '#ef4444', color: '#fff' }
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6 text-amber-500">
          <ShieldCheck size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center text-white mb-6">Acceso Administrador</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {cargando ? 'Ingresando...' : 'Ingresar al Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}