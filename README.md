# RuTaller

Aplicacion de escritorio para talleres de motos: control de recepcion,
servicios realizados y entrega de motos, con historial por cliente.

## Stack

- **Electron** - empaquetado de escritorio (instalador `.exe` unico, sin
  dependencias externas que instalar).
- **Frontend**: React + Vite + Tailwind CSS (Vistas).
- **Backend**: Node.js + Express, embebido en el proceso de Electron
  (Controladores, Modelos, Middlewares).
- **Base de datos**: SQLite local via Sequelize.
- **Licenciamiento**: licencia anual con validacion hibrida
  (archivo firmado + verificacion periodica en linea).

## Estructura (MVC)

```
RuTaller/
├── backend/      Modelos, Controladores, Rutas, Middlewares (Express)
├── frontend/     Vistas (React)
├── database/     Migraciones y seeders (SQLite)
├── electron/     Proceso principal de Electron (empaquetado)
```

## Desarrollo

```bash
npm install
npm run dev
```

## Build (instalador Windows)

```bash
npm run build
```

Genera un instalador `.exe` (NSIS) en `dist/` con todo empaquetado.
