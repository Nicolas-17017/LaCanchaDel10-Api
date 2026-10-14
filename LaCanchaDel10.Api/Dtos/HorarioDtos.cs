namespace LaCanchaDel10.Api.Dtos;

public record HorarioRequest(int IdCancha, DateOnly Fecha, TimeSpan HoraInicio, TimeSpan HoraFin);

public record HorarioResponse(int IdHorario, DateOnly Fecha, TimeSpan HoraInicio, TimeSpan HoraFin, bool Disponible, int IdCancha);