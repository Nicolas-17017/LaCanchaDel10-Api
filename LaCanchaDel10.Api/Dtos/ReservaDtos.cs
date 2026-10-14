using LaCanchaDel10.Api.Modelos;

namespace LaCanchaDel10.Api.Dtos;

public record ReservaRequest(int IdHorario);

public record ActualizarReservaRequest(EstadoReserva Estado);

public record ReservaResponse(int IdReserva, DateTime FechaReserva, EstadoReserva Estado, decimal Precio, int IdUsuario, int IdCancha, int IdHorario);