using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios.Consultas;

public interface IUsuarioConsultas
{
    Task<UsuarioResponse> ObtenerPorIdAsync(int id);
}

public class UsuarioConsultas : IUsuarioConsultas
{
    private readonly LecturaDbContext _db;

    public UsuarioConsultas(LecturaDbContext db)
    {
        _db = db;
    }

    public async Task<UsuarioResponse> ObtenerPorIdAsync(int id)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.IdUsuario == id)
            ?? throw new NotFoundException("Usuario no encontrado.");

        return new UsuarioResponse(
            usuario.IdUsuario, usuario.Nombre, usuario.Correo, usuario.Telefono, usuario.TipoUsuario, usuario.FechaCreacion);
    }
}