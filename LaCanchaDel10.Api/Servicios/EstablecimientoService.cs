using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios;

public interface IEstablecimientoService
{
    Task<IEnumerable<EstablecimientoResponse>> ObtenerTodosAsync(int? idPropietario);
    Task<EstablecimientoResponse> ObtenerPorIdAsync(int id);
    Task<EstablecimientoResponse> CrearAsync(EstablecimientoRequest request, int idPropietario);
    Task<EstablecimientoResponse> ActualizarAsync(int id, EstablecimientoRequest request, int idUsuarioActual);
    Task EliminarAsync(int id, int idUsuarioActual);
}

public class EstablecimientoService : IEstablecimientoService
{
    private readonly AppDbContext _db;

    public EstablecimientoService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<EstablecimientoResponse>> ObtenerTodosAsync(int? idPropietario)
    {
        var query = _db.Establecimientos.AsQueryable();

        if (idPropietario is not null)
        {
            query = query.Where(e => e.IdPropietario == idPropietario);
        }

        return await query.Select(e => ToResponse(e)).ToListAsync();
    }

    public async Task<EstablecimientoResponse> ObtenerPorIdAsync(int id)
    {
        var establecimiento = await _db.Establecimientos.FindAsync(id)
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        return ToResponse(establecimiento);
    }

    public async Task<EstablecimientoResponse> CrearAsync(EstablecimientoRequest request, int idPropietario)
    {
        var establecimiento = new Establecimiento
        {
            Nombre = request.Nombre,
            Direccion = request.Direccion,
            Telefono = request.Telefono,
            Descripcion = request.Descripcion,
            IdPropietario = idPropietario
        };

        _db.Establecimientos.Add(establecimiento);
        await _db.SaveChangesAsync();

        return ToResponse(establecimiento);
    }

    public async Task<EstablecimientoResponse> ActualizarAsync(int id, EstablecimientoRequest request, int idUsuarioActual)
    {
        var establecimiento = await _db.Establecimientos.FindAsync(id)
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        if (establecimiento.IdPropietario != idUsuarioActual)
        {
            throw new ForbiddenException("No administras este establecimiento.");
        }

        establecimiento.Nombre = request.Nombre;
        establecimiento.Direccion = request.Direccion;
        establecimiento.Telefono = request.Telefono;
        establecimiento.Descripcion = request.Descripcion;

        await _db.SaveChangesAsync();

        return ToResponse(establecimiento);
    }

    public async Task EliminarAsync(int id, int idUsuarioActual)
    {
        var establecimiento = await _db.Establecimientos.FindAsync(id)
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        if (establecimiento.IdPropietario != idUsuarioActual)
        {
            throw new ForbiddenException("No administras este establecimiento.");
        }

        _db.Establecimientos.Remove(establecimiento);
        await _db.SaveChangesAsync();
    }

    private static EstablecimientoResponse ToResponse(Establecimiento e) =>
        new(e.IdEstablecimiento, e.Nombre, e.Direccion, e.Telefono, e.Descripcion, e.IdPropietario);
}