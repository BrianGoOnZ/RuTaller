import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/servicios', label: 'Servicios' },
  { to: '/ingresos', label: 'Ingresos' },
];

export default function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-slate-900 text-slate-100 flex flex-col">
      <div className="px-5 py-4 text-xl font-bold border-b border-slate-800">RuTaller</div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium ${
                isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
