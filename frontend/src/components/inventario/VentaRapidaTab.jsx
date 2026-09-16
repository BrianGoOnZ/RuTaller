import { useEffect, useState } from 'react';
import { listProductos } from '../../services/productos';
import { listVentas, createVenta } from '../../services/ventas';
import SearchSelect from '../SearchSelect';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';

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
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-700">Venta de mostrador</h2>
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
          <tbody>
            {carrito.map((i) => (
              <tr key={i.producto.id} className="border-t border-slate-100">
                <td className="py-2">{i.producto.nombre}</td>
                <td className="py-2 w-20">
                  <input
                    type="number"
                    min={1}
                    max={i.producto.stock}
                    className={inputClass}
                    value={i.cantidad}
                    onChange={(e) => actualizarCantidad(i.producto.id, Number(e.target.value))}
                  />
                </td>
                <td className="py-2 text-right">
                  ${(Number(i.producto.precioVenta) * i.cantidad).toFixed(2)}
                </td>
                <td className="py-2 text-right">
                  <button className="text-red-500 text-xs" onClick={() => quitar(i.producto.id)}>
                    Quitar
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

        <div className="flex justify-between font-semibold text-slate-800 border-t border-slate-200 pt-3">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

        <button
          onClick={cobrar}
          disabled={carrito.length === 0}
          className="w-full bg-green-700 text-white rounded-md py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-50"
        >
          Cobrar
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-5">
        <h2 className="font-semibold text-slate-700 mb-3">Ventas recientes</h2>
        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left">
            <tr>
              <th className="py-1">Fecha</th>
              <th className="py-1">Productos</th>
              <th className="py-1">Total</th>
            </tr>
          </thead>
          <tbody>
            {ventas.slice(0, 10).map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="py-2">{v.fecha}</td>
                <td className="py-2">{v.VentaItems?.length} producto(s)</td>
                <td className="py-2">${Number(v.total).toFixed(2)}</td>
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
