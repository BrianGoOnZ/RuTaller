import { useEffect, useState } from 'react';
import { listProductos, createProducto, updateProducto, deleteProducto } from '../../services/productos';
import Modal from '../Modal';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const VACIO = { nombre: '', sku: '', categoria: '', precioCompra: '', precioVenta: '', stock: '', stockMinimo: '' };

export default function ProductosTab() {
  const [productos, setProductos] = useState([]);
  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(VACIO);

  async function cargar() {
    setProductos(await listProductos(q));
  }

  useEffect(() => {
    cargar();
  }, [q]);

  function abrirNuevo() {
    setEditando(null);
    setForm(VACIO);
    setModalOpen(true);
  }

  function abrirEditar(p) {
    setEditando(p);
    setForm({
      nombre: p.nombre,
      sku: p.sku || '',
      categoria: p.categoria || '',
      precioCompra: p.precioCompra,
      precioVenta: p.precioVenta,
      stock: p.stock,
      stockMinimo: p.stockMinimo || '',
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editando) await updateProducto(editando.id, form);
    else await createProducto(form);
    setModalOpen(false);
    cargar();
  }

  async function handleDelete(p) {
    if (!confirm(`Desactivar ${p.nombre}?`)) return;
    await deleteProducto(p.id);
    cargar();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <input
          className={`${inputClass} max-w-xs`}
          placeholder="Buscar producto..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          onClick={abrirNuevo}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Categoria</th>
              <th className="px-4 py-2">Precio compra</th>
              <th className="px-4 py-2">Precio venta</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{p.nombre}</td>
                <td className="px-4 py-2">{p.categoria}</td>
                <td className="px-4 py-2">${Number(p.precioCompra).toFixed(2)}</td>
                <td className="px-4 py-2">${Number(p.precioVenta).toFixed(2)}</td>
                <td className={`px-4 py-2 ${p.stockMinimo && p.stock <= p.stockMinimo ? 'text-red-600 font-semibold' : ''}`}>
                  {p.stock}
                </td>
                <td className="px-4 py-2 text-right space-x-3">
                  <button className="text-slate-500 hover:text-slate-800" onClick={() => abrirEditar(p)}>
                    Editar
                  </button>
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p)}>
                    Desactivar
                  </button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Sin productos registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editando ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nombre</label>
            <input className={inputClass} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>SKU / codigo</label>
              <input className={inputClass} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Categoria</label>
              <input className={inputClass} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Precio de compra</label>
              <input type="number" step="0.01" className={inputClass} value={form.precioCompra} onChange={(e) => setForm({ ...form, precioCompra: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Precio de venta</label>
              <input type="number" step="0.01" className={inputClass} value={form.precioVenta} onChange={(e) => setForm({ ...form, precioVenta: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Stock</label>
              <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Stock minimo (alerta)</label>
              <input type="number" className={inputClass} value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white rounded-md py-2 text-sm font-medium hover:bg-slate-800">
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
