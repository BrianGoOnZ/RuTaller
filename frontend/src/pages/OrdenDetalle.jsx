import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getOrden,
  updateOrden,
  deleteOrden,
  agregarItem,
  eliminarItem,
  subirFoto,
  eliminarFoto,
  crearGarantiaEvento,
  ESTADOS_ORDEN,
} from '../services/ordenes';
import { listProductos, createProducto } from '../services/productos';
import SearchSelect from '../components/SearchSelect';
import EstadoAutoGuardado from '../components/EstadoAutoGuardado';
import GarantiaEventoCard from '../components/GarantiaEventoCard';
import useAutoSaveTexto from '../hooks/useAutoSaveTexto';
import { TrashIcon, UploadIcon, PlusIcon } from '../ui/icons';
import {
  inputClass,
  labelClass,
  cardClass,
  btnPrimary,
  btnPrimarySmall,
  btnGhost,
  btnDanger,
  badgePill,
} from '../ui/styles';

export default function OrdenDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);

  const diagnosticoAuto = useAutoSaveTexto(
    (valor) => updateOrden(id, { diagnostico: valor }).then(() => cargar()),
    orden?.diagnostico
  );

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
    setFechaEntregaReal(data.fechaEntregaReal || new Date().toISOString().slice(0, 10));
    setFirmaClienteEntrega(data.firmaClienteEntrega);
  }

  useEffect(() => {
    cargar();
  }, [id]);

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

  async function handleEliminarOrden() {
    if (!confirm(`Eliminar por completo la orden #${orden.id}? Esto no se puede deshacer.`)) return;
    await deleteOrden(id);
    navigate('/servicios');
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

  async function handleAbrirGarantia() {
    await crearGarantiaEvento(id, {});
    cargar();
  }

  if (!orden) return <p className="text-slate-500">Cargando...</p>;

  const garantiaAbierta = orden.GarantiaEventos?.some((g) => !g.fechaEntrega);
  const puedeAbrirGarantia = !!orden.fechaEntregaReal && !garantiaAbierta;

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <div>
        <Link to="/servicios" className="text-sm text-slate-500 hover:text-slate-700">
          &larr; Servicios
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Orden #{orden.id} - {orden.Moto?.marca} {orden.Moto?.modelo}
            </h1>
            <p className="text-sm text-slate-500">
              {orden.Moto?.Cliente?.nombre} · Placas: {orden.Moto?.placas || 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {orden.estado === 'garantia' ? (
              <span className={`${badgePill} bg-amber-100 text-amber-800 w-56 text-center`}>
                Reabierta por garantia
              </span>
            ) : (
              <select
                className={`${inputClass} w-56`}
                value={orden.estado}
                onChange={(e) => cambiarEstado(e.target.value)}
              >
                {ESTADOS_ORDEN.filter((es) => es.value !== 'garantia').map((es) => (
                  <option key={es.value} value={es.value}>
                    {es.label}
                  </option>
                ))}
              </select>
            )}
            <button onClick={handleEliminarOrden} className={`${btnDanger} inline-flex items-center gap-1.5`}>
              <TrashIcon /> Eliminar
            </button>
          </div>
        </div>
        {orden.GarantiaEventos?.length > 0 && (
          <p className="mt-2 text-sm text-amber-700">
            {orden.GarantiaEventos.length} reingreso(s) por garantia registrado(s) (ver abajo)
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Datos de ingreso */}
        <section className={`${cardClass} space-y-4`}>
          <h2 className="font-semibold text-slate-800">Datos de ingreso</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Fecha</p>
              <p className="text-slate-700">{orden.fechaIngreso}</p>
            </div>
            <div>
              <p className="text-slate-400">Hora</p>
              <p className="text-slate-700">{orden.horaIngreso || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Entrega estimada</p>
              <p className="text-slate-700">{orden.fechaEntregaEstimada || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Kilometraje</p>
              <p className="text-slate-700">{orden.kilometraje || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Nivel gasolina</p>
              <p className="text-slate-700">{orden.nivelGasolina || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Nivel aceite</p>
              <p className="text-slate-700">{orden.nivelAceite || '-'}</p>
            </div>
            <div>
              <p className="text-slate-400">Firma de recepcion</p>
              <p className="text-slate-700">{orden.firmaClienteRecepcion ? 'Si' : 'No'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-slate-400">Trabajo solicitado</p>
            <p className="text-sm text-slate-700">{orden.trabajoSolicitado || '-'}</p>
          </div>
        </section>

        {/* Fotos */}
        <section className={`${cardClass} space-y-4`}>
          <h2 className="font-semibold text-slate-800">Fotos</h2>
          <div className="flex flex-wrap gap-3">
            {orden.OrdenServicioFotos?.map((foto) => (
              <div key={foto.id} className="relative">
                <img
                  src={`http://localhost:4000/uploads/${foto.path}`}
                  alt="Foto de la moto"
                  className="h-28 w-28 rounded-lg object-cover ring-1 ring-slate-100"
                />
                <button
                  type="button"
                  onClick={() => handleEliminarFoto(foto.id)}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white shadow-sm transition-colors hover:bg-red-700"
                  aria-label="Eliminar foto"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <label className={`${btnGhost} inline-flex cursor-pointer items-center gap-1.5`}>
            <UploadIcon width={14} height={14} /> Agregar foto
            <input type="file" accept="image/*" onChange={handleFoto} className="hidden" />
          </label>
        </section>

        {/* Checklist */}
        <section className={`${cardClass} space-y-4 lg:col-span-2`}>
          <h2 className="font-semibold text-slate-800">Inventario / checklist de ingreso</h2>
          <div className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
            {orden.OrdenServicioChecklistItems?.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-slate-100 py-1.5">
                <span className="text-slate-600">{item.nombre}</span>
                {item.estado === 'bien' && <span className={`${badgePill} bg-green-100 text-green-700`}>Bien</span>}
                {item.estado === 'detalle' && (
                  <span className={`${badgePill} bg-amber-100 text-amber-700`}>{item.nota || 'Detalle'}</span>
                )}
                {!item.estado && <span className="text-slate-300">-</span>}
              </div>
            ))}
          </div>
        </section>

        {/* Diagnostico */}
        <section className={`${cardClass} space-y-4`}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Diagnostico</h2>
            <EstadoAutoGuardado estado={diagnosticoAuto.estadoGuardado} />
          </div>
          <textarea
            className={`${inputClass} min-h-24`}
            placeholder="Que encontro el mecanico al revisar la moto..."
            value={diagnosticoAuto.valor}
            onChange={(e) => diagnosticoAuto.onChange(e.target.value)}
          />
          <p className="text-xs text-slate-400">Se guarda solo mientras escribes.</p>
        </section>

        {/* Entrega */}
        <section className={`${cardClass} space-y-4`}>
          <h2 className="font-semibold text-slate-800">Entrega</h2>
          {orden.fechaEntregaReal ? (
            <p className="text-sm text-slate-600">
              Entregada el {orden.fechaEntregaReal}. Firma de conformidad:{' '}
              {orden.firmaClienteEntrega ? 'Si' : 'No'}.
            </p>
          ) : (
            <>
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
                <label className="mt-6 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={firmaClienteEntrega}
                    onChange={(e) => setFirmaClienteEntrega(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  El cliente firmo de conformidad al recibir su moto
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
            </>
          )}
        </section>

        {/* Presupuesto */}
        <section className={`${cardClass} space-y-4 lg:col-span-2`}>
          <h2 className="font-semibold text-slate-800">Presupuesto</h2>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="py-1.5">Descripcion</th>
                <th className="py-1.5">Cant.</th>
                <th className="py-1.5">Costo unit.</th>
                <th className="py-1.5">Importe</th>
                <th className="py-1.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orden.OrdenServicioItems?.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 text-slate-700">
                    {item.descripcion}
                    {item.tipo === 'producto' && <span className="text-xs text-slate-400"> (producto)</span>}
                  </td>
                  <td className="py-2 text-slate-600">{item.cantidad}</td>
                  <td className="py-2 text-slate-600">${Number(item.costoUnitario).toFixed(2)}</td>
                  <td className="py-2 text-slate-600">${Number(item.importe).toFixed(2)}</td>
                  <td className="py-2 text-right">
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

          <div className="flex justify-end">
            <div className="w-48 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-700">${Number(orden.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">IVA</span>
                <span className="text-slate-700">${Number(orden.ivaMonto).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total</span>
                <span>${Number(orden.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleAgregarItem} className="space-y-4 border-t border-slate-100 pt-4">
            <div>
              <label className={labelClass}>Tipo de linea</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTipoItem('producto')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tipoItem === 'producto' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  Producto de inventario
                </button>
                <button
                  type="button"
                  onClick={() => setTipoItem('mano_obra')}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${tipoItem === 'mano_obra' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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
                    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span>
                        {productoSel.nombre} · ${Number(productoSel.precioVenta).toFixed(2)} c/u (stock: {productoSel.stock})
                      </span>
                      <button type="button" className={btnGhost} onClick={() => setProductoSel(null)}>
                        Cambiar
                      </button>
                    </div>
                  ) : productoNuevoOpen ? (
                    <div className="space-y-2 rounded-lg bg-slate-50 p-3">
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
                        <button type="button" onClick={handleCrearProductoRapido} className={btnPrimarySmall}>
                          Guardar y usar
                        </button>
                        <button type="button" onClick={() => setProductoNuevoOpen(false)} className={btnGhost}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
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
                        onClick={() => setProductoNuevoOpen(true)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      >
                        <PlusIcon width={13} height={13} /> No existe, registrar producto nuevo
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-[100px_1fr_auto] items-end gap-3">
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
                  <button type="submit" className={`${btnPrimary} h-[38px]`}>
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
                <div className="grid grid-cols-[160px_auto] items-end gap-3">
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
                  <button type="submit" className={`${btnPrimary} h-[38px]`}>
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

        {/* Garantias */}
        {orden.fechaEntregaReal && (
          <section className={`${cardClass} space-y-4 lg:col-span-2`}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Garantias de esta orden</h2>
              {puedeAbrirGarantia && (
                <button
                  type="button"
                  onClick={handleAbrirGarantia}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-700"
                >
                  <PlusIcon width={15} height={15} /> El cliente regreso por garantia
                </button>
              )}
            </div>

            {orden.GarantiaEventos?.length > 0 ? (
              <>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="mb-1 text-xs text-slate-400">Diagnostico original (primera visita):</p>
                  <p className="text-sm text-slate-600">{orden.diagnostico || 'Sin diagnostico registrado.'}</p>
                </div>
                <div className="space-y-4">
                  {orden.GarantiaEventos.map((evento, idx) => (
                    <GarantiaEventoCard
                      key={evento.id}
                      ordenId={id}
                      evento={evento}
                      numero={idx + 1}
                      onChange={cargar}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Esta moto no ha regresado por garantia.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
