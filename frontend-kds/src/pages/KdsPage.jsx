import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { conectarWebSocket, desconectarWebSocket } from '../services/websocket';
import { Clock, CheckCircle, Flame, Loader2, LogOut, Bell } from 'lucide-react';
import api from '../services/api';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

export default function KdsPage() {
  const [pedidos, setPedidos] = useState([]);
  const [llamados, setLlamados] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState(null);

  const token = localStorage.getItem('cafeteria_token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const username = payload.sub || 'Barista';

  const handleLogout = () => {
    localStorage.removeItem('cafeteria_token');
    window.location.href = '/login';
  };

  const cargarPedidosActivos = () => {
    api.get('/pedidos/activos')
      .then(res => {
        const pedidosCargados = res.data.map(p => ({
          pedidoId: p.pedidoId,
          numeroMesa: p.numeroMesa,
          estadoPedido: p.estadoPedido,
          total: p.total,
          creadoEn: p.creadoEn,
          detalles: p.detalles || []
        })).reverse();
        setPedidos(pedidosCargados);
      })
      .catch(err => console.error("Error al cargar pedidos activos", err));
  };

  useEffect(() => {
    cargarPedidosActivos();
    setCargando(false);

    api.get('/llamados/pendientes')
      .then(res => setLlamados(res.data))
      .catch(err => console.error("Error al cargar llamados", err));

    api.get('/admin/mesas')
      .then(res => setMesas(res.data))
      .catch(err => console.error("Error al cargar mesas", err));

    conectarWebSocket((nuevoPedido) => {
      setPedidos((prev) => [nuevoPedido, ...prev]);
      toast('¡Nuevo pedido recibido!', {
        icon: '🔔',
        style: { background: '#eab308', color: '#000', fontWeight: 'bold' }
      });
    });

    const socket = new SockJS('http://localhost:8080/ws-cafeteria');
    const stompClient = new Client({ webSocketFactory: () => socket });
    stompClient.onConnect = () => {
      stompClient.subscribe('/topic/llamados', (msg) => {
        const nuevo = JSON.parse(msg.body);
        setLlamados(prev => [...prev, nuevo]);
        toast(`🔔 Mesa ${nuevo.numeroMesa}: ${nuevo.motivo}`, { 
          icon: '🔔', 
          style: { background: '#eab308', color: '#000', fontWeight: 'bold' } 
        });
      });
      
      stompClient.subscribe('/topic/mesas', (msg) => {
        const { id, estado } = JSON.parse(msg.body);
        setMesas(prev => prev.map(m => m.id === id ? { ...m, estado } : m));
      });

      stompClient.subscribe('/topic/pedidos/estado', () => {
        cargarPedidosActivos();
      });
    };
    stompClient.activate();

    return () => {
      desconectarWebSocket();
      stompClient.deactivate();
    };
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    setProcesandoId(id);
    try {
      await api.patch(`/pedidos/${id}/estado?nuevoEstado=${nuevoEstado}`);
      
      if (nuevoEstado === 'SERVIDO') {
        setPedidos((prev) => prev.filter(p => p.pedidoId !== id));
        toast.success('Pedido servido.', {
          style: { background: '#22c55e', color: '#fff' }
        });
      } else {
        setPedidos((prev) => 
          prev.map(p => p.pedidoId === id ? { ...p, estadoPedido: nuevoEstado } : p)
        );
        toast('Pedido en preparación 👨‍🍳', {
          icon: '🔥',
          style: { background: '#eab308', color: '#000' }
        });
      }
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      toast.error('No se pudo actualizar el estado.', {
        style: { background: '#ef4444', color: '#fff' }
      });
    } finally {
      setProcesandoId(null);
    }
  };

  const atenderLlamado = async (id) => {
    try {
      await api.patch(`/llamados/${id}/atender`);
      setLlamados(prev => prev.filter(x => x.id !== id));
      toast.success('Llamado atendido');
    } catch (error) {
      toast.error('No se pudo atender el llamado');
    }
  };

  if (cargando) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Cargando KDS...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">☕ Pantalla de Barra (KDS)</h1>
          <p className="text-gray-400 text-sm mt-1">Bienvenido, {username}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-green-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-[0_0_10px_rgba(34,197,94,0.5)]">
            En Línea
          </div>
          
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 transition-colors"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* Panel de Estado de Mesas */}
      <div className="mb-6 bg-gray-800 border border-gray-700 rounded-xl p-4">
        <h2 className="text-lg font-bold text-amber-500 mb-3">Estado de Mesas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {mesas.map(m => (
            <div 
              key={m.id} 
              className={`rounded-lg p-3 text-center border-2 ${
                m.estado === 'DISPONIBLE' 
                  ? 'bg-green-900/30 border-green-600 text-green-400' 
                  : 'bg-red-900/30 border-red-600 text-red-400'
              }`}
            >
              <p className="font-bold text-lg">{m.numeroMesa}</p>
              <p className="text-xs font-semibold">{m.estado}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Llamados Pendientes */}
      {llamados.length > 0 && (
        <div className="mb-6 bg-yellow-900/30 border border-yellow-600 rounded-xl p-4">
          <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
            <Bell size={24} /> Llamados Pendientes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {llamados.map(l => (
              <div key={l.id} className="bg-yellow-900/50 border border-yellow-600 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">Mesa {l.numeroMesa}</p>
                  <p className="text-sm text-yellow-300">{l.motivo}</p>
                </div>
                <button 
                  onClick={() => atenderLlamado(l.id)}
                  className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded font-bold text-sm"
                >
                  Atender
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Pedidos */}
      {pedidos.length === 0 ? (
        <div className="text-center text-gray-500 mt-20">
          <Clock size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-xl">No hay pedidos pendientes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pedidos.map((pedido) => (
            <div key={pedido.pedidoId} className="bg-gray-800 rounded-xl p-5 border-l-4 border-amber-500 shadow-xl flex flex-col justify-between h-full">
              
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold text-white">Mesa {pedido.numeroMesa}</h2>
                  <span className="text-gray-400 text-sm font-mono">#{pedido.pedidoId}</span>
                </div>
                <p className="text-sm text-gray-400 mb-4">{new Date(pedido.creadoEn).toLocaleTimeString()}</p>
                
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Total: </span>
                  <span className="text-lg font-bold text-green-400">
                    ${pedido.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                  <ul className="text-sm space-y-2">
                    {pedido.detalles && pedido.detalles.length > 0 ? (
                      pedido.detalles.map((det, index) => (
                        <li key={index} className="text-gray-200 border-b border-gray-600/50 pb-1 last:border-0 last:pb-0">
                          <span className="font-bold text-amber-400 mr-1">{det.cantidad}x</span> 
                          {det.nombreProducto}
                          {det.personalizacionesElegidas && (
                            <span className="block text-xs text-gray-400 mt-1 italic">
                              ↳ {det.personalizacionesElegidas}
                            </span>
                          )}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500 italic text-xs">Cargando detalles...</li>
                    )}
                  </ul>
                </div>
              </div>

              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  pedido.estadoPedido === 'PENDIENTE' ? 'bg-red-500 text-white' :
                  pedido.estadoPedido === 'EN_PREPARACION' ? 'bg-yellow-500 text-black' :
                  'bg-green-500 text-black'
                }`}>
                  {pedido.estadoPedido.replace('_', ' ')}
                </span>

                <div className="flex gap-2">
                  {pedido.estadoPedido === 'PENDIENTE' && (
                    <button 
                      onClick={() => cambiarEstado(pedido.pedidoId, 'EN_PREPARACION')}
                      disabled={procesandoId === pedido.pedidoId}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {procesandoId === pedido.pedidoId ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Flame size={18} />
                      )}
                      {procesandoId === pedido.pedidoId ? 'Procesando...' : 'Preparar'}
                    </button>
                  )}

                  {pedido.estadoPedido === 'EN_PREPARACION' && (
                    <button 
                      onClick={() => cambiarEstado(pedido.pedidoId, 'SERVIDO')} 
                      disabled={procesandoId === pedido.pedidoId}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {procesandoId === pedido.pedidoId ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle size={18} />
                      )}
                      {procesandoId === pedido.pedidoId ? 'Procesando...' : 'Servir'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}