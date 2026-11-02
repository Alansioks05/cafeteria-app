import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const conectarWebSocket = (onPedidoRecibido) => {
  // Si ya hay una conexión, no hacemos nada
  if (stompClient) return;

  const socket = new SockJS('http://localhost:8080/ws-cafeteria');
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    onConnect: () => {
      console.log('KDS Conectado al WebSocket');
      
      // Suscribirse al topic de nuevos pedidos
      stompClient.subscribe('/topic/pedidos/nuevos', (message) => {
        const pedido = JSON.parse(message.body);
        onPedidoRecibido(pedido);
      });
    },
  });

  stompClient.activate();
};

export const desconectarWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};