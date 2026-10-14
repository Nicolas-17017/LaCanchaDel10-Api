using System.ComponentModel.DataAnnotations;

namespace LaCanchaDel10.Api.Modelos;

public class Usuario
{
    public int IdUsuario { get; set; }

    [Required, MaxLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Correo { get; set; } = string.Empty;

    [Required]
    public string ContrasenaHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefono { get; set; }

    public TipoUsuario TipoUsuario { get; set; } = TipoUsuario.Cliente;

    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    public ICollection<Establecimiento> Establecimientos { get; set; } = new List<Establecimiento>();
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}