using System.Data;
using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios;

public interface IReservaService
{
    Task<ReservaResponse> CrearAsync(ReservaRequest request, int idUsuarioActual);
    Task<IEnumerable<ReservaResponse>> ObtenerMisReservasAsync(int idUsuarioActual);
    Task<ReservaResponse> ObtenerPorIdAsync(int id, int idUsuarioActual);
    Task<ReservaResponse> ActualizarEstadoAsync(int id, ActualizarReservaRequest request, int idUsuarioActual);
    Task CancelarAsync(int id, int idUsuarioActual);
}

public class ReservaService : IReservaService
{
    private readonly AppDbContext _db;

    public ReservaService(AppDbContext db)
    {
        _db = db;
    }

    
    public async Task<ReservaResponse> CrearAsync(ReservaRequest request, int idUsuarioActual)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

        var horario = await _db.Horarios.Include(h => h.Cancha)
            .FirstOrDefaultAsync(h => h.IdHorario == request.IdHorario)
            ?? throw new NotFoundException("Horario no encontrado.");

        if (!horario.Disponible)
            throw new ConflictException("Ese horario ya fue reservado por otro usuario.");

        horario.Disponible = false;

        var reserva = new Reserva
        {
            IdUsuario = idUsuarioActual,
            IdCancha = horario.IdCancha,
            IdHorario = horario.IdHorario,
            Precio = horario.Cancha!.Precio,
            Estado = EstadoReserva.Confirmada
        };

        _db.Reservas.Add(reserva);

        try
        {
            await _db.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateException)
        {
            await transaction.RollbackAsync();
            throw new ConflictException("Ese horario ya fue reservado por otro usuario.");
        }

        return ToResponse(reserva);
    }

    public async Task<IEnumerable<ReservaResponse>> ObtenerMisReservasAsync(int idUsuarioActual)
    {
        return await _db.Reservas
            .Where(r => r.IdUsuario == idUsuarioActual)
            .OrderByDescending(r => r.FechaReserva)
            .Select(r => ToResponse(r))
            .ToListAsync();
    }

    public async Task<ReservaResponse> ObtenerPorIdAsync(int id, int idUsuarioActual)
    {
        var reserva = await _db.Reservas
            .Include(r => r.Cancha!).ThenInclude(c => c.Establecimiento)
            .FirstOrDefaultAsync(r => r.IdReserva == id)
            ?? throw new NotFoundException("Reserva no encontrada.");

        var esDueno = reserva.IdUsuario == idUsuarioActual;
        var esPropietarioDeLaCancha = reserva.Cancha?.Establecimiento?.IdPropietario == idUsuarioActual;

        if (!esDueno && !esPropietarioDeLaCancha)
            throw new ForbiddenException("No puedes consultar esta reserva.");

        return ToResponse(reserva);
    }

    public async Task<ReservaResponse> ActualizarEstadoAsync(int id, ActualizarReservaRequest request, int idUsuarioActual)
    {
        var reserva = await _db.Reservas
            .Include(r => r.Cancha!).ThenInclude(c => c.Establecimiento)
            .Include(r => r.Horario)
            .FirstOrDefaultAsync(r => r.IdReserva == id)
            ?? throw new NotFoundException("Reserva no encontrada.");

        var esPropietarioDeLaCancha = reserva.Cancha?.Establecimiento?.IdPropietario == idUsuarioActual;

        if (!esPropietarioDeLaCancha)
            throw new ForbiddenException("Solo el propietario de la cancha puede actualizar el estado de la reserva.");

        reserva.Estado = request.Estado;

        if (request.Estado == EstadoReserva.Cancelada && reserva.Horario is not null)
        {
            reserva.Horario.Disponible = true;
        }

        await _db.SaveChangesAsync();

        return ToResponse(reserva);
    }

    public async Task CancelarAsync(int id, int idUsuarioActual)
    {
        var reserva = await _db.Reservas.Include(r => r.Horario)
            .FirstOrDefaultAsync(r => r.IdReserva == id)
            ?? throw new NotFoundException("Reserva no encontrada.");

        if (reserva.IdUsuario != idUsuarioActual)
            throw new ForbiddenException("No puedes cancelar la reserva de otro usuario.");

        if (reserva.Estado == EstadoReserva.Cancelada)
            throw new ConflictException("La reserva ya está cancelada.");

        reserva.Estado = EstadoReserva.Cancelada;

        if (reserva.Horario is not null)
            reserva.Horario.Disponible = true;

        await _db.SaveChangesAsync();
    }

    private static ReservaResponse ToResponse(Reserva r) =>
        new(r.IdReserva, r.FechaReserva, r.Estado, r.Precio, r.IdUsuario, r.IdCancha, r.IdHorario);
}