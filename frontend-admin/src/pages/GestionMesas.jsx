import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

export default function GestionMesas() {
  const [mesas, setMesas] = useState([]);
  const [numeroMesa, setNumeroMesa] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mesaParaQR, setMesaParaQR] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarMesas();

    // WebSocket para actualizar el estado de las mesas en tiempo real
    const socket = new SockJS('http://localhost:8080/ws-cafeteria');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/mesas', (msg) => {
        const { id, estado } = JSON.parse(msg.body);
        setMesas(prev => prev.map(m => m.id === id ? { ...m, estado } : m));
      });
    };
    stompClient.activate();

    return () => stompClient.deactivate();
  }, []);

  const cargarMesas = () => {
    api.get('/admin/mesas')
      .then(res => {
        setMesas(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error(err);
        toast.error("Error al cargar mesas");
        setCargando(false);
      });
  };

  const handleCrearMesa = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/mesas', { numeroMesa });
      toast.success('Mesa creada exitosamente');
      setNumeroMesa('');
      cargarMesas();
    } catch (error) {
      toast.error(error.response?.data || 'Error al crear mesa');
    }
  };

  const handleEliminarMesa = async (id) => {
    if (!window.confirm("¿Eliminar esta mesa? Se perderán sus QRs.")) return;
    try {
      await api.delete(`/admin/mesas/${id}`);
      toast.success('Mesa eliminada');
      cargarMesas();
    } catch (error) {
      toast.error("Error al eliminar mesa (puede tener pedidos activos)");
    }
  };

  if (cargando) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} /> Volver al Admin
          </button>
          <h1 className="text-2xl font-bold text-amber-500">Gestión de Mesas</h1>
          <div></div>
        </div>

        {/* Formulario para crear mesa */}
        <form onSubmit={handleCrearMesa} className="bg-gray-800 p-4 rounded-xl mb-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-1">Número de Mesa (Ej: M05)</label>
            <input 
              type="text" 
              value={numeroMesa}
              onChange={e => setNumeroMesa(e.target.value)}
              className="w-full bg-gray-700 p-2 rounded"
              placeholder="M05"
              required
            />
          </div>
          <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-bold flex items-center gap-2">
            <Plus size={18} /> Crear Mesa
          </button>
        </form>

        {/* Lista de mesas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mesas.map(m => (
            <div key={m.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center border border-gray-700">
              <div>
                <p className="font-bold text-lg">Mesa {m.numeroMesa}</p>
                <p className="text-xs text-gray-400 font-mono">{m.codigoQrToken}</p>
                <span className={`inline-block mt-2 px-2 py-1 text-xs font-bold rounded ${m.estado === 'DISPONIBLE' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                  {m.estado}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button onClick={() => setMesaParaQR(m)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded" title="Ver QR">
                  <QrCode size={20} />
                </button>
                <button onClick={() => handleEliminarMesa(m.id)} className="p-2 bg-red-900/50 hover:bg-red-900 text-red-400 rounded" title="Eliminar">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para mostrar el QR */}
      {mesaParaQR && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl flex flex-col items-center text-black">
            <h2 className="text-xl font-bold mb-4">Mesa {mesaParaQR.numeroMesa}</h2>
            <div className="p-4 bg-white border-4 border-gray-200 rounded">
              <QRCodeSVG 
                value={`http://localhost:5173/?mesa=${mesaParaQR.codigoQrToken}`} 
                size={256}
              />
            </div>
            <p className="text-xs mt-4 text-gray-500 break-all text-center max-w-xs">
              http://localhost:5173/?mesa={mesaParaQR.codigoQrToken}
            </p>
            <button 
              onClick={() => setMesaParaQR(null)}
              className="mt-6 bg-gray-800 text-white px-6 py-2 rounded-lg font-bold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}