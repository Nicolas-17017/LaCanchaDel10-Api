using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios;

public interface ICanchaService
{
    Task<IEnumerable<CanchaResponse>> ObtenerTodasAsync(int? idEstablecimiento, string? tipo);
    Task<CanchaResponse> ObtenerPorIdAsync(int id);
    Task<CanchaResponse> CrearAsync(CanchaRequest request, int idUsuarioActual);
    Task<CanchaResponse> ActualizarAsync(int id, CanchaRequest request, int idUsuarioActual);
    Task EliminarAsync(int id, int idUsuarioActual);
    Task<IEnumerable<HorarioResponse>> ObtenerHorariosAsync(int idCancha, DateOnly? fecha);
    Task<IEnumerable<ReservaResponse>> ObtenerReservasAsync(int idCancha, int idUsuarioActual);
}

public class CanchaService : ICanchaService
{
    private readonly AppDbContext _db;

    public CanchaService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CanchaResponse>> ObtenerTodasAsync(int? idEstablecimiento, string? tipo)
    {
        var query = _db.Canchas.AsQueryable();

        if (idEstablecimiento is not null)
            query = query.Where(c => c.IdEstablecimiento == idEstablecimiento);

        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(c => c.Tipo == tipo);

        return await query.Select(c => ToResponse(c)).ToListAsync();
    }

    public async Task<CanchaResponse> ObtenerPorIdAsync(int id)
    {
        var cancha = await _db.Canchas.FindAsync(id)
            ?? throw new NotFoundException("Cancha no encontrada.");

        return ToResponse(cancha);
    }

    public async Task<CanchaResponse> CrearAsync(CanchaRequest request, int idUsuarioActual)
    {
        await ValidarPropietarioDelEstablecimientoAsync(request.IdEstablecimiento, idUsuarioActual);

        var cancha = new Cancha
        {
            Nombre = request.Nombre,
            Tipo = request.Tipo,
            Precio = request.Precio,
            Estado = request.Estado,
            IdEstablecimiento = request.IdEstablecimiento
        };

        _db.Canchas.Add(cancha);
        await _db.SaveChangesAsync();

        return ToResponse(cancha);
    }

    public async Task<CanchaResponse> ActualizarAsync(int id, CanchaRequest request, int idUsuarioActual)
    {
        var cancha = await _db.Canchas.FindAsync(id)
            ?? throw new NotFoundException("Cancha no encontrada.");

        await ValidarPropietarioDelEstablecimientoAsync(cancha.IdEstablecimiento, idUsuarioActual);

        cancha.Nombre = request.Nombre;
        cancha.Tipo = request.Tipo;
        cancha.Precio = request.Precio;
        cancha.Estado = request.Estado;

        await _db.SaveChangesAsync();

        return ToResponse(cancha);
    }

    public async Task EliminarAsync(int id, int idUsuarioActual)
    {
        var cancha = await _db.Canchas.FindAsync(id)
            ?? throw new NotFoundException("Cancha no encontrada.");

        await ValidarPropietarioDelEstablecimientoAsync(cancha.IdEstablecimiento, idUsuarioActual);

        
        cancha.Estado = EstadoCancha.Inactiva;
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<HorarioResponse>> ObtenerHorariosAsync(int idCancha, DateOnly? fecha)
    {
        var existe = await _db.Canchas.AnyAsync(c => c.IdCancha == idCancha);
        if (!existe) throw new NotFoundException("Cancha no encontrada.");

        var query = _db.Horarios.Where(h => h.IdCancha == idCancha);

        if (fecha is not null)
            query = query.Where(h => h.Fecha == fecha);

        return await query
            .OrderBy(h => h.Fecha).ThenBy(h => h.HoraInicio)
            .Select(h => new HorarioResponse(h.IdHorario, h.Fecha, h.HoraInicio, h.HoraFin, h.Disponible, h.IdCancha))
            .ToListAsync();
    }

    public async Task<IEnumerable<ReservaResponse>> ObtenerReservasAsync(int idCancha, int idUsuarioActual)
    {
        var cancha = await _db.Canchas.FindAsync(idCancha)
            ?? throw new NotFoundException("Cancha no encontrada.");

        await ValidarPropietarioDelEstablecimientoAsync(cancha.IdEstablecimiento, idUsuarioActual);

        return await _db.Reservas
            .Where(r => r.IdCancha == idCancha)
            .Select(r => new ReservaResponse(r.IdReserva, r.FechaReserva, r.Estado, r.Precio, r.IdUsuario, r.IdCancha, r.IdHorario))
            .ToListAsync();
    }

    private async Task ValidarPropietarioDelEstablecimientoAsync(int idEstablecimiento, int idUsuarioActual)
    {
        var establecimiento = await _db.Establecimientos.FindAsync(idEstablecimiento)
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        if (establecimiento.IdPropietario != idUsuarioActual)
        {
            throw new ForbiddenException("No administras este establecimiento.");
        }
    }

    private static CanchaResponse ToResponse(Cancha c) =>
        new(c.IdCancha, c.Nombre, c.Tipo, c.Precio, c.Estado, c.IdEstablecimiento);
}