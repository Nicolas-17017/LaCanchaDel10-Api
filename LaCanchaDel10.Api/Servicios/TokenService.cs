using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LaCanchaDel10.Api.Modelos;
using Microsoft.IdentityModel.Tokens;

namespace LaCanchaDel10.Api.Servicios;

public interface ITokenService
{
    (string Token, DateTime ExpiraEn) GenerarToken(Usuario usuario);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;

    public TokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string Token, DateTime ExpiraEn) GenerarToken(Usuario usuario)
    {
        var key = _config["Jwt:Key"] ?? throw new InvalidOperationException("Falta Jwt:Key en la configuración.");
        var issuer = _config["Jwt:Issuer"] ?? "LaCanchaDel10.Api";
        var audience = _config["Jwt:Audience"] ?? "LaCanchaDel10.Clients";

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Email, usuario.Correo),
            new Claim(ClaimTypes.Role, usuario.TipoUsuario.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var expira = DateTime.UtcNow.AddHours(8);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expira,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expira);
    }
}