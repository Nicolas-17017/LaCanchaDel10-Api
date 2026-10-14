namespace LaCanchaDel10.Api.Dtos;

public record LoginRequest(string Correo, string Contrasena);

public record AuthResponse(string Token, DateTime ExpiraEn, UsuarioResponse Usuario);