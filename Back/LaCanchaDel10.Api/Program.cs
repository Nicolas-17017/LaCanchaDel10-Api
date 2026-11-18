using System.Text;
using System.Text.Json.Serialization;
using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Persistencia;
using LaCanchaDel10.Api.Servicios;
using LaCanchaDel10.Api.Servicios.Comandos;
using LaCanchaDel10.Api.Servicios.Consultas;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ---------- Base de datos: escritura y lectura separadas ----------
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Falta la cadena de conexión 'DefaultConnection'.");

// Si no hay cadena de lectura propia, se usa la misma base de datos.
var lecturaConnectionString = builder.Configuration.GetConnectionString("LecturaConnection")
    ?? connectionString;

// Escritura: comandos (crear, actualizar, eliminar)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Lectura: consultas (solo SELECT, sin seguimiento de cambios)
builder.Services.AddDbContext<LecturaDbContext>(options =>
    options.UseSqlServer(lecturaConnectionString));

// ---------- Servicios de la aplicación ----------
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Consultas (lectura)
builder.Services.AddScoped<IUsuarioConsultas, UsuarioConsultas>();
builder.Services.AddScoped<IEstablecimientoConsultas, EstablecimientoConsultas>();
builder.Services.AddScoped<ICanchaConsultas, CanchaConsultas>();
builder.Services.AddScoped<IReservaConsultas, ReservaConsultas>();

// Comandos (escritura)
builder.Services.AddScoped<IUsuarioComandos, UsuarioComandos>();
builder.Services.AddScoped<IEstablecimientoComandos, EstablecimientoComandos>();
builder.Services.AddScoped<ICanchaComandos, CanchaComandos>();
builder.Services.AddScoped<IHorarioComandos, HorarioComandos>();
builder.Services.AddScoped<IReservaComandos, ReservaComandos>();

// ---------- Autenticación JWT ----------
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("Falta 'Jwt:Key' en la configuración.");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LaCanchaDel10.Api";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LaCanchaDel10.Clients";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

// ---------- CORS (necesario para que la app móvil consuma la API) ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirApp", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// ---------- Controladores (enums como texto) y Swagger ----------
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LACANCHADEL10 API",
        Version = "v1",
        Description = "API REST para la reserva de canchas deportivas — I.U. Pascual Bravo."
    });

    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token con el formato: Bearer {tu token}",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };

    options.AddSecurityDefinition("Bearer", jwtScheme);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { jwtScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();

// Swagger disponible siempre (no solo en Development) para poder calificarlo publicado.
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "LACANCHADEL10 API v1");
    options.RoutePrefix = "swagger";
});

// En desarrollo se acepta HTTP plano para que el celular (Expo Go) pueda llamar a la API.
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("PermitirApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();