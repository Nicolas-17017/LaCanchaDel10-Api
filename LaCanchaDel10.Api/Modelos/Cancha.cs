using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LaCanchaDel10.Api.Modelos;

public class Cancha
{
    public int IdCancha { get; set; }

    [Required, MaxLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [Required, MaxLength(40)]
    public string Tipo { get; set; } = string.Empty;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Precio { get; set; }

    public EstadoCancha Estado { get; set; } = EstadoCancha.Activa;

    public int IdEstablecimiento { get; set; }
    public Establecimiento? Establecimiento { get; set; }

    public ICollection<Horario> Horarios { get; set; } = new List<Horario>();
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}