import { useEffect, useState } from 'react';
import { listProductos } from '../../services/productos';
import { listVentas, createVenta } from '../../services/ventas';
import SearchSelect from '../SearchSelect';
import { TrashIcon } from '../../ui/icons';
import { inputClass, cardClass, tbodyClass, btnSuccess } from '../../ui/styles';

export default function VentaRapidaTab() {
  const [carrito, setCarrito] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargarVentas() {
    setVentas(await listVentas());
  }

  useEffect(() => {
    cargarVentas();
  }, []);

  function agregarProducto(producto) {
    setCarrito((prev) => {
      const existente = prev.find((i) => i.producto.id === producto.id);
      if (existente) {
        return prev.map((i) =>
          i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function actualizarCantidad(productoId, cantidad) {
    setCarrito((prev) => prev.map((i) => (i.producto.id === productoId ? { ...i, cantidad } : i)));
  }

  function quitar(productoId) {
    setCarrito((prev) => prev.filter((i) => i.producto.id !== productoId));
  }

  const subtotal = carrito.reduce((acc, i) => acc + Number(i.producto.precioVenta) * i.cantidad, 0);

  async function cobrar() {
    setError('');
    setMensaje('');
    if (carrito.length === 0) return;
    try {
      await createVenta({
        fecha: new Date().toISOString().slice(0, 10),
        items: carrito.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      });
      setCarrito([]);
      setMensaje('Venta registrada');
      cargarVentas();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar la venta');
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cardClass} space-y-4`}>
        <h2 className="font-semibold text-slate-800">Venta de mostrador</h2>
        <SearchSelect
          placeholder="Buscar producto para agregar..."
          onSearch={listProductos}
          renderItem={(p) => (
            <>
              <p className="font-medium">{p.nombre}</p>
              <p className="text-xs text-slate-500">
                ${Number(p.precioVenta).toFixed(2)} · stock: {p.stock}
              </p>
            </>
          )}
          onSelect={agregarProducto}
        />

        <table className="w-full text-sm">
          <tbody className={tbodyClass}>
            {carrito.map((i) => (
              <tr key={i.producto.id}>
                <td className="py-2 text-slate-700">{i.producto.nombre}</td>
                <td className="w-20 py-2">
                  <input
                    type="number"
                    min={1}
                    max={i.producto.stock}
                    className={inputClass}
                    value={i.cantidad}
                    onChange={(e) => actualizarCantidad(i.producto.id, Number(e.target.value))}
                  />
                </td>
                <td className="py-2 text-right text-slate-700">
                  ${(Number(i.producto.precioVenta) * i.cantidad).toFixed(2)}
                </td>
                <td className="py-2 text-right">
                  <button
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                    onClick={() => quitar(i.producto.id)}
                  >
                    <TrashIcon width={14} height={14} /> Quitar
                  </button>
                </td>
              </tr>
            ))}
            {carrito.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-slate-400">
                  Agrega productos a la venta
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between border-t border-slate-100 pt-3 font-semibold text-slate-800">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

        <button
          onClick={cobrar}
          disabled={carrito.length === 0}
          className={`${btnSuccess} w-full`}
        >
          Cobrar
        </button>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 font-semibold text-slate-800">Ventas recientes</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-1.5">Fecha</th>
              <th className="py-1.5">Productos</th>
              <th className="py-1.5">Total</th>
            </tr>
          </thead>
          <tbody className={tbodyClass}>
            {ventas.slice(0, 10).map((v) => (
              <tr key={v.id}>
                <td className="py-2 text-slate-600">{v.fecha}</td>
                <td className="py-2 text-slate-600">{v.VentaItems?.length} producto(s)</td>
                <td className="py-2 text-slate-600">${Number(v.total).toFixed(2)}</td>
              </tr>
            ))}
            {ventas.length === 0 && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400">
                  Sin ventas registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
