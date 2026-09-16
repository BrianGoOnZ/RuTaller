import { useState } from 'react';
import ProductosTab from '../components/inventario/ProductosTab';
import InsumosTab from '../components/inventario/InsumosTab';
import { segmentedWrapClass, segmentedTabClass } from '../ui/styles';

const TABS = [
  { id: 'productos', label: 'Productos' },
  { id: 'insumos', label: 'Insumos' },
];

export default function Inventario() {
  const [tab, setTab] = useState('productos');

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-4">Inventario</h1>

      <div className={`${segmentedWrapClass} mb-5`}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={segmentedTabClass(tab === t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'productos' && <ProductosTab />}
      {tab === 'insumos' && <InsumosTab />}
    </div>
  );
}
