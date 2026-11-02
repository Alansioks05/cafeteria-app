import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Bell, ChefHat, CheckCircle, Clock, LogOut, Coffee } from 'lucide-react';
import api from '../services/api';
import ProductoCard from '../components/ProductoCard';
import Carrito from '../components/Carrito';
import ModalPersonalizacion from '../components/ModalPersonalizacion';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

export default function ClientePage() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  
  const [numeroMesa, setNumeroMesa] = useState(null);
  const [codigoQrToken, setCodigoQrToken] = useState(null);
  const [errorMesa, setErrorMesa] = useState(false);

  const [mostrarModalLlamado, setMostrarModalLlamado] = useState(false);
  const [pedidosActivos, setPedidosActivos] = useState([]);
  const [mostrarModalLiberar, setMostrarModalLiberar] = useState(false);
  
  // NUEVO ESTADO: Indica si el cliente ya recibió un pedido (para mostrar el botón de liberar)
  const [haRecibidoPedido, setHaRecibidoPedido] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenUrl = queryParams.get('mesa');

    if (tokenUrl) {
      setCodigoQrToken(tokenUrl);
      api.get(`/mesas/token/${tokenUrl}`)
        .then(res => setNumeroMesa(res.data.numeroMesa))
        .catch(() => setErrorMesa(true));

      api.get(`/pedidos/mesa/${tokenUrl}`)
        .then(res => {
          if (res.data) setPedidosActivos(res.data);
        })
        .catch(() => {});

      const socket = new SockJS('http://localhost:8080/ws-cafeteria');
      const stompClient = new Client({ webSocketFactory: () => socket });
      stompClient.onConnect = () => {
        stompClient.subscribe('/topic/pedidos/estado', (msg) => {
          const pedidoActualizado = JSON.parse(msg.body);
          
          setPedidosActivos(prev => {
            const existe = prev.find(p => p.pedidoId === pedidoActualizado.pedidoId);
            if (existe) {
              return prev.map(p => 
                p.pedidoId === pedidoActualizado.pedidoId ? pedidoActualizado : p
              );
            } else {
              return [...prev, pedidoActualizado];
            }
          });
        });
      };
      stompClient.activate();

      api.get('/menu/categorias').then(res => {
        setCategorias(res.data);
        if (res.data.length > 0) setCategoriaActiva(res.data[0].id);
      });
      api.get('/menu/productos').then(res => setProductos(res.data));
      api.get('/menu/opciones').then(res => setOpciones(res.data));

      return () => {
        stompClient.deactivate();
      };
    } else {
      setErrorMesa(true);
      api.get('/menu/categorias').then(res => {
        setCategorias(res.data);
        if (res.data.length > 0) setCategoriaActiva(res.data[0].id);
      });
      api.get('/menu/productos').then(res => setProductos(res.data));
      api.get('/menu/opciones').then(res => setOpciones(res.data));
    }
  }, []);

  // Actualizar haRecibidoPedido cuando hay un pedido SERVIDO
  useEffect(() => {
    const tieneServido = pedidosActivos.some(p => p.estadoPedido === 'SERVIDO');
    if (tieneServido) {
      setHaRecibidoPedido(true);
    }
  }, [pedidosActivos]);

  const productosFiltrados = categoriaActiva 
    ? productos.filter(p => p.categoriaId === categoriaActiva)
    : productos;

  const agregarAlCarrito = (productoFinal) => {
    const existeIndex = carrito.findIndex(
      item => item.id === productoFinal.id && item.personalizacionesElegidas === productoFinal.personalizacionesElegidas
    );

    if (existeIndex !== -1) {
      const nuevoCarrito = [...carrito];
      nuevoCarrito[existeIndex].cantidad += 1;
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, { ...productoFinal, cantidad: 1 }]);
    }
    
    toast.success(`${productoFinal.nombre} agregado`, {
      style: { background: '#F5EBE1', color: '#2C1E16' },
      icon: '🛒'
    });
  };

  const eliminarDelCarrito = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito.splice(index, 1);
    setCarrito(nuevoCarrito);
  };

  const enviarPedido = async () => {
    setEnviando(true);
    
    const payload = {
      codigoQrToken: codigoQrToken,
      detalles: carrito.map(item => ({
        productoId: item.id,
        cantidad: item.cantidad,
        personalizacionesElegidas: item.personalizacionesElegidas || null,
        precioFinal: item.precioBase
      }))
    };

    try {
      await api.post('/pedidos', payload);
      setCarrito([]);
      
      const res = await api.get(`/pedidos/mesa/${codigoQrToken}`);
      if (res.data) setPedidosActivos(res.data);

      toast.success('¡Pedido enviado a la barra! ☕', {
        style: { background: '#22c55e', color: '#fff' },
        duration: 4000,
      });

    } catch (error) {
      toast.error('Hubo un error al enviar el pedido.', {
        style: { background: '#ef4444', color: '#fff' },
      });
    } finally {
      setEnviando(false);
    }
  };

  const enviarLlamado = async (motivo) => {
    try {
      await api.post('/llamados', { codigoQrToken, motivo });
      toast.success('¡Llamado enviado! El barista irá pronto.', { icon: '🔔' });
      setMostrarModalLlamado(false);
    } catch (error) {
      toast.error('No se pudo enviar el llamado');
    }
  };

  const handleRecibido = async (pedidoId) => {
    try {
      await api.patch(`/pedidos/${pedidoId}/confirmar`);
      setPedidosActivos(prev => prev.filter(p => p.pedidoId !== pedidoId));
      toast.success('¡Buen provecho! ☕', { icon: '✅' });
    } catch (error) {
      toast.error('No se pudo confirmar la recepción');
    }
  };

  const handleLiberarMesa = async () => {
    try {
      await api.patch(`/pedidos/mesa/${codigoQrToken}/liberar`);
      setPedidosActivos([]);
      setHaRecibidoPedido(false); // Resetear el estado
      setMostrarModalLiberar(false);
      toast.success('¡Mesa liberada! Gracias por tu visita ☕', { icon: '👋' });
    } catch (error) {
      toast.error('No se pudo liberar la mesa');
    }
  };

  if (errorMesa) {
    return (
      <div className="min-h-screen bg-cafe-light flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-2xl font-bold text-cafe-dark mb-2">Mesa no válida</h1>
        <p className="text-gray-600 mb-6">Por favor, escanea el código QR de tu mesa para hacer un pedido.</p>
        <img src="https://cdn-icons-png.flaticon.com/512/1691/1691653.png" alt="QR" className="w-24 h-24 opacity-50" />
      </div>
    );
  }

  const renderEstadoPedidos = () => {
    return (
      <div className="mb-6 space-y-3">
        {pedidosActivos.length > 0 && pedidosActivos.map(pedido => {
          let icono, texto, color, bgIcon;
          if (pedido.estadoPedido === 'PENDIENTE') {
            icono = <Clock size={20} />;
            texto = `Pedido #${pedido.pedidoId}: Recibido. Esperando preparación.`;
            color = 'bg-yellow-50 border-yellow-200 text-yellow-800';
            bgIcon = 'bg-yellow-100 text-yellow-600';
          } else if (pedido.estadoPedido === 'EN_PREPARACION') {
            icono = <ChefHat size={20} />;
            texto = `Pedido #${pedido.pedidoId}: ¡En preparación!`;
            color = 'bg-blue-50 border-blue-200 text-blue-800';
            bgIcon = 'bg-blue-100 text-blue-600';
          } else if (pedido.estadoPedido === 'SERVIDO') {
            icono = <CheckCircle size={20} />;
            texto = `Pedido #${pedido.pedidoId}: ¡Listo! Disfruta.`;
            color = 'bg-green-50 border-green-200 text-green-800';
            bgIcon = 'bg-green-100 text-green-600';
          } else {
            return null;
          }

          return (
            <div key={pedido.pedidoId} className={`p-4 rounded-2xl border shadow-sm flex justify-between items-center ${color}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${bgIcon}`}>
                  {icono}
                </div>
                <span className="font-medium">{texto}</span>
              </div>
              
              {pedido.estadoPedido === 'SERVIDO' && (
                <button 
                  onClick={() => handleRecibido(pedido.pedidoId)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95"
                >
                  Recibido
                </button>
              )}
            </div>
          );
        })}
        
        {/* Botón de liberar mesa: aparece si ha recibido al menos un pedido */}
        {haRecibidoPedido && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-lg flex flex-col items-center text-center gap-3">
            <div className="bg-amber-100 p-3 rounded-full text-amber-600">
              <Coffee size={28} />
            </div>
            <div>
              <h3 className="font-bold text-cafe-dark text-lg">¿Ya terminaste?</h3>
              <p className="text-sm text-gray-600">Si no vas a pedir nada más, puedes liberar la mesa.</p>
            </div>
            <button 
              onClick={() => setMostrarModalLiberar(true)}
              className="w-full bg-cafe-primary hover:bg-cafe-dark text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Liberar Mesa
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-cafe-primary text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">☕ Cafetería</h1>
          <span className="bg-white text-cafe-primary px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            Mesa {numeroMesa || '...'}
          </span>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {renderEstadoPedidos()}

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaActiva(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                categoriaActiva === cat.id 
                  ? 'bg-cafe-primary text-white shadow-md' 
                  : 'bg-white text-cafe-dark hover:bg-gray-100'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {productosFiltrados.map(producto => (
            <ProductoCard 
              key={producto.id} 
              producto={producto} 
              onAgregar={() => setProductoSeleccionado(producto)} 
            />
          ))}
        </div>

        <Carrito 
          items={carrito} 
          onEliminar={eliminarDelCarrito} 
          onEnviarPedido={enviarPedido}
          enviando={enviando}
        />
      </main>

      <button 
        onClick={() => setMostrarModalLlamado(true)}
        className="fixed bottom-24 right-4 bg-cafe-accent text-cafe-dark p-4 rounded-full shadow-lg hover:bg-opacity-80 transition-all z-40"
      >
        <Bell size={24} />
      </button>

      {mostrarModalLlamado && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6">
            <h2 className="text-xl font-bold text-cafe-dark mb-4">¿Necesitas algo?</h2>
            <div className="space-y-2">
              <button onClick={() => enviarLlamado('Pedir la cuenta')} className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left font-medium text-cafe-dark">🧾 Pedir la cuenta</button>
              <button onClick={() => enviarLlamado('Necesito algo')} className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left font-medium text-cafe-dark">🤝 Necesito algo</button>
              <button onClick={() => enviarLlamado('Llamar al mesero')} className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left font-medium text-cafe-dark">🔔 Llamar al mesero</button>
            </div>
            <button onClick={() => setMostrarModalLlamado(false)} className="mt-4 w-full text-gray-500 font-medium">Cancelar</button>
          </div>
        </div>
      )}

      {mostrarModalLiberar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center">
            <div className="flex justify-center mb-4 text-amber-500">
              <Coffee size={48} />
            </div>
            <h2 className="text-xl font-bold text-cafe-dark mb-2">¿Ya no vas a pedir nada más?</h2>
            <p className="text-sm text-gray-600 mb-6">
              La mesa quedará desocupada y podrás retirarte. Si quieres pedir algo más, puedes hacerlo antes de liberar la mesa.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMostrarModalLiberar(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleLiberarMesa}
                className="flex-1 bg-cafe-primary hover:bg-cafe-dark text-white font-bold py-2 rounded-lg transition-colors"
              >
                Sí, liberar
              </button>
            </div>
          </div>
        </div>
      )}

      {productoSeleccionado && (
        <ModalPersonalizacion 
          producto={productoSeleccionado}
          opciones={opciones}
          onCerrar={() => setProductoSeleccionado(null)}
          onAgregar={agregarAlCarrito}
        />
      )}
    </div>
  );
}