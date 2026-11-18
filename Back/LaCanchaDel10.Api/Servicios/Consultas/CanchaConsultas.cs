using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios.Consultas;

public interface ICanchaConsultas
{
    Task<IEnumerable<CanchaDetalleResponse>> ObtenerTodasAsync(int? idEstablecimiento, string? tipo, bool soloActivas);
    Task<CanchaDetalleResponse> ObtenerPorIdAsync(int id);
    Task<IEnumerable<HorarioResponse>> ObtenerHorariosAsync(int idCancha, DateOnly? fecha);
    Task<IEnumerable<ReservaDetalleResponse>> ObtenerReservasAsync(int idCancha, int idUsuarioActual);
}

public class CanchaConsultas : ICanchaConsultas
{
    private readonly LecturaDbContext _db;

    public CanchaConsultas(LecturaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<CanchaDetalleResponse>> ObtenerTodasAsync(int? idEstablecimiento, string? tipo, bool soloActivas)
    {
        var query = _db.Canchas.AsQueryable();

        if (idEstablecimiento is not null)
            query = query.Where(c => c.IdEstablecimiento == idEstablecimiento);

        if (!string.IsNullOrWhiteSpace(tipo))
            query = query.Where(c => c.Tipo == tipo);

        if (soloActivas)
            query = query.Where(c => c.Estado == EstadoCancha.Activa);

        return await query
            .OrderBy(c => c.Nombre)
            .Select(c => new CanchaDetalleResponse(
                c.IdCancha, c.Nombre, c.Tipo, c.Precio, c.Estado,
                c.IdEstablecimiento, c.Establecimiento!.Nombre, c.Establecimiento.Direccion))
            .ToListAsync();
    }

    public async Task<CanchaDetalleResponse> ObtenerPorIdAsync(int id)
    {
        var cancha = await _db.Canchas
            .Where(c => c.IdCancha == id)
            .Select(c => new CanchaDetalleResponse(
                c.IdCancha, c.Nombre, c.Tipo, c.Precio, c.Estado,
                c.IdEstablecimiento, c.Establecimiento!.Nombre, c.Establecimiento.Direccion))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Cancha no encontrada.");

        return cancha;
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

    public async Task<IEnumerable<ReservaDetalleResponse>> ObtenerReservasAsync(int idCancha, int idUsuarioActual)
    {
        var cancha = await _db.Canchas.Include(c => c.Establecimiento)
            .FirstOrDefaultAsync(c => c.IdCancha == idCancha)
            ?? throw new NotFoundException("Cancha no encontrada.");

        if (cancha.Establecimiento!.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No administras esta cancha.");

        return await _db.Reservas
            .Where(r => r.IdCancha == idCancha)
            .OrderByDescending(r => r.FechaReserva)
            .Select(ReservaConsultas.Proyeccion)
            .ToListAsync();
    }
}