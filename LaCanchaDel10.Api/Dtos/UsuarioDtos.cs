using System.ComponentModel.DataAnnotations;
using LaCanchaDel10.Api.Modelos;

namespace LaCanchaDel10.Api.Dtos;

public record RegistrarUsuarioRequest(
    [Required, MaxLength(120)] string Nombre,
    [Required, EmailAddress, MaxLength(150)] string Correo,
    [Required, MinLength(6)] string Contrasena,
    string? Telefono,
    TipoUsuario TipoUsuario = TipoUsuario.Cliente);

public record ActualizarUsuarioRequest(string? Nombre, string? Telefono);

public record UsuarioResponse(int IdUsuario, string Nombre, string Correo, string? Telefono, TipoUsuario TipoUsuario, DateTime FechaCreacion);