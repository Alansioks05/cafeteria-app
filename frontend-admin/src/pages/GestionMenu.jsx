import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';

export default function GestionMenu() {
  const [tab, setTab] = useState('productos');
  const [productos, setProductos] = useState([]);
  const [opciones, setOpciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const [prodForm, setProdForm] = useState({ id: null, nombre: '', descripcion: '', precioBase: '', categoriaId: '', imagenUrl: '', disponible: true });
  const [extraForm, setExtraForm] = useState({ id: null, nombreOpcion: '', costoAdicional: '', tipoGrupo: 'LECHE' });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    Promise.all([
      api.get('/admin/menu/productos'),
      api.get('/admin/menu/categorias'),
      api.get('/admin/menu/opciones')
    ]).then(([resProd, resCat, resOpc]) => {
      setProductos(resProd.data);
      setCategorias(resCat.data);
      setOpciones(resOpc.data);
      setCargando(false);
    }).catch(err => {
      console.error(err);
      toast.error("Error al cargar datos");
      setCargando(false);
    });
  };

  // --- PRODUCTOS ---
  const handleGuardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (prodForm.id) {
        await api.put(`/admin/menu/productos/${prodForm.id}`, prodForm);
        toast.success("Producto actualizado");
      } else {
        await api.post('/admin/menu/productos', prodForm);
        toast.success("Producto creado");
      }
      setProdForm({ id: null, nombre: '', descripcion: '', precioBase: '', categoriaId: '', imagenUrl: '', disponible: true });
      cargarDatos();
    } catch (err) {
      toast.error("Error al guardar producto");
    }
  };

  const handleEliminarProducto = async (id) => {
    if (!window.confirm("¿Eliminar producto?")) return;
    await api.delete(`/admin/menu/productos/${id}`);
    toast.success("Producto eliminado");
    cargarDatos();
  };

  const handleToggleDisponibilidad = async (id) => {
    await api.patch(`/admin/menu/productos/${id}/disponibilidad`);
    cargarDatos();
  };

  // --- EXTRAS ---
  const handleGuardarExtra = async (e) => {
    e.preventDefault();
    try {
      if (extraForm.id) {
        await api.put(`/admin/menu/opciones/${extraForm.id}`, extraForm);
        toast.success("Extra actualizado");
      } else {
        await api.post('/admin/menu/opciones', extraForm);
        toast.success("Extra creado");
      }
      setExtraForm({ id: null, nombreOpcion: '', costoAdicional: '', tipoGrupo: 'LECHE' });
      cargarDatos();
    } catch (err) {
      toast.error("Error al guardar extra");
    }
  };

  const handleEliminarExtra = async (id) => {
    if (!window.confirm("¿Eliminar extra?")) return;
    await api.delete(`/admin/menu/opciones/${id}`);
    toast.success("Extra eliminado");
    cargarDatos();
  };

  if (cargando) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-gray-400 hover:text-white">
            <ArrowLeft size={20} /> Volver al Admin
          </button>
          <h1 className="text-2xl font-bold text-amber-500">Gestión de Menú</h1>
          <div></div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setTab('productos')} className={`px-4 py-2 rounded-lg font-bold ${tab === 'productos' ? 'bg-amber-600' : 'bg-gray-800'}`}>Productos</button>
          <button onClick={() => setTab('extras')} className={`px-4 py-2 rounded-lg font-bold ${tab === 'extras' ? 'bg-amber-600' : 'bg-gray-800'}`}>Extras</button>
        </div>

        {/* CONTENIDO PRODUCTOS */}
        {tab === 'productos' && (
          <div className="space-y-6">
            <form onSubmit={handleGuardarProducto} className="bg-gray-800 p-4 rounded-xl space-y-3">
              <h2 className="font-bold text-amber-500">{prodForm.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Nombre" value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} className="bg-gray-700 p-2 rounded col-span-2" required />
                <input placeholder="Descripción" value={prodForm.descripcion} onChange={e => setProdForm({...prodForm, descripcion: e.target.value})} className="bg-gray-700 p-2 rounded col-span-2" />
                <input type="number" step="0.01" placeholder="Precio Base" value={prodForm.precioBase} onChange={e => setProdForm({...prodForm, precioBase: e.target.value})} className="bg-gray-700 p-2 rounded" required />
                <select value={prodForm.categoriaId} onChange={e => setProdForm({...prodForm, categoriaId: e.target.value})} className="bg-gray-700 p-2 rounded" required>
                  <option value="">Selecciona Categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <input placeholder="URL Imagen (opcional)" value={prodForm.imagenUrl} onChange={e => setProdForm({...prodForm, imagenUrl: e.target.value})} className="bg-gray-700 p-2 rounded col-span-2" />
              </div>
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-bold flex items-center gap-2">
                {prodForm.id ? <Edit size={18} /> : <Plus size={18} />} {prodForm.id ? 'Actualizar' : 'Crear'}
              </button>
            </form>

            <div className="space-y-2">
              {productos.map(p => (
                <div key={p.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">{p.nombre}</p>
                    <p className="text-sm text-gray-400">${p.precioBase} - {categorias.find(c => c.id === p.categoriaId)?.nombre}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleToggleDisponibilidad(p.id)} className={`p-2 rounded ${p.disponible ? 'text-green-400' : 'text-red-400'}`}>
                      {p.disponible ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </button>
                    <button onClick={() => setProdForm({...p})} className="p-2 text-blue-400"><Edit size={20} /></button>
                    <button onClick={() => handleEliminarProducto(p.id)} className="p-2 text-red-400"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO EXTRAS */}
        {tab === 'extras' && (
          <div className="space-y-6">
            <form onSubmit={handleGuardarExtra} className="bg-gray-800 p-4 rounded-xl space-y-3">
              <h2 className="font-bold text-amber-500">{extraForm.id ? 'Editar Extra' : 'Nuevo Extra'}</h2>
              <div className="grid grid-cols-3 gap-3">
                <input placeholder="Nombre" value={extraForm.nombreOpcion} onChange={e => setExtraForm({...extraForm, nombreOpcion: e.target.value})} className="bg-gray-700 p-2 rounded col-span-3" required />
                <input type="number" step="0.01" placeholder="Costo Adicional" value={extraForm.costoAdicional} onChange={e => setExtraForm({...extraForm, costoAdicional: e.target.value})} className="bg-gray-700 p-2 rounded" required />
                <select value={extraForm.tipoGrupo} onChange={e => setExtraForm({...extraForm, tipoGrupo: e.target.value})} className="bg-gray-700 p-2 rounded">
                  <option value="LECHE">LECHE</option>
                  <option value="EXTRA">EXTRA</option>
                  <option value="TAMAÑO">TAMAÑO</option>
                  <option value="ENDULZANTE">ENDULZANTE</option>
                </select>
              </div>
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded font-bold flex items-center gap-2">
                {extraForm.id ? <Edit size={18} /> : <Plus size={18} />} {extraForm.id ? 'Actualizar' : 'Crear'}
              </button>
            </form>

            <div className="space-y-2">
              {opciones.map(o => (
                <div key={o.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">{o.nombreOpcion} <span className="text-xs bg-gray-700 px-2 py-1 rounded ml-2">{o.tipoGrupo}</span></p>
                    <p className="text-sm text-gray-400">+${o.costoAdicional}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExtraForm({...o})} className="p-2 text-blue-400"><Edit size={20} /></button>
                    <button onClick={() => handleEliminarExtra(o.id)} className="p-2 text-red-400"><Trash2 size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}