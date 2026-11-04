import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, DollarSign, ShoppingBag, TrendingUp, LogOut, UtensilsCrossed, Table } from 'lucide-react';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ ventasTotales: 0, totalPedidos: 0, ventasPorBarista: [] });
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const cargarStats = () => {
    api.get('/admin/stats')
      .then(res => {
        setStats(res.data);
        setCargando(false);
      })
      .catch(err => {
        console.error("Error al cargar stats", err);
        toast.error("No se pudieron cargar las estadísticas");
        setCargando(false);
      });
  };

  useEffect(() => {
    // Cargar estadísticas al iniciar (para que se mantengan al recargar)
    cargarStats();

    // WebSocket para actualizar estadísticas en tiempo real
    const socket = new SockJS('https://cafeteria-backend-618b.onrender.com/ws-cafeteria');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/pedidos/estado', () => {
        cargarStats();
      });
    };
    stompClient.activate();

    return () => stompClient.deactivate();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cafeteria_token');
    window.location.href = '/login';
  };

  if (cargando) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Cargando panel...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} /> Volver al Panel
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg font-bold transition-colors">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>

        <h1 className="text-3xl font-bold text-amber-500 mb-8">Panel de Administración</h1>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => navigate('/admin/menu')}
            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <UtensilsCrossed size={20} /> Gestionar Menú
          </button>
          <button 
            onClick={() => navigate('/admin/mesas')}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Table size={20} /> Gestionar Mesas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="bg-green-500/20 p-4 rounded-full text-green-400">
              <DollarSign size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Ventas Totales</p>
              <p className="text-3xl font-bold text-white">
                ${stats.ventasTotales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex items-center gap-4">
            <div className="bg-blue-500/20 p-4 rounded-full text-blue-400">
              <ShoppingBag size={32} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Pedidos Servidos</p>
              <p className="text-3xl font-bold text-white">{stats.totalPedidos}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-500">
            <TrendingUp size={24} /> Rendimiento por Barista
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-sm">
                  <th className="py-3 px-4">Barista</th>
                  <th className="py-3 px-4 text-center">Pedidos Servidos</th>
                  <th className="py-3 px-4 text-right">Total Recaudado</th>
                </tr>
              </thead>
              <tbody>
                {stats.ventasPorBarista.length > 0 ? (
                  stats.ventasPorBarista.map((b, i) => (
                    <tr key={i} className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 px-4 font-semibold">{b.username}</td>
                      <td className="py-3 px-4 text-center">{b.pedidosAtendidos}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-400">
                        ${b.totalVendido.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center text-gray-500 py-6">
                      No hay datos de ventas por barista aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}