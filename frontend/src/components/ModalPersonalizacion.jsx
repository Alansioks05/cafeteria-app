import { useState } from 'react';
import { X } from 'lucide-react';

export default function ModalPersonalizacion({ producto, opciones, onCerrar, onAgregar }) {
  const [seleccion, setSeleccion] = useState({
    LECHE: null,
    EXTRA: null,
    TAMANO: null,
    ENDULZANTE: null
  });

  const opcionesPorTipo = opciones.reduce((acc, op) => {
    if (!acc[op.tipoGrupo]) acc[op.tipoGrupo] = [];
    acc[op.tipoGrupo].push(op);
    return acc;
  }, {});

  const handleSeleccion = (tipo, opcion) => {
    setSeleccion(prev => ({
      ...prev,
      [tipo]: opcion
    }));
  };

  const calcularPrecioTotal = () => {
    let extra = 0;
    Object.values(seleccion).forEach(op => {
      if (op) extra += op.costoAdicional;
    });
    return producto.precioBase + extra;
  };

  const handleAgregar = () => {
    const elegidas = Object.values(seleccion)
      .filter(op => op !== null)
      .map(op => op.nombreOpcion)
      .join(', ');

    const productoFinal = {
      ...producto,
      precioBase: calcularPrecioTotal(),
      personalizacionesElegidas: elegidas || null
    };

    onAgregar(productoFinal);
    onCerrar();
  };

  // Función para mostrar el nombre del grupo correctamente (TAMAÑO en lugar de TAMANO)
  const formatearNombreGrupo = (tipo) => {
    if (tipo === 'TAMANO') return 'TAMAÑO';
    return tipo;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="bg-cafe-light p-4 flex justify-between items-center border-b">
          <h3 className="text-lg font-bold text-cafe-dark">Personaliza tu {producto.nombre}</h3>
          <button onClick={onCerrar} className="p-1 hover:bg-gray-200 rounded-full">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-6">
          {Object.entries(opcionesPorTipo).map(([tipo, ops]) => (
            <div key={tipo}>
              <h4 className="font-bold text-gray-800 mb-2 uppercase text-sm tracking-wide border-b pb-1">
                {formatearNombreGrupo(tipo)}
              </h4>
              <div className="space-y-2">
                {ops.map(op => (
                  <label key={op.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer border border-transparent transition-colors">
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name={tipo}
                        checked={seleccion[tipo]?.id === op.id}
                        onChange={() => handleSeleccion(tipo, op)}
                        className="w-4 h-4 text-cafe-primary focus:ring-cafe-primary"
                      />
                      <span className="text-gray-700 font-medium">{op.nombreOpcion}</span>
                    </div>
                    {op.costoAdicional > 0 && (
                      <span className="text-sm font-bold text-gray-500">
                        +${op.costoAdicional.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <button 
            onClick={handleAgregar}
            className="w-full bg-cafe-primary hover:bg-cafe-dark text-white font-bold py-3 rounded-xl shadow-md transition-colors flex justify-between items-center px-4"
          >
            <span>Agregar al Carrito</span>
            <span>${calcularPrecioTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </button>
        </div>

      </div>
    </div>
  );
}