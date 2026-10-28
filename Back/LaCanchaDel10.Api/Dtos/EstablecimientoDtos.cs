using System.ComponentModel.DataAnnotations;

namespace LaCanchaDel10.Api.Dtos;

public record EstablecimientoRequest(
    [Required, MaxLength(150)] string Nombre,
    [Required, MaxLength(200)] string Direccion,
    string? Telefono,
    string? Descripcion);

public record EstablecimientoResponse(int IdEstablecimiento, string Nombre, string Direccion, string? Telefono, string? Descripcion, int IdPropietario);