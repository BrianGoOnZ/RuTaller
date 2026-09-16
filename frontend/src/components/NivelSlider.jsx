const NIVELES = ['vacio', '1/4', '1/2', '3/4', 'lleno'];
const ETIQUETAS = { vacio: 'Vacio', '1/4': '1/4', '1/2': '1/2', '3/4': '3/4', lleno: 'Lleno' };

export default function NivelSlider({ label, value, onChange }) {
  const index = Math.max(0, NIVELES.indexOf(value));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm text-slate-500">{ETIQUETAS[NIVELES[index]]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={4}
        step={1}
        value={index}
        onChange={(e) => onChange(NIVELES[Number(e.target.value)])}
        className="w-full accent-slate-800"
      />
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>Vacio</span>
        <span>Lleno</span>
      </div>
    </div>
  );
}
