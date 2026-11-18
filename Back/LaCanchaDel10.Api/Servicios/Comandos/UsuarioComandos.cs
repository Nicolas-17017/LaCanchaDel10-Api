using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios.Comandos;

public interface IUsuarioComandos
{
    Task<UsuarioResponse> RegistrarAsync(RegistrarUsuarioRequest request);
    Task<UsuarioResponse> ActualizarAsync(int id, ActualizarUsuarioRequest request, int idUsuarioActual);
}

public class UsuarioComandos : IUsuarioComandos
{
    private readonly AppDbContext _db;

    public UsuarioComandos(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UsuarioResponse> RegistrarAsync(RegistrarUsuarioRequest request)
    {
        var correoExiste = await _db.Usuarios.AnyAsync(u => u.Correo == request.Correo);
        if (correoExiste)
            throw new ConflictException("Ya existe una cuenta registrada con ese correo.");

        var usuario = new Usuario
        {
            Nombre = request.Nombre,
            Correo = request.Correo,
            ContrasenaHash = BCrypt.Net.BCrypt.HashPassword(request.Contrasena),
            Telefono = request.Telefono,
            TipoUsuario = request.TipoUsuario
        };

        _db.Usuarios.Add(usuario);
        await _db.SaveChangesAsync();

        return ToResponse(usuario);
    }

    public async Task<UsuarioResponse> ActualizarAsync(int id, ActualizarUsuarioRequest request, int idUsuarioActual)
    {
        if (id != idUsuarioActual)
            throw new ForbiddenException("No puedes modificar el perfil de otro usuario.");

        var usuario = await _db.Usuarios.FindAsync(id)
            ?? throw new NotFoundException("Usuario no encontrado.");

        if (!string.IsNullOrWhiteSpace(request.Nombre)) usuario.Nombre = request.Nombre;
        if (request.Telefono is not null) usuario.Telefono = request.Telefono;

        await _db.SaveChangesAsync();

        return ToResponse(usuario);
    }

    private static UsuarioResponse ToResponse(Usuario u) =>
        new(u.IdUsuario, u.Nombre, u.Correo, u.Telefono, u.TipoUsuario, u.FechaCreacion);
}