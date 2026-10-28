namespace LaCanchaDel10.Api.Modelos;

public class Horario
{
    public int IdHorario { get; set; }

    public DateOnly Fecha { get; set; }
    public TimeSpan HoraInicio { get; set; }
    public TimeSpan HoraFin { get; set; }
    public bool Disponible { get; set; } = true;

    public int IdCancha { get; set; }
    public Cancha? Cancha { get; set; }

    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}