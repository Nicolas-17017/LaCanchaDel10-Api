# LACANCHADEL10 — API

API REST para la reserva de canchas deportivas. Proyecto final de Programación de Dispositivos Móviles — I.U. Pascual Bravo.

**Autor:** Nicolas Zapata Tavera

## Tecnologías

- ASP.NET Core Web API (.NET 10), C#
- Entity Framework Core + SQL Server
- Autenticación JWT con roles `Cliente` y `Propietario`
- Contraseñas almacenadas con hash BCrypt
- Documentación con Swagger / OpenAPI

## Estructura del repositorio

```
/
├── database/
│   └── schema.sql              ← script DDL (crea la base de datos y las 5 tablas)
├── docs/
│   └── swagger.json            ← documentación OpenAPI exportada
├── LaCanchaDel10.Api/
│   ├── Controladores/          ← endpoints HTTP
│   ├── Servicios/              ← lógica de negocio
│   ├── Modelos/                ← entidades (Usuario, Establecimiento, Cancha, Horario, Reserva)
│   ├── Dtos/                   ← objetos de entrada y salida de la API
│   ├── Persistencia/           ← AppDbContext (conexión a SQL Server)
│   ├── Comun/                  ← excepciones y manejo de errores
│   ├── Program.cs
│   └── appsettings.json
└── README.md
```

## Modelo de datos

| Tabla | Relación |
|---|---|
| `Usuario` | clientes y propietarios |
| `Establecimiento` | pertenece a un `Usuario` (propietario) |
| `Cancha` | pertenece a un `Establecimiento` |
| `Horario` | pertenece a una `Cancha` |
| `Reserva` | une un `Usuario` con un `Horario` de una `Cancha` |

El esquema **no** lo crea Entity Framework: el script `database/schema.sql` es la fuente de verdad. EF Core solo lee y escribe datos.

## Requisitos

- .NET SDK 10
- SQL Server (Express o superior) y SQL Server Management Studio (SSMS)

## Instrucciones de ejecución

### 1. Crear la base de datos

1. Abre SSMS y conéctate a tu servidor.
2. Abre una **Nueva consulta**, pega el contenido de `database/schema.sql` y ejecútalo (F5).
3. Verifica que aparezca la base `LaCanchaDel10` con sus 5 tablas.

### 2. Configurar la conexión

Edita `LaCanchaDel10.Api/appsettings.json` y ajusta `ConnectionStrings:DefaultConnection` con el nombre de tu servidor.

Con autenticación de Windows:

```json
"DefaultConnection": "Server=NOMBRE_PC\\SQLEXPRESS;Database=LaCanchaDel10;Trusted_Connection=True;TrustServerCertificate=True;"
```

Con usuario y contraseña de SQL Server:

```json
"DefaultConnection": "Server=localhost,1433;Database=LaCanchaDel10;User Id=sa;Password=TU_CLAVE;TrustServerCertificate=True;"
```

También se puede definir con **variables de entorno** (tienen prioridad sobre `appsettings.json`). En PowerShell:

```powershell
$env:ConnectionStrings__DefaultConnection = "Server=NOMBRE_PC\SQLEXPRESS;Database=LaCanchaDel10;Trusted_Connection=True;TrustServerCertificate=True;"
$env:Jwt__Key = "una-llave-secreta-de-al-menos-32-caracteres"
```

La clave `Jwt:Key` debe tener al menos 32 caracteres.

### 3. Ejecutar la API

Desde Visual Studio con **F5**, o por consola:

```
cd LaCanchaDel10.Api
dotnet run
```

La consola indica el puerto en la línea `Now listening on: https://localhost:XXXX`.

### 4. Documentación (Swagger)

Con la API corriendo, abre en el navegador:

```
https://localhost:XXXX/swagger
```

Para probar endpoints protegidos: ejecuta `POST /api/auth/login`, copia el `token` (sin comillas), pulsa **Authorize** y pégalo **sin** escribir `Bearer`.

La documentación también está exportada en `docs/swagger.json`.

## Flujo de prueba sugerido

1. `POST /api/usuarios` — registrar un usuario `Propietario` y otro `Cliente`.
2. `POST /api/auth/login` como propietario y autorizar el token.
3. `POST /api/establecimientos`, luego `POST /api/canchas` y `POST /api/horarios`.
4. Cambiar al token del cliente y ejecutar `POST /api/reservas` con el `idHorario`.
5. `DELETE /api/reservas/{id}` cancela la reserva y libera el horario.

## Endpoints

| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/usuarios` | Registrar usuario | Público |
| POST | `/api/auth/login` | Iniciar sesión (devuelve JWT) | Público |
| GET, PUT | `/api/usuarios/{id}` | Consultar / actualizar perfil propio | Autenticado |
| GET | `/api/establecimientos`, `/api/establecimientos/{id}` | Consultar establecimientos | Público |
| POST, PUT, DELETE | `/api/establecimientos[/{id}]` | Administrar establecimientos propios | Propietario |
| GET | `/api/canchas`, `/api/canchas/{id}` | Consultar canchas (filtros `idEstablecimiento`, `tipo`) | Público |
| POST, PUT, DELETE | `/api/canchas[/{id}]` | Administrar canchas propias (DELETE las desactiva) | Propietario |
| GET | `/api/canchas/{id}/horarios` | Horarios de una cancha (filtro `fecha`) | Público |
| GET | `/api/canchas/{id}/reservas` | Reservas de una cancha propia | Propietario |
| POST, PUT, DELETE | `/api/horarios[/{id}]` | Publicar, editar o eliminar cupos | Propietario |
| POST | `/api/reservas` | Reservar un horario | Autenticado |
| GET | `/api/reservas` | Mis reservas | Autenticado |
| GET, PUT, DELETE | `/api/reservas/{id}` | Consultar, cambiar estado, cancelar | Autenticado |

## Decisiones de diseño

- **Sin dobles reservas:** transacción serializable en el servicio más un índice único filtrado en la base de datos (una sola reserva activa por horario).
- **Cancelar libera el cupo:** la reserva queda en estado `Cancelada` (no se borra) y el horario vuelve a estar disponible.
- **Desactivar en vez de borrar:** `DELETE /api/canchas/{id}` marca la cancha como `Inactiva` para conservar el historial.
- **Seguridad:** contraseñas con BCrypt, JWT con roles, y cada propietario solo administra lo suyo.
- **Errores uniformes:** un middleware convierte las excepciones de negocio en códigos HTTP (400, 401, 403, 404, 409, 500).
