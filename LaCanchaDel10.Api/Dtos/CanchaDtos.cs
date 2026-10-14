using System.ComponentModel.DataAnnotations;
using LaCanchaDel10.Api.Modelos;

namespace LaCanchaDel10.Api.Dtos;

public record CanchaRequest(
    [Required, MaxLength(120)] string Nombre,
    [Required, MaxLength(40)] string Tipo,
    [Range(0, 10000000)] decimal Precio,
    int IdEstablecimiento,
    EstadoCancha Estado = EstadoCancha.Activa);

public record CanchaResponse(int IdCancha, string Nombre, string Tipo, decimal Precio, EstadoCancha Estado, int IdEstablecimiento);