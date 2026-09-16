const CHECKLIST_ITEMS = [
  'Espejos',
  'Asiento',
  'Faro delantero',
  'Luz trasera (freno)',
  'Direccionales',
  'Micas',
  'Cubiertas',
  'Molduras',
  'Tapon de gasolina',
  'Tacometro',
  'Pedales',
  'Parabrisas',
  'Claxon',
  'Tapon de aceite',
  'Tapon de radiador',
  'Filtro de aire',
  'Bateria',
  'Llaves',
  'Neumatico delantero',
  'Neumatico trasero',
  'Mofle',
];

const NIVELES = ['vacio', '1/4', '1/2', '3/4', 'lleno'];

const ESTADOS_ORDEN = ['recibida', 'diagnostico', 'reparacion', 'lista', 'entregada', 'garantia', 'cancelada'];

const ROLES_USUARIO = ['administrador', 'cajero', 'mecanico'];

const ESPECIALIDADES_MECANICO = [
  'General',
  'Motor y transmision',
  'Sistema electrico',
  'Frenos y suspension',
  'Diagnostico y electronica',
  'Carroceria y pintura',
];

module.exports = { CHECKLIST_ITEMS, NIVELES, ESTADOS_ORDEN, ROLES_USUARIO, ESPECIALIDADES_MECANICO };
