# Base de datos

RuTaller usa **SQLite** como base de datos local embebida (un solo archivo, sin
servidor que instalar). En desarrollo el archivo vive en `database/rutaller.sqlite`
(ignorado por git). En produccion (app instalada) vive dentro de la carpeta de
datos de usuario del sistema operativo, fuera de la carpeta de instalacion.

- `migrations/` - cambios versionados al esquema (Sequelize CLI).
- `seeders/` - datos iniciales opcionales.

El esquema (tablas Cliente, Moto, Recepcion, Servicio, etc.) se define aqui una
vez que se defina el formulario de recepcion.
