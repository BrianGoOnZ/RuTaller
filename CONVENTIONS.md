# Convenciones del proyecto

## Arquitectura MVC

- `backend/src/models` - definicion de datos (Sequelize).
- `backend/src/controllers` - logica de negocio, reciben `req`/`res`.
- `backend/src/routes` - definicion de endpoints, conectan rutas con controladores.
- `backend/src/middlewares` - autenticacion, manejo de errores, licencia.
- `frontend/src/pages` - una pantalla completa (Home, Clientes, Servicios, Ingresos).
- `frontend/src/components` - piezas reutilizables entre pantallas.

## Commits

Formato: `tipo(area): descripcion breve`, en minusculas, en espanol o ingles
consistente por commit. Tipos: `feat`, `fix`, `refactor`, `chore`, `docs`.

Ejemplo: `feat(clientes): agregar formulario de alta de cliente`
