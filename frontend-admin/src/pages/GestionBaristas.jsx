import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, UserPlus, ShieldCheck, Users } from 'lucide-react';

export default function GestionBaristas() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [baristas, setBaristas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarBaristas();
  }, []);

  const cargarBaristas = () => {
    api.get('/baristas')
      .then(res => setBaristas(res.data))
      .catch(err => console.error("Error al cargar baristas", err));
  };

  const handleCrearBarista = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await api.post('/baristas', { username, password });
      toast.success('¡Barista creado exitosamente! 🎉', {
        style: { background: '#22c55e', color: '#fff' }
      });
      setUsername('');
      setPassword('');
      cargarBaristas();
    } catch (error) {
      console.error("Error al crear barista:", error);
      const mensaje = error.response?.data || 'Error al crear el barista. Revisa la consola.';
      toast.error(mensaje, {
        style: { background: '#ef4444', color: '#fff' }
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> Volver al KDS
        </button>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-700 pb-4">
            <UserPlus size={28} className="text-amber-500" />
            <h2 className="text-2xl font-bold text-white">Registrar Nuevo Barista</h2>
          </div>

          <form onSubmit={handleCrearBarista} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de Usuario</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-white"
                placeholder="Ej: carlos"
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
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              <ShieldCheck size={20} />
              {cargando ? 'Creando...' : 'Crear Barista'}
            </button>
          </form>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-4 border-b border-gray-700 pb-4">
            <Users size={24} className="text-amber-500" />
            <h2 className="text-xl font-bold text-white">Baristas Registrados</h2>
          </div>
          <div className="space-y-2">
            {baristas.map(b => (
              <div key={b.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg">
                <span className="font-semibold">{b.username}</span>
                <span className="text-sm text-gray-400 bg-gray-600 px-2 py-1 rounded">{b.rol}</span>
              </div>
            ))}
            {baristas.length === 0 && <p className="text-gray-500 text-sm text-center">No hay baristas registrados.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}