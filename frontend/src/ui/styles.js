export const inputClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm transition-colors focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/20';

export const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

export const cardClass = 'rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-100';

export const tableWrapClass = 'bg-white rounded-xl shadow-sm ring-1 ring-slate-100 overflow-hidden';
export const theadRowClass =
  'bg-slate-50/80 text-left text-xs font-semibold uppercase tracking-wide text-slate-500';
export const tbodyClass = 'divide-y divide-slate-100';
export const rowHoverClass = 'transition-colors hover:bg-slate-50/70';

export const btnPrimary =
  'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800 disabled:opacity-50';
export const btnPrimarySmall =
  'rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50';
export const btnGhost =
  'rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100';
export const btnDanger =
  'rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50';

export const actionBtn =
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors';
export const actionBtnNeutral = `${actionBtn} border-slate-200 text-slate-700 hover:bg-slate-100`;
export const actionBtnDanger = `${actionBtn} border-red-200 text-red-600 hover:bg-red-50`;
export const actionBtnAmber = `${actionBtn} border-amber-200 text-amber-700 hover:bg-amber-50`;

export function avatarInitial(nombre) {
  return (nombre || '?').charAt(0).toUpperCase();
}
export const avatarClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-600 text-sm font-semibold text-white';

// Cada estado tiene su propio color, sin repetir tono con otro estado, y
// dejando el verde reservado unicamente para "entregada".
export const ESTADO_BADGE_COLORS = {
  recibida: 'bg-slate-100 text-slate-700',
  diagnostico: 'bg-blue-100 text-blue-700',
  reparacion: 'bg-orange-100 text-orange-700',
  lista: 'bg-violet-100 text-violet-700',
  entregada: 'bg-green-100 text-green-700',
  garantia: 'bg-amber-100 text-amber-800',
  cancelada: 'bg-red-100 text-red-700',
};

export const numberBadgeClass =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-600 text-xs font-semibold text-white';

export const badgePill = 'px-2 py-1 rounded-full text-xs font-medium';

export const segmentedWrapClass = 'inline-flex gap-1 rounded-lg bg-slate-100 p-1';
export function segmentedTabClass(active) {
  return `rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
    active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
  }`;
}

export const statCardClass = 'rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 flex items-start gap-4';
export function statIconWrapClass(tone) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    violet: 'bg-violet-100 text-violet-700',
  };
  return `flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tones[tone] || tones.slate}`;
}
