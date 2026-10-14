using System.ComponentModel.DataAnnotations.Schema;

namespace LaCanchaDel10.Api.Modelos;

public class Reserva
{
    public int IdReserva { get; set; }

    public DateTime FechaReserva { get; set; } = DateTime.UtcNow;
    public EstadoReserva Estado { get; set; } = EstadoReserva.Pendiente;

    [Column(TypeName = "decimal(10,2)")]
    public decimal Precio { get; set; }

    public int IdUsuario { get; set; }
    public Usuario? Usuario { get; set; }

    public int IdCancha { get; set; }
    public Cancha? Cancha { get; set; }

    public int IdHorario { get; set; }
    public Horario? Horario { get; set; }
}