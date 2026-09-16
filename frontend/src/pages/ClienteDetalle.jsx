import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCliente } from '../services/clientes';
import { createMoto, TIPOS_MOTO } from '../services/motos';
import Modal from '../components/Modal';
import { inputClass, labelClass, btnPrimary } from '../ui/styles';
import { PlusIcon } from '../ui/icons';

const VACIO = { marca: '', modelo: '', tipo: '', placas: '', noSerie: '' };

export default function ClienteDetalle() {
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(VACIO);
  const navigate = useNavigate();

  async function cargar() {
    const data = await getCliente(id);
    setCliente(data);
  }

  useEffect(() => {
    cargar();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    await createMoto({ ...form, clienteId: id });
    setModalOpen(false);
    setForm(VACIO);
    cargar();
  }

  if (!cliente) return <p className="text-slate-500">Cargando...</p>;

  return (
    <div>
      <Link to="/clientes" className="text-sm text-slate-500 hover:text-slate-700">
        &larr; Clientes
      </Link>

      <div className="mt-2 mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{cliente.nombre}</h1>
          <p className="text-sm text-slate-500">
            {cliente.telefono} {cliente.direccion ? `· ${cliente.direccion}` : ''}
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className={`${btnPrimary} inline-flex items-center gap-1.5`}>
          <PlusIcon width={16} height={16} /> Agregar moto
        </button>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-700">Motos</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cliente.Motos?.map((moto) => (
          <button
            key={moto.id}
            onClick={() => navigate(`/motos/${moto.id}`)}
            className="rounded-xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="font-semibold text-slate-800">
              {moto.marca} {moto.modelo}
            </p>
            <p className="text-sm text-slate-500">{moto.tipo}</p>
            <p className="text-sm text-slate-500">Placas: {moto.placas || 'N/A'}</p>
          </button>
        ))}
        {(!cliente.Motos || cliente.Motos.length === 0) && (
          <p className="text-sm text-slate-400">Este cliente aun no tiene motos registradas.</p>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nueva moto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marca</label>
              <input
                className={inputClass}
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Modelo</label>
              <input
                className={inputClass}
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tipo</label>
            <select
              className={inputClass}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="">Selecciona...</option>
              {TIPOS_MOTO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Placas</label>
              <input
                className={inputClass}
                value={form.placas}
                onChange={(e) => setForm({ ...form, placas: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>No. de serie</label>
              <input
                className={inputClass}
                value={form.noSerie}
                onChange={(e) => setForm({ ...form, noSerie: e.target.value })}
              />
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
