import { useEffect, useState } from 'react';
import { listProductos, createProducto, updateProducto, deleteProducto } from '../../services/productos';
import Modal from '../Modal';
import { PencilIcon, TrashIcon, PlusIcon } from '../../ui/icons';
import {
  inputClass,
  labelClass,
  tableWrapClass,
  theadRowClass,
  tbodyClass,
  rowHoverClass,
  btnPrimary,
  actionBtnNeutral,
  actionBtnDanger,
  avatarInitial,
  avatarClass,
} from '../../ui/styles';

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
        <button onClick={abrirNuevo} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Nuevo producto
        </button>
      </div>

      <div className={tableWrapClass}>
        <table className="w-full text-sm">
          <thead>
            <tr className={theadRowClass}>
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoria</th>
              <th className="px-5 py-3">Precio compra</th>
              <th className="px-5 py-3">Precio venta</th>
              <th className="px-5 py-3">Stock</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {productos.map((p) => (
              <tr key={p.id} className={rowHoverClass}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className={avatarClass}>{avatarInitial(p.nombre)}</div>
                    <span className="font-medium text-slate-800">{p.nombre}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-600">{p.categoria || '-'}</td>
                <td className="px-5 py-3 text-slate-600">${Number(p.precioCompra).toFixed(2)}</td>
                <td className="px-5 py-3 text-slate-600">${Number(p.precioVenta).toFixed(2)}</td>
                <td
                  className={`px-5 py-3 ${p.stockMinimo && p.stock <= p.stockMinimo ? 'font-semibold text-red-600' : 'text-slate-600'}`}
                >
                  {p.stock}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => abrirEditar(p)} className={actionBtnNeutral}>
                      <PencilIcon /> Editar
                    </button>
                    <button onClick={() => handleDelete(p)} className={actionBtnDanger}>
                      <TrashIcon /> Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
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
          <button type="submit" className={`${btnPrimary} w-full`}>
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
}
