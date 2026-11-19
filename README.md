# LACANCHADEL10

Aplicación móvil y API REST para la reserva de canchas deportivas. Proyecto final de Programación de Dispositivos Móviles, I.U. Pascual Bravo.

**Autor:** Nicolas Zapata Tavera

Los clientes consultan canchas, eligen día y horario y reservan. Los propietarios gestionan establecimientos, canchas, horarios y reservas.

## Estructura del repositorio

```
/
├── Front/     App móvil (Expo + React Native + TypeScript)
├── Back/      API REST (ASP.NET Core, .NET 10)
├── BD/        Script DDL de la base de datos (schema.sql)
└── README.md
```

## Tecnologías

- **Front:** Expo, React Native, TypeScript, React Navigation.
- **Back:** ASP.NET Core Web API (.NET 10), C#, Entity Framework Core, SQL Server.
- **Autenticación:** JWT con roles `Cliente` y `Propietario`; contraseñas con hash BCrypt.
- **Documentación de la API:** Swagger / OpenAPI en `/swagger`.
- **Arquitectura:** la API separa lectura y escritura en servicios distintos (`Servicios/Consultas` y `Servicios/Comandos`), con controladores, DTOs y modelos por separado.

## Requisitos

- .NET SDK 10
- SQL Server (o SQL Server Express)
- Node.js 18 o superior
- App **Expo Go** en el celular
- PC y celular conectados a la **misma red Wi-Fi**

## 1. Base de datos

1. Crea una base de datos vacía en SQL Server, por ejemplo `LaCanchaDel10`.
2. Ejecuta el script `BD/schema.sql` sobre esa base.

## 2. Backend (Back)

1. Configura la conexión y el JWT en `Back/LaCanchaDel10.Api/appsettings.json`, o con variables de entorno:

   ```
   ConnectionStrings__DefaultConnection = Server=TU_SERVIDOR;Database=LaCanchaDel10;Trusted_Connection=True;TrustServerCertificate=True
   Jwt__Key = [clave secreta de mínimo 32 caracteres]
   ```

   > Ajusta los nombres de las claves a los que use tu `appsettings.json`.

2. Desde `Back/LaCanchaDel10.Api`:

   ```bash
   dotnet restore
   dotnet run
   ```

3. Documentación Swagger: `http://localhost:[PUERTO]/swagger`

## 3. Frontend (Front)

1. Desde `Front`:

   ```bash
   npm install
   ```

2. En `Front/src/config.ts` escribe la IP de tu PC en la red Wi-Fi (no `localhost`). La ves con `ipconfig` (Dirección IPv4):

   ```ts
   export const API_URL = 'http://TU_IP:[PUERTO]';
   ```

3. Inicia la app:

   ```bash
   npx expo start -c
   ```

4. Escanea el QR con Expo Go.

> Si el celular no conecta, permite el puerto de la API en el Firewall de Windows y verifica que la API esté escuchando en la red (`http://0.0.0.0:[PUERTO]`).

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Cliente | cliente@correo.com | 123456 |
| Propietario | [correo] | [contraseña] |

## Funcionalidades de la app

- Registro, inicio de sesión y sesión persistente.
- Listado de canchas con filtro por tipo.
- Detalle de cancha, selección de día y horario, y reserva.
- Mis reservas, con opción de cancelar.
- Vista del propietario: establecimientos, canchas, horarios y gestión de reservas (confirmar, completar, cancelar).

## Endpoints principales

| Método | Ruta | Descripción |
|---|---|---|
| POST | /api/auth/login | Inicio de sesión |
| POST | /api/usuarios | Registro de usuario |
| GET | /api/canchas | Listar canchas (filtros: idEstablecimiento, tipo, soloActivas) |
| GET | /api/canchas/{id}/horarios | Horarios de una cancha por fecha |
| POST | /api/reservas | Crear reserva |
| GET | /api/reservas | Reservas del usuario autenticado |
| DELETE | /api/reservas/{id} | Cancelar reserva |
| POST | /api/canchas | Crear cancha (Propietario) |
| POST | /api/horarios | Crear horario (Propietario) |

La lista completa y los modelos están en Swagger.