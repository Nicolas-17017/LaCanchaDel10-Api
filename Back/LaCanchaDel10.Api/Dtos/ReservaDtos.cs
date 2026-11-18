using LaCanchaDel10.Api.Modelos;

namespace LaCanchaDel10.Api.Dtos;

public record ReservaRequest(int IdHorario);

public record ActualizarReservaRequest(EstadoReserva Estado);

public record ReservaResponse(int IdReserva, DateTime FechaReserva, EstadoReserva Estado, decimal Precio, int IdUsuario, int IdCancha, int IdHorario);

// Respuesta de las consultas: reserva con cancha, establecimiento, fecha y hora ya resueltos.
public record ReservaDetalleResponse(
    int IdReserva, DateTime FechaReserva, EstadoReserva Estado, decimal Precio,
    int IdUsuario, string ClienteNombre,
    int IdCancha, string CanchaNombre, string EstablecimientoNombre, string EstablecimientoDireccion,
    int IdHorario, DateOnly Fecha, TimeSpan HoraInicio, TimeSpan HoraFin);