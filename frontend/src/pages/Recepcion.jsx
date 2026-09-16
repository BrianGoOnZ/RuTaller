import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listClientes, createCliente } from '../services/clientes';
import { listMotos, createMoto, TIPOS_MOTO } from '../services/motos';
import { createOrden, subirFoto, CHECKLIST_ITEMS } from '../services/ordenes';
import SearchSelect from '../components/SearchSelect';
import NivelSlider from '../components/NivelSlider';

const inputClass = 'w-full border border-slate-300 rounded-md px-3 py-2 text-sm';
const labelClass = 'block text-sm font-medium text-slate-700 mb-1';
const cardClass = 'bg-white rounded-lg shadow-sm p-5 space-y-4';

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

      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Si una moto ya entregada regresa por el mismo problema (garantia), no registres una
        recepcion nueva aqui: ve a <span className="font-medium">Servicios</span>, abre esa orden y
        cambia su estado a "Reabierta por garantia".
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Cliente */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Cliente</h2>
        {cliente || clienteNuevo ? (
          <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
            <div>
              <p className="font-medium text-slate-800">{(cliente || clienteNuevo).nombre}</p>
              <p className="text-sm text-slate-500">{(cliente || clienteNuevo).telefono}</p>
            </div>
            <button
              type="button"
              className="text-sm text-slate-500 hover:underline"
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
            <p className="text-xs text-slate-400">O registra uno nuevo:</p>
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
            <button
              type="button"
              onClick={confirmarClienteNuevo}
              className="text-sm font-medium text-slate-700 hover:underline"
            >
              Usar este cliente nuevo
            </button>
          </div>
        )}
      </section>

      {/* Moto */}
      {(cliente || clienteNuevo) && (
        <section className={cardClass}>
          <h2 className="font-semibold text-slate-700">Moto</h2>
          {moto || motoNueva ? (
            <div className="flex items-center justify-between bg-slate-50 rounded-md px-3 py-2">
              <div>
                <p className="font-medium text-slate-800">
                  {(moto || motoNueva).marca} {(moto || motoNueva).modelo}
                </p>
                <p className="text-sm text-slate-500">Placas: {(moto || motoNueva).placas || 'N/A'}</p>
              </div>
              <button
                type="button"
                className="text-sm text-slate-500 hover:underline"
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
                <div className="space-y-1">
                  <p className="text-xs text-slate-400">Motos de este cliente:</p>
                  {motos.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMoto(m)}
                      className="block w-full text-left border border-slate-200 rounded-md px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      {m.marca} {m.modelo} - Placas: {m.placas || 'N/A'}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400">O registra una moto nueva:</p>
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
                className="text-sm font-medium text-slate-700 hover:underline"
              >
                Usar esta moto nueva
              </button>
            </div>
          )}
        </section>
      )}

      {/* Datos de ingreso */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Datos de ingreso</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      </section>

      {/* Checklist */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Inventario / checklist de ingreso</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
          {checklist.map((item) => (
            <div key={item.nombre} className="border-b border-slate-100 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700">{item.nombre}</span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => actualizarChecklist(item.nombre, 'estado', 'bien')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      item.estado === 'bien'
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    Bien
                  </button>
                  <button
                    type="button"
                    onClick={() => actualizarChecklist(item.nombre, 'estado', 'detalle')}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      item.estado === 'detalle'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'border-slate-300 text-slate-600'
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
      </section>

      {/* Niveles */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Niveles</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <NivelSlider label="Gasolina" value={nivelGasolina} onChange={setNivelGasolina} />
          <NivelSlider label="Aceite" value={nivelAceite} onChange={setNivelAceite} />
        </div>
      </section>

      {/* Trabajo solicitado */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Trabajo solicitado</h2>
        <textarea
          className={`${inputClass} min-h-24`}
          placeholder="Que reporta el cliente..."
          value={trabajoSolicitado}
          onChange={(e) => setTrabajoSolicitado(e.target.value)}
        />
      </section>

      {/* Fotos */}
      <section className={cardClass}>
        <h2 className="font-semibold text-slate-700">Fotos de la moto</h2>
        <input type="file" accept="image/*" multiple onChange={handleFotos} />
        {fotos.length > 0 && (
          <p className="text-sm text-slate-500">{fotos.length} foto(s) seleccionada(s)</p>
        )}
      </section>

      {/* Firma */}
      <section className={cardClass}>
        <label className="flex items-center gap-2 text-slate-700">
          <input
            type="checkbox"
            checked={firmaClienteRecepcion}
            onChange={(e) => setFirmaClienteRecepcion(e.target.checked)}
          />
          El cliente firmo la hoja fisica de recepcion
        </label>
      </section>

      <button
        type="submit"
        disabled={guardando}
        className="bg-slate-900 text-white rounded-md px-6 py-3 text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
      >
        {guardando ? 'Guardando...' : 'Guardar recepcion'}
      </button>
    </form>
  );
}
