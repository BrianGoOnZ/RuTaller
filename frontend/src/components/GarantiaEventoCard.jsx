import { useState } from 'react';
import {
  actualizarGarantiaEvento,
  agregarItem,
  eliminarItem,
} from '../services/ordenes';
import { listProductos } from '../services/productos';
import SearchSelect from './SearchSelect';
import EstadoAutoGuardado from './EstadoAutoGuardado';
import useAutoSaveTexto from '../hooks/useAutoSaveTexto';
import { TrashIcon } from '../ui/icons';
import { inputClass, labelClass, btnPrimarySmall } from '../ui/styles';

export default function GarantiaEventoCard({ ordenId, evento, numero, onChange }) {
  const diagnosticoAuto = useAutoSaveTexto(
    (valor) => actualizarGarantiaEvento(ordenId, evento.id, { diagnostico: valor }).then(onChange),
    evento.diagnostico
  );

  const [tipoItem, setTipoItem] = useState('producto');
  const [productoSel, setProductoSel] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [descripcionLibre, setDescripcionLibre] = useState('');
  const [costoLibre, setCostoLibre] = useState('');
  const [errorItem, setErrorItem] = useState('');

  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().slice(0, 10));
  const [firmaClienteEntrega, setFirmaClienteEntrega] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState('');
  const [guardandoEntrega, setGuardandoEntrega] = useState(false);

  async function handleAgregarItem(e) {
    e.preventDefault();
    setErrorItem('');
    try {
      if (tipoItem === 'producto') {
        if (!productoSel) return;
        await agregarItem(ordenId, {
          tipo: 'producto',
          productoId: productoSel.id,
          cantidad: Number(cantidad),
          garantiaEventoId: evento.id,
        });
        setProductoSel(null);
      } else {
        if (!descripcionLibre || !costoLibre) return;
        await agregarItem(ordenId, {
          tipo: 'mano_obra',
          descripcion: descripcionLibre,
          costoUnitario: Number(costoLibre),
          cantidad: 1,
          garantiaEventoId: evento.id,
        });
        setDescripcionLibre('');
        setCostoLibre('');
      }
      setCantidad(1);
      onChange();
    } catch (err) {
      setErrorItem(err.response?.data?.message || 'No se pudo agregar el item');
    }
  }

  async function handleEliminarItem(itemId) {
    await eliminarItem(ordenId, itemId);
    onChange();
  }

  async function guardarEntrega() {
    setErrorEntrega('');
    if (!fechaEntrega) {
      setErrorEntrega('Captura la fecha de entrega');
      return;
    }
    setGuardandoEntrega(true);
    try {
      await actualizarGarantiaEvento(ordenId, evento.id, { fechaEntrega, firmaClienteEntrega });
      onChange();
    } catch (err) {
      setErrorEntrega(err.response?.data?.message || 'No se pudo marcar como entregada');
    } finally {
      setGuardandoEntrega(false);
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Garantia #{numero}</h3>
        <span className="text-xs text-slate-500">Reingreso: {evento.fechaReingreso}</span>
      </div>

      {/* Diagnostico */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label className={labelClass}>Diagnostico de esta visita</label>
          <EstadoAutoGuardado estado={diagnosticoAuto.estadoGuardado} />
        </div>
        <textarea
          className={`${inputClass} min-h-20`}
          placeholder="Que se encontro o se hizo de nuevo..."
          value={diagnosticoAuto.valor}
          onChange={(e) => diagnosticoAuto.onChange(e.target.value)}
        />
      </div>

      {/* Presupuesto de este reingreso */}
      <div>
        <p className={labelClass}>Presupuesto de esta garantia</p>
        {evento.OrdenServicioItems?.length > 0 && (
          <table className="mb-2 w-full text-sm">
            <tbody className="divide-y divide-amber-100">
              {evento.OrdenServicioItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-1.5 text-slate-700">{item.descripcion}</td>
                  <td className="py-1.5 text-slate-600">{item.cantidad}</td>
                  <td className="py-1.5 text-slate-600">${Number(item.importe).toFixed(2)}</td>
                  <td className="py-1.5 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleEliminarItem(item.id)}
                    >
                      <TrashIcon width={13} height={13} /> Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="mb-2 flex justify-between text-sm font-medium text-slate-700">
          <span>Subtotal + IVA de esta garantia</span>
          <span>${Number(evento.total).toFixed(2)}</span>
        </div>

        {!evento.fechaEntrega && (
          <form onSubmit={handleAgregarItem} className="space-y-2 rounded-lg bg-white p-3">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoItem('producto')}
                className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${tipoItem === 'producto' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Producto
              </button>
              <button
                type="button"
                onClick={() => setTipoItem('mano_obra')}
                className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${tipoItem === 'mano_obra' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Mano de obra / libre
              </button>
            </div>

            {tipoItem === 'producto' ? (
              <div className="grid grid-cols-[1fr_80px_auto] items-end gap-2">
                <div>
                  <label className={labelClass}>Producto</label>
                  {productoSel ? (
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-1.5 text-sm">
                      <span>{productoSel.nombre}</span>
                      <button type="button" className="text-xs text-slate-500 hover:text-slate-700" onClick={() => setProductoSel(null)}>
                        Cambiar
                      </button>
                    </div>
                  ) : (
                    <SearchSelect
                      placeholder="Buscar producto..."
                      onSearch={listProductos}
                      renderItem={(p) => (
                        <>
                          <p className="font-medium">{p.nombre}</p>
                          <p className="text-xs text-slate-500">
                            ${Number(p.precioVenta).toFixed(2)} · stock: {p.stock}
                          </p>
                        </>
                      )}
                      onSelect={setProductoSel}
                    />
                  )}
                </div>
                <div>
                  <label className={labelClass}>Cant.</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>
                <button type="submit" className={`${btnPrimarySmall} h-[38px]`}>
                  Agregar
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_120px_auto] items-end gap-2">
                <div>
                  <label className={labelClass}>Descripcion</label>
                  <input
                    className={inputClass}
                    placeholder="Ej. Cambio de regulador"
                    value={descripcionLibre}
                    onChange={(e) => setDescripcionLibre(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    value={costoLibre}
                    onChange={(e) => setCostoLibre(e.target.value)}
                  />
                </div>
                <button type="submit" className={`${btnPrimarySmall} h-[38px]`}>
                  Agregar
                </button>
              </div>
            )}
            {errorItem && <p className="text-sm text-red-600">{errorItem}</p>}
          </form>
        )}
      </div>

      {/* Entrega de este reingreso */}
      <div>
        <p className={labelClass}>Entrega</p>
        {evento.fechaEntrega ? (
          <p className="text-sm text-slate-600">
            Entregada el {evento.fechaEntrega}. Firma de conformidad:{' '}
            {evento.firmaClienteEntrega ? 'Si' : 'No'}.
          </p>
        ) : (
          <div className="space-y-2 rounded-lg bg-white p-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Fecha de entrega</label>
                <input
                  type="date"
                  className={inputClass}
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
              <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={firmaClienteEntrega}
                  onChange={(e) => setFirmaClienteEntrega(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Firmo de conformidad
              </label>
            </div>
            {errorEntrega && <p className="text-sm text-red-600">{errorEntrega}</p>}
            <button
              type="button"
              onClick={guardarEntrega}
              disabled={guardandoEntrega}
              className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-800 disabled:opacity-50"
            >
              {guardandoEntrega ? 'Guardando...' : 'Marcar como entregada'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
