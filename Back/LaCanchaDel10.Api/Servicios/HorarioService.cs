using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios;

public interface IHorarioService
{
    Task<HorarioResponse> CrearAsync(HorarioRequest request, int idUsuarioActual);
    Task<HorarioResponse> ActualizarAsync(int id, HorarioRequest request, int idUsuarioActual);
    Task EliminarAsync(int id, int idUsuarioActual);
}

public class HorarioService : IHorarioService
{
    private readonly AppDbContext _db;

    public HorarioService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<HorarioResponse> CrearAsync(HorarioRequest request, int idUsuarioActual)
    {
        if (request.HoraFin <= request.HoraInicio)
            throw new BadRequestException("La hora de fin debe ser posterior a la hora de inicio.");

        var cancha = await _db.Canchas.Include(c => c.Establecimiento)
            .FirstOrDefaultAsync(c => c.IdCancha == request.IdCancha)
            ?? throw new NotFoundException("Cancha no encontrada.");

        if (cancha.Establecimiento!.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No administras esta cancha.");

        var solapado = await _db.Horarios.AnyAsync(h =>
            h.IdCancha == request.IdCancha &&
            h.Fecha == request.Fecha &&
            h.HoraInicio < request.HoraFin &&
            request.HoraInicio < h.HoraFin);

        if (solapado)
            throw new ConflictException("Ya existe un horario que se solapa con ese rango.");

        var horario = new Horario
        {
            IdCancha = request.IdCancha,
            Fecha = request.Fecha,
            HoraInicio = request.HoraInicio,
            HoraFin = request.HoraFin,
            Disponible = true
        };

        _db.Horarios.Add(horario);
        await _db.SaveChangesAsync();

        return ToResponse(horario);
    }

    public async Task<HorarioResponse> ActualizarAsync(int id, HorarioRequest request, int idUsuarioActual)
    {
        var horario = await _db.Horarios
            .Include(h => h.Cancha!).ThenInclude(c => c.Establecimiento)
            .FirstOrDefaultAsync(h => h.IdHorario == id)
            ?? throw new NotFoundException("Horario no encontrado.");

        if (horario.Cancha!.Establecimiento!.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No administras esta cancha.");

        if (!horario.Disponible)
            throw new ConflictException("No se puede modificar un horario que ya tiene una reserva.");

        horario.Fecha = request.Fecha;
        horario.HoraInicio = request.HoraInicio;
        horario.HoraFin = request.HoraFin;

        await _db.SaveChangesAsync();

        return ToResponse(horario);
    }

    public async Task EliminarAsync(int id, int idUsuarioActual)
    {
        var horario = await _db.Horarios
            .Include(h => h.Cancha!).ThenInclude(c => c.Establecimiento)
            .FirstOrDefaultAsync(h => h.IdHorario == id)
            ?? throw new NotFoundException("Horario no encontrado.");

        if (horario.Cancha!.Establecimiento!.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No administras esta cancha.");

        if (!horario.Disponible)
            throw new ConflictException("No se puede eliminar un horario que ya tiene una reserva.");

        _db.Horarios.Remove(horario);
        await _db.SaveChangesAsync();
    }

    private static HorarioResponse ToResponse(Horario h) =>
        new(h.IdHorario, h.Fecha, h.HoraInicio, h.HoraFin, h.Disponible, h.IdCancha);
}