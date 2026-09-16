import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes, createCliente } from '../services/clientes';
import { listMotos, createMoto, TIPOS_MOTO } from '../services/motos';
import { createOrden, subirFoto, CHECKLIST_ITEMS } from '../services/ordenes';
import SearchSelect from '../components/SearchSelect';
import NivelSlider from '../components/NivelSlider';

const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

const btnGhost =
  'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100';
const btnPrimarySmall =
  'rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800';

function Seccion({ numero, titulo, children }) {
  return (
    <section className="space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {numero}
        </span>
        <h2 className="text-base font-semibold text-slate-800">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}
function horaActual() {
  return new Date().toTimeString().slice(0, 5);
}

export default function Recepcion() {
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [clienteNuevo, setClienteNuevo] = useState(null);
  const [clienteForm, setClienteForm] = useState({ nombre: '', direccion: '', cp: '', telefono: '' });

  const [moto, setMoto] = useState(null);
  const [motoNueva, setMotoNueva] = useState(null);
  const [motos, setMotos] = useState([]);
  const [motoForm, setMotoForm] = useState({ marca: '', modelo: '', tipo: '', placas: '', noSerie: '' });

  const [fechaIngreso, setFechaIngreso] = useState(hoyISO());
  const [horaIngreso, setHoraIngreso] = useState(horaActual());
  const [fechaEntregaEstimada, setFechaEntregaEstimada] = useState('');
  const [kilometraje, setKilometraje] = useState('');

  const [checklist, setChecklist] = useState(
    CHECKLIST_ITEMS.map((nombre) => ({ nombre, estado: null, nota: '' }))
  );
  const [nivelGasolina, setNivelGasolina] = useState('1/2');
  const [nivelAceite, setNivelAceite] = useState('1/2');
  const [trabajoSolicitado, setTrabajoSolicitado] = useState('');

  const [firmaClienteRecepcion, setFirmaClienteRecepcion] = useState(false);
  const [fotos, setFotos] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function seleccionarCliente(c) {
    setCliente(c);
    setClienteNuevo(null);
    setMoto(null);
    setMotoNueva(null);
    const data = await listMotos(c.id);
    setMotos(data);
  }

  function confirmarClienteNuevo() {
    if (!clienteForm.nombre) return;
    setClienteNuevo(clienteForm);
    setCliente(null);
    setMoto(null);
    setMotoNueva(null);
    setMotos([]);
  }

  function actualizarChecklist(nombre, campo, valor) {
    setChecklist((prev) =>
      prev.map((item) => (item.nombre === nombre ? { ...item, [campo]: valor } : item))
    );
  }

  function handleFotos(e) {
    setFotos(Array.from(e.target.files || []));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!cliente && !clienteNuevo) {
      setError('Selecciona o registra un cliente');
      return;
    }
    if (!moto && !motoNueva) {
      setError('Selecciona o registra una moto');
      return;
    }

    setGuardando(true);
    try {
      let clienteId = cliente?.id;
      if (!clienteId) {
        const creado = await createCliente(clienteNuevo);
        clienteId = creado.id;
      }

      let motoId = moto?.id;
      if (!motoId) {
        const creada = await createMoto({ ...motoNueva, clienteId });
        motoId = creada.id;
      }

      const orden = await createOrden({
        motoId,
        fechaIngreso,
        horaIngreso,
        fechaEntregaEstimada: fechaEntregaEstimada || null,
        kilometraje: kilometraje || null,
        nivelGasolina,
        nivelAceite,
        trabajoSolicitado,
        firmaClienteRecepcion,
        checklist,
      });

      for (const foto of fotos) {
        await subirFoto(orden.id, foto);
      }

      navigate(`/servicios/${orden.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la recepcion');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Recepcion</h1>
        <p className="text-slate-500">Registra el ingreso de una moto al taller.</p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Cliente */}
      <Seccion numero={1} titulo="Cliente">
        {cliente || clienteNuevo ? (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <div>
              <p className="font-medium text-slate-800">{(cliente || clienteNuevo).nombre}</p>
              <p className="text-sm text-slate-500">{(cliente || clienteNuevo).telefono}</p>
            </div>
            <button
              type="button"
              className={btnGhost}
              onClick={() => {
                setCliente(null);
                setClienteNuevo(null);
                setMoto(null);
                setMotoNueva(null);
                setMotos([]);
              }}
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <SearchSelect
              placeholder="Buscar cliente por nombre o telefono..."
              onSearch={listClientes}
              renderItem={(c) => (
                <>
                  <p className="font-medium">{c.nombre}</p>
                  <p className="text-xs text-slate-500">{c.telefono}</p>
                </>
              )}
              onSelect={seleccionarCliente}
            />
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              O registra uno nuevo
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputClass}
                placeholder="Nombre (razon social)"
                value={clienteForm.nombre}
                onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Telefono"
                value={clienteForm.telefono}
                onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="Direccion"
                value={clienteForm.direccion}
                onChange={(e) => setClienteForm({ ...clienteForm, direccion: e.target.value })}
              />
              <input
                className={inputClass}
                placeholder="C.P."
                value={clienteForm.cp}
                onChange={(e) => setClienteForm({ ...clienteForm, cp: e.target.value })}
              />
            </div>
            <button type="button" onClick={confirmarClienteNuevo} className={btnPrimarySmall}>
              Usar este cliente nuevo
            </button>
          </div>
        )}
      </Seccion>

      {/* Moto */}
      {(cliente || clienteNuevo) && (
        <Seccion numero={2} titulo="Moto">
          {moto || motoNueva ? (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <div>
                <p className="font-medium text-slate-800">
                  {(moto || motoNueva).marca} {(moto || motoNueva).modelo}
                </p>
                <p className="text-sm text-slate-500">Placas: {(moto || motoNueva).placas || 'N/A'}</p>
              </div>
              <button
                type="button"
                className={btnGhost}
                onClick={() => {
                  setMoto(null);
                  setMotoNueva(null);
                }}
              >
                Cambiar
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {motos.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Motos de este cliente
                  </p>
                  {motos.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMoto(m)}
                      className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      {m.marca} {m.modelo} - Placas: {m.placas || 'N/A'}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                O registra una moto nueva
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass}
                  placeholder="Marca"
                  value={motoForm.marca}
                  onChange={(e) => setMotoForm({ ...motoForm, marca: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="Modelo"
                  value={motoForm.modelo}
                  onChange={(e) => setMotoForm({ ...motoForm, modelo: e.target.value })}
                />
                <select
                  className={inputClass}
                  value={motoForm.tipo}
                  onChange={(e) => setMotoForm({ ...motoForm, tipo: e.target.value })}
                >
                  <option value="">Tipo...</option>
                  {TIPOS_MOTO.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  placeholder="Placas"
                  value={motoForm.placas}
                  onChange={(e) => setMotoForm({ ...motoForm, placas: e.target.value })}
                />
                <input
                  className={inputClass}
                  placeholder="No. de serie"
                  value={motoForm.noSerie}
                  onChange={(e) => setMotoForm({ ...motoForm, noSerie: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!motoForm.marca || !motoForm.modelo) return;
                  setMotoNueva(motoForm);
                }}
                className={btnPrimarySmall}
              >
                Usar esta moto nueva
              </button>
            </div>
          )}
        </Seccion>
      )}

      {/* Datos de ingreso */}
      <Seccion numero={3} titulo="Datos de ingreso">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <label className={labelClass}>Fecha de ingreso</label>
            <input
              type="date"
              className={inputClass}
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <input
              type="time"
              className={inputClass}
              value={horaIngreso}
              onChange={(e) => setHoraIngreso(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Fecha estimada de entrega</label>
            <input
              type="date"
              className={inputClass}
              value={fechaEntregaEstimada}
              onChange={(e) => setFechaEntregaEstimada(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Kilometraje</label>
            <input
              type="number"
              className={inputClass}
              value={kilometraje}
              onChange={(e) => setKilometraje(e.target.value)}
            />
          </div>
        </div>
      </Seccion>

      {/* Checklist */}
      <Seccion numero={4} titulo="Inventario / checklist de ingreso">
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {checklist.map((item) => (
            <div key={item.nombre} className="border-b border-slate-100 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.nombre}</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => actualizarChecklist(item.nombre, 'estado', 'bien')}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.estado === 'bien'
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Bien
                  </button>
                  <button
                    type="button"
                    onClick={() => actualizarChecklist(item.nombre, 'estado', 'detalle')}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                      item.estado === 'detalle'
                        ? 'border-amber-600 bg-amber-600 text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Detalle
                  </button>
                </div>
              </div>
              {item.estado === 'detalle' && (
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Describe el detalle..."
                  value={item.nota}
                  onChange={(e) => actualizarChecklist(item.nombre, 'nota', e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </Seccion>

      {/* Niveles */}
      <Seccion numero={5} titulo="Niveles">
        <div className="grid gap-6 sm:grid-cols-2">
          <NivelSlider label="Gasolina" value={nivelGasolina} onChange={setNivelGasolina} />
          <NivelSlider label="Aceite" value={nivelAceite} onChange={setNivelAceite} />
        </div>
      </Seccion>

      {/* Trabajo solicitado */}
      <Seccion numero={6} titulo="Trabajo solicitado">
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Que reporta el cliente..."
          value={trabajoSolicitado}
          onChange={(e) => setTrabajoSolicitado(e.target.value)}
        />
      </Seccion>

      {/* Fotos */}
      <Seccion numero={7} titulo="Fotos de la moto">
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 px-4 py-6 text-center transition-colors hover:border-slate-300 hover:bg-slate-50">
          <span className="text-sm font-medium text-slate-600">Haz clic para elegir fotos</span>
          <span className="text-xs text-slate-400">Puedes seleccionar varias imagenes</span>
          <input type="file" accept="image/*" multiple onChange={handleFotos} className="hidden" />
        </label>
        {fotos.length > 0 && (
          <p className="text-sm text-slate-500">{fotos.length} foto(s) seleccionada(s)</p>
        )}
      </Seccion>

      {/* Firma */}
      <Seccion numero={8} titulo="Firma">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={firmaClienteRecepcion}
            onChange={(e) => setFirmaClienteRecepcion(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300"
          />
          El cliente firmo la hoja fisica de recepcion
        </label>
      </Seccion>

      <button
        type="submit"
        disabled={guardando}
        className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50"
      >
        {guardando ? 'Guardando...' : 'Guardar recepcion'}
      </button>
    </form>
  );
}
