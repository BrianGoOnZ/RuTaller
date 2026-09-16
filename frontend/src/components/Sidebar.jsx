import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useConfigStore } from '../store/configStore';

function iniciales(nombre) {
  const palabras = nombre.trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return 'RT';
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const icons = {
  inicio: (
    <svg {...iconProps}>
      <polyline points="3 10 12 3 21 10" />
      <path d="M5 9v11h14V9" />
      <rect x="10" y="14" width="4" height="6" />
    </svg>
  ),
  clientes: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M14.5 13.6c2.6.4 4.5 2.6 4.9 5.4" />
    </svg>
  ),
  recepcion: (
    <svg {...iconProps}>
      <path d="M12 3v12" />
      <polyline points="7 11 12 16 17 11" />
      <path d="M4 19h16" />
    </svg>
  ),
  servicios: (
    <svg {...iconProps}>
      <rect x="6" y="3" width="12" height="18" rx="1.5" />
      <rect x="9" y="1.5" width="6" height="3" rx="1" />
      <line x1="9" y1="9" x2="15" y2="9" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  ),
  inventario: (
    <svg {...iconProps}>
      <polygon points="12 3 21 7.5 12 12 3 7.5" />
      <polyline points="3 7.5 3 16.5 12 21 21 16.5 21 7.5" />
      <line x1="12" y1="12" x2="12" y2="21" />
    </svg>
  ),
  ventas: (
    <svg {...iconProps}>
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
      <path d="M3 4h2l2 11h10l2-8H6.5" />
    </svg>
  ),
  mecanicos: (
    <svg {...iconProps}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" />
    </svg>
  ),
  finanzas: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="17" />
      <path d="M15 9.5c0-1.1-1.3-2-3-2s-3 .9-3 2c0 1.1 1.3 1.6 3 2s3 .9 3 2c0 1.1-1.3 2-3 2s-3-.9-3-2" />
    </svg>
  ),
  configuracion: (
    <svg {...iconProps}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="8" cy="18" r="2" />
    </svg>
  ),
};

const links = [
  { to: '/', label: 'Inicio', end: true, icon: 'inicio' },
  { to: '/clientes', label: 'Clientes', icon: 'clientes' },
  { to: '/recepcion', label: 'Recepcion', icon: 'recepcion' },
  { to: '/servicios', label: 'Servicios', icon: 'servicios' },
  { to: '/inventario', label: 'Inventario', icon: 'inventario' },
  { to: '/ventas', label: 'Ventas', icon: 'ventas' },
  { to: '/mecanicos', label: 'Mecanicos', icon: 'mecanicos' },
  { to: '/finanzas', label: 'Finanzas', icon: 'finanzas' },
  { to: '/configuracion', label: 'Configuracion', icon: 'configuracion' },
];

export default function Sidebar() {
  const [expandido, setExpandido] = useState(false);
  const nombreTaller = useConfigStore((s) => s.nombreTaller);
  const cargar = useConfigStore((s) => s.cargar);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return (
    <aside
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      className={`shrink-0 bg-slate-900 text-slate-100 flex flex-col transition-all duration-200 ease-in-out overflow-hidden ${
        expandido ? 'w-56' : 'w-16'
      }`}
    >
      <div className="h-14 flex items-center justify-center border-b border-slate-800 shrink-0 px-3">
        <span
          className={`font-bold ${expandido ? 'w-full truncate text-center text-lg' : 'text-xl'}`}
          title={nombreTaller}
        >
          {expandido ? nombreTaller : iniciales(nombreTaller)}
        </span>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            title={link.label}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            <span className="shrink-0">{icons[link.icon]}</span>
            {expandido && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
