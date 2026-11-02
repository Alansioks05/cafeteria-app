import { Plus } from 'lucide-react';

export default function ProductoCard({ producto, onAgregar }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col justify-between h-full border border-gray-100 hover:shadow-md transition-shadow">
      <div>
        <div className="w-full h-32 bg-cafe-light rounded-lg flex items-center justify-center mb-3 text-cafe-primary">
          <span className="text-4xl">☕</span>
        </div>
        <h3 className="font-bold text-lg text-cafe-dark leading-tight">{producto.nombre}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</p>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-xl text-cafe-primary">
          {/* Formato con 2 decimales: $3.50 */}
          ${producto.precioBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <button 
          onClick={() => onAgregar(producto)}
          className="bg-cafe-primary text-white p-2 rounded-full hover:bg-cafe-dark transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}