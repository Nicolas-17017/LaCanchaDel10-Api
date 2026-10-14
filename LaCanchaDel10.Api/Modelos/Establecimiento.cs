using System.ComponentModel.DataAnnotations;

namespace LaCanchaDel10.Api.Modelos;

public class Establecimiento
{
    public int IdEstablecimiento { get; set; }

    [Required, MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [Required, MaxLength(200)]
    public string Direccion { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefono { get; set; }

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    public int IdPropietario { get; set; }
    public Usuario? Propietario { get; set; }

    public ICollection<Cancha> Canchas { get; set; } = new List<Cancha>();
}