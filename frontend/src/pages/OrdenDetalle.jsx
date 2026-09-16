import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getOrden,
  updateOrden,
  agregarItem,
  eliminarItem,
  subirFoto,
  eliminarFoto,
  ESTADOS_ORDEN,
} from '../services/ordenes';
import { listProductos, createProducto } from '../services/productos';
import SearchSelect from '../components/SearchSelect';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
const cardClass = 'bg-white rounded-lg shadow-sm p-5 space-y-4';

export default function OrdenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [guardandoDiagnostico, setGuardandoDiagnostico] = useState(false);

  const [tipoItem, setTipoItem] = useState('producto');
  const [productoSel, setProductoSel] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [descripcionLibre, setDescripcionLibre] = useState('');
  const [costoLibre, setCostoLibre] = useState('');
  const [errorItem, setErrorItem] = useState('');

  const [productoNuevoOpen, setProductoNuevoOpen] = useState(false);
  const [productoNuevo, setProductoNuevo] = useState({ nombre: '', precioCompra: '', precioVenta: '', stock: 1 });

  const [fechaEntregaReal, setFechaEntregaReal] = useState('');
  const [firmaClienteEntrega, setFirmaClienteEntrega] = useState(false);
  const [errorEntrega, setErrorEntrega] = useState('');
  const [guardandoEntrega, setGuardandoEntrega] = useState(false);

  async function cargar() {
    const data = await getOrden(id);
    setOrden(data);
    setDiagnostico(data.diagnostico || '');
    setFechaEntregaReal(data.fechaEntregaReal || new Date().toISOString().slice(0, 10));
    setFirmaClienteEntrega(data.firmaClienteEntrega);
  }

  useEffect(() => {
    cargar();
  }, [id]);

  async function guardarDiagnostico() {
    setGuardandoDiagnostico(true);
    await updateOrden(id, { diagnostico });
    await cargar();
    setGuardandoDiagnostico(false);
  }

  async function cambiarEstado(nuevoEstado) {
    await updateOrden(id, { estado: nuevoEstado });
    cargar();
  }

  async function handleAgregarItem(e) {
    e.preventDefault();
    setErrorItem('');
    try {
      if (tipoItem === 'producto') {
        if (!productoSel) return;
        await agregarItem(id, { tipo: 'producto', productoId: productoSel.id, cantidad: Number(cantidad) });
        setProductoSel(null);
      } else {
        if (!descripcionLibre || !costoLibre) return;
        await agregarItem(id, {
          tipo: 'mano_obra',
          descripcion: descripcionLibre,
          costoUnitario: Number(costoLibre),
          cantidad: 1,
        });
        setDescripcionLibre('');
        setCostoLibre('');
      }
      setCantidad(1);
      cargar();
    } catch (err) {
      setErrorItem(err.response?.data?.message || 'No se pudo agregar el item');
    }
  }

  async function handleCrearProductoRapido() {
    if (!productoNuevo.nombre || !productoNuevo.precioVenta) return;
    const creado = await createProducto(productoNuevo);
    setProductoSel(creado);
    setProductoNuevoOpen(false);
    setProductoNuevo({ nombre: '', precioCompra: '', precioVenta: '', stock: 1 });
  }

  async function handleEliminarItem(itemId) {
    await eliminarItem(id, itemId);
    cargar();
  }

  async function handleFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    await subirFoto(id, file);
    cargar();
  }

  async function handleEliminarFoto(fotoId) {
    await eliminarFoto(id, fotoId);
    cargar();
  }

  async function guardarEntrega() {
    setErrorEntrega('');
    if (!fechaEntregaReal) {
      setErrorEntrega('Captura la fecha de entrega real');
      return;
    }
    setGuardandoEntrega(true);
    try {
      await updateOrden(id, {
        fechaEntregaReal,
        firmaClienteEntrega,
        estado: 'entregada',
      });
      await cargar();
    } catch (err) {
      setErrorEntrega(err.response?.data?.message || 'No se pudo marcar como entregada');
    } finally {
      setGuardandoEntrega(false);
    }
  }

  if (!orden) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <Link to="/servicios" className="text-sm text-slate-500 hover:underline">
          &larr; Servicios
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Orden #{orden.id} - {orden.Moto?.marca} {orden.Moto?.modelo}
            </h1>
            <p className="text-slate-500 text-sm">
              {orden.Moto?.Cliente?.nombre} · Placas: {orden.Moto?.placas || 'N/A'}
            </p>
          </div>
          <select
            className={`${inputClass} w-56`}
            value={orden.estado}
            onChange={(e) => cambiarEstado(e.target.value)}
          >
            {ESTADOS_ORDEN.map((es) => (
              <option key={es.value} value={es.value}>
                {es.label}
              </option>
            ))}
          </select>
        </div>
        {orden.enGarantia && orden.ordenGarantiaOriginal && (
          <p className="text-sm text-amber-700 mt-2">
            Entra por garantia, relacionada con la orden{' '}
            <Link className="underline" to={`/servicios/${orden.ordenGarantiaOriginal.id}`}>
              #{orden.ordenGarantiaOriginal.id}
            </Link>
          </p>
        )}
      </div>

      {/* Datos de ingreso */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Datos de ingreso</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Fecha</p>
            <p>{orden.fechaIngreso}</p>
          </div>
          <div>
            <p className="text-slate-400">Hora</p>
            <p>{orden.horaIngreso || '-'}</p>
          </div>
          <div>
            <p className="text-slate-400">Entrega estimada</p>
            <p>{orden.fechaEntregaEstimada || '-'}</p>
          </div>
          <div>
            <p className="text-slate-400">Kilometraje</p>
            <p>{orden.kilometraje || '-'}</p>
          </div>
          <div>
            <p className="text-slate-400">Nivel gasolina</p>
            <p>{orden.nivelGasolina || '-'}</p>
          </div>
          <div>
            <p className="text-slate-400">Nivel aceite</p>
            <p>{orden.nivelAceite || '-'}</p>
          </div>
          <div>
            <p className="text-slate-400">Firma de recepcion</p>
            <p>{orden.firmaClienteRecepcion ? 'Si' : 'No'}</p>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Trabajo solicitado</p>
          <p className="text-sm">{orden.trabajoSolicitado || '-'}</p>
        </div>
      </section>

      {/* Checklist */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Inventario / checklist de ingreso</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {orden.OrdenServicioChecklistItems?.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b border-slate-100 py-1">
              <span className="text-slate-600">{item.nombre}</span>
              <span
                className={
                  item.estado === 'bien'
                    ? 'text-green-600'
                    : item.estado === 'detalle'
                      ? 'text-amber-600'
                      : 'text-slate-300'
                }
              >
                {item.estado === 'bien' ? 'Bien' : item.estado === 'detalle' ? item.nota || 'Detalle' : '-'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Fotos */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Fotos</h2>
        <div className="flex flex-wrap gap-3">
          {orden.OrdenServicioFotos?.map((foto) => (
            <div key={foto.id} className="relative">
              <img
                src={`http://localhost:4000/uploads/${foto.path}`}
                alt="Foto de la moto"
                className="w-28 h-28 object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleEliminarFoto(foto.id)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/*" onChange={handleFoto} />
      </section>

      {/* Diagnostico */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Diagnostico</h2>
        <textarea
          className={`${inputClass} min-h-24`}
          value={diagnostico}
          onChange={(e) => setDiagnostico(e.target.value)}
        />
        <button
          type="button"
          onClick={guardarDiagnostico}
          disabled={guardandoDiagnostico}
          className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          {guardandoDiagnostico ? 'Guardando...' : 'Guardar diagnostico'}
        </button>
      </section>

      {/* Presupuesto */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Presupuesto</h2>

        <table className="w-full text-sm">
          <thead className="text-slate-500 text-left">
            <tr>
              <th className="py-1">Descripcion</th>
              <th className="py-1">Cant.</th>
              <th className="py-1">Costo unit.</th>
              <th className="py-1">Importe</th>
              <th className="py-1"></th>
            </tr>
          </thead>
          <tbody>
            {orden.OrdenServicioItems?.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="py-2">
                  {item.descripcion}
                  {item.tipo === 'producto' && (
                    <span className="text-xs text-slate-400"> (producto)</span>
                  )}
                </td>
                <td className="py-2">{item.cantidad}</td>
                <td className="py-2">${Number(item.costoUnitario).toFixed(2)}</td>
                <td className="py-2">${Number(item.importe).toFixed(2)}</td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700 text-xs"
                    onClick={() => handleEliminarItem(item.id)}
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end text-sm space-y-1">
          <div className="w-48 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span>${Number(orden.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">IVA</span>
              <span>${Number(orden.ivaMonto).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${Number(orden.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleAgregarItem} className="border-t border-slate-200 pt-4 space-y-4">
          <div>
            <label className={labelClass}>Tipo de linea</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTipoItem('producto')}
                className={`px-3 py-1.5 text-xs rounded-md border ${tipoItem === 'producto' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600'}`}
              >
                Producto de inventario
              </button>
              <button
                type="button"
                onClick={() => setTipoItem('mano_obra')}
                className={`px-3 py-1.5 text-xs rounded-md border ${tipoItem === 'mano_obra' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600'}`}
              >
                Mano de obra / libre
              </button>
            </div>
          </div>

          {tipoItem === 'producto' ? (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Producto</label>
                {productoSel ? (
                  <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2 text-sm">
                    <span>
                      {productoSel.nombre} · ${Number(productoSel.precioVenta).toFixed(2)} c/u (stock: {productoSel.stock})
                    </span>
                    <button type="button" className="text-slate-500" onClick={() => setProductoSel(null)}>
                      Cambiar
                    </button>
                  </div>
                ) : productoNuevoOpen ? (
                  <div className="space-y-2 bg-slate-50 rounded-md p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>Nombre del producto</label>
                        <input
                          className={inputClass}
                          value={productoNuevo.nombre}
                          onChange={(e) => setProductoNuevo({ ...productoNuevo, nombre: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Precio de compra ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={productoNuevo.precioCompra}
                          onChange={(e) => setProductoNuevo({ ...productoNuevo, precioCompra: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Precio de venta ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          className={inputClass}
                          value={productoNuevo.precioVenta}
                          onChange={(e) => setProductoNuevo({ ...productoNuevo, precioVenta: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Stock inicial</label>
                        <input
                          type="number"
                          className={inputClass}
                          value={productoNuevo.stock}
                          onChange={(e) => setProductoNuevo({ ...productoNuevo, stock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleCrearProductoRapido}
                        className="bg-slate-900 text-white rounded-md px-3 py-1.5 text-xs font-medium"
                      >
                        Guardar y usar
                      </button>
                      <button
                        type="button"
                        onClick={() => setProductoNuevoOpen(false)}
                        className="text-xs text-slate-500"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <SearchSelect
                      placeholder="Escribe el nombre del producto..."
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
                    <button
                      type="button"
                      className="text-xs text-slate-500 hover:underline"
                      onClick={() => setProductoNuevoOpen(true)}
                    >
                      No existe, registrar producto nuevo
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-[100px_1fr_auto] gap-3 items-end">
                <div>
                  <label className={labelClass}>Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Importe de esta linea</label>
                  <p className={`${inputClass} bg-slate-50 text-slate-500`}>
                    {productoSel
                      ? `$${(Number(productoSel.precioVenta) * Number(cantidad || 0)).toFixed(2)}`
                      : 'Selecciona un producto...'}
                  </p>
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 h-[38px]"
                >
                  Agregar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Descripcion del trabajo o servicio</label>
                <input
                  className={inputClass}
                  placeholder="Ej. Mano de obra - diagnostico electrico"
                  value={descripcionLibre}
                  onChange={(e) => setDescripcionLibre(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[160px_auto] gap-3 items-end">
                <div>
                  <label className={labelClass}>Costo ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={inputClass}
                    placeholder="0.00"
                    value={costoLibre}
                    onChange={(e) => setCostoLibre(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-800 h-[38px]"
                >
                  Agregar
                </button>
              </div>
              <p className="text-xs text-slate-400">
                ¿Otro servicio o pieza adicional? Agrega otra linea aparte, cada una con su propio costo.
              </p>
            </div>
          )}
          {errorItem && <p className="text-sm text-red-600">{errorItem}</p>}
        </form>
      </section>

      {/* Entrega */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Entrega</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fecha de entrega real</label>
            <input
              type="date"
              className={inputClass}
              value={fechaEntregaReal}
              onChange={(e) => setFechaEntregaReal(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 mt-6 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={firmaClienteEntrega}
              onChange={(e) => setFirmaClienteEntrega(e.target.checked)}
            />
            El cliente firmo de conformidad al recibir su moto
          </label>
        </div>
        {errorEntrega && <p className="text-sm text-red-600">{errorEntrega}</p>}
        <button
          type="button"
          onClick={guardarEntrega}
          disabled={guardandoEntrega}
          className="bg-green-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-green-800 disabled:opacity-50"
        >
          {guardandoEntrega ? 'Guardando...' : 'Marcar como entregada'}
        </button>
        {orden.estado === 'entregada' && (
          <p className="text-sm text-green-700">Esta orden ya fue marcada como entregada.</p>
        )}
      </section>
    </div>
  );
}
