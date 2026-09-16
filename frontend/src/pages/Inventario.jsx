import { useState } from 'react';
import ProductosTab from '../components/inventario/ProductosTab';
import InsumosTab from '../components/inventario/InsumosTab';
import VentaRapidaTab from '../components/inventario/VentaRapidaTab';

const TABS = [
  { id: 'productos', label: 'Productos' },
  { id: 'insumos', label: 'Insumos' },
  { id: 'venta', label: 'Venta rapida' },
];

export default function Inventario() {
  const [tab, setTab] = useState('productos');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Inventario</h1>

      <div className="flex gap-2 mb-4 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.id ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'productos' && <ProductosTab />}
      {tab === 'insumos' && <InsumosTab />}
      {tab === 'venta' && <VentaRapidaTab />}
    </div>
  );
}
