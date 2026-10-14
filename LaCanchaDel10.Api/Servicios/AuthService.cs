using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var usuario = await _db.Usuarios.FirstOrDefaultAsync(u => u.Correo == request.Correo);

        if (usuario is null || !BCrypt.Net.BCrypt.Verify(request.Contrasena, usuario.ContrasenaHash))
        {
            throw new UnauthorizedAccessException("Correo o contraseña incorrectos.");
        }

        var (token, expiraEn) = _tokenService.GenerarToken(usuario);

        var usuarioResponse = new UsuarioResponse(
            usuario.IdUsuario, usuario.Nombre, usuario.Correo, usuario.Telefono, usuario.TipoUsuario, usuario.FechaCreacion);

        return new AuthResponse(token, expiraEn, usuarioResponse);
    }
}