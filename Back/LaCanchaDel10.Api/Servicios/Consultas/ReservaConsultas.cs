using System.Linq.Expressions;
using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios.Consultas;

public interface IReservaConsultas
{
    Task<IEnumerable<ReservaDetalleResponse>> ObtenerMisReservasAsync(int idUsuarioActual);
    Task<ReservaDetalleResponse> ObtenerPorIdAsync(int id, int idUsuarioActual);
}

public class ReservaConsultas : IReservaConsultas
{
    // Proyección compartida: la reutiliza también CanchaConsultas (reservas de una cancha).
    public static readonly Expression<Func<Reserva, ReservaDetalleResponse>> Proyeccion = r =>
        new ReservaDetalleResponse(
            r.IdReserva, r.FechaReserva, r.Estado, r.Precio,
            r.IdUsuario, r.Usuario!.Nombre,
            r.IdCancha, r.Cancha!.Nombre, r.Cancha.Establecimiento!.Nombre, r.Cancha.Establecimiento.Direccion,
            r.IdHorario, r.Horario!.Fecha, r.Horario.HoraInicio, r.Horario.HoraFin);

    private readonly LecturaDbContext _db;

    public ReservaConsultas(LecturaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<ReservaDetalleResponse>> ObtenerMisReservasAsync(int idUsuarioActual)
    {
        return await _db.Reservas
            .Where(r => r.IdUsuario == idUsuarioActual)
            .OrderByDescending(r => r.FechaReserva)
            .Select(Proyeccion)
            .ToListAsync();
    }

    public async Task<ReservaDetalleResponse> ObtenerPorIdAsync(int id, int idUsuarioActual)
    {
        var datos = await _db.Reservas
            .Where(r => r.IdReserva == id)
            .Select(r => new { r.IdUsuario, IdPropietario = r.Cancha!.Establecimiento!.IdPropietario })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Reserva no encontrada.");

        // La puede ver quien la hizo o el propietario de la cancha.
        if (datos.IdUsuario != idUsuarioActual && datos.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No puedes consultar esta reserva.");

        return await _db.Reservas
            .Where(r => r.IdReserva == id)
            .Select(Proyeccion)
            .FirstAsync();
    }
}