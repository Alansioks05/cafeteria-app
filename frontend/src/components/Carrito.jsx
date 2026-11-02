import { Trash2, Send } from 'lucide-react';

export default function Carrito({ items, onEliminar, onEnviarPedido, enviando }) {
  const total = items.reduce((acc, item) => acc + (item.precioBase * item.cantidad), 0);

  if (items.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm text-center text-gray-500 mt-4">
        <p>Tu carrito está vacío. ¡Elige algo rico! ☕</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mt-4 border border-gray-100">
      <h2 className="text-xl font-bold text-cafe-dark mb-4 border-b pb-2">Tu Pedido</h2>
      
      <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{item.cantidad}x {item.nombre}</p>
              <p className="text-xs text-gray-500">
                ${(item.precioBase * item.cantidad).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button onClick={() => onEliminar(index)} className="text-red-400 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between font-bold text-lg mb-4 text-cafe-dark">
          <span>Total:</span>
          <span>
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        
        <button 
          onClick={onEnviarPedido}
          disabled={enviando}
          className="w-full bg-cafe-accent text-cafe-dark font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-80 transition-colors disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : <><Send size={20} /> Enviar a Barra</>}
        </button>
      </div>
    </div>
  );
}