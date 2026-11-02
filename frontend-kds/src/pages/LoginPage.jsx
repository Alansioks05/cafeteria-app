import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Coffee } from 'lucide-react';

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
      localStorage.setItem('cafeteria_token', response.data.token);
      
      // Verificar el rol
      const payload = JSON.parse(atob(response.data.token.split('.')[1]));
      const roles = payload.roles || [];
      const isAdmin = roles.includes('ROLE_ADMIN');

      if (isAdmin) {
        toast.error('Esta app es solo para baristas. Usa la app del administrador.', {
          style: { background: '#ef4444', color: '#fff' }
        });
        localStorage.removeItem('cafeteria_token');
        return;
      }

      toast.success('¡Bienvenido Barista! ☕', {
        style: { background: '#22c55e', color: '#fff' }
      });
      navigate('/');
    } catch (error) {
      toast.error('Usuario o contraseña incorrectos.', {
        style: { background: '#ef4444', color: '#fff' }
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-cafe-light flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex justify-center mb-6 text-cafe-primary">
          <Coffee size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center text-cafe-dark mb-6">Acceso Baristas</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary focus:border-transparent outline-none"
              placeholder="barista"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-cafe-primary hover:bg-cafe-dark text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4"
          >
            {cargando ? 'Ingresando...' : 'Ingresar al KDS'}
          </button>
        </form>
      </div>
    </div>
  );
}