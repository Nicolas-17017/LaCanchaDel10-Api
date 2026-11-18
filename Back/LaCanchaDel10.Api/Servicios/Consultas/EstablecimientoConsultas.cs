using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Persistencia;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Servicios.Consultas;

public interface IEstablecimientoConsultas
{
    Task<IEnumerable<EstablecimientoResponse>> ObtenerTodosAsync(int? idPropietario);
    Task<EstablecimientoResponse> ObtenerPorIdAsync(int id);
}

public class EstablecimientoConsultas : IEstablecimientoConsultas
{
    private readonly LecturaDbContext _db;

    public EstablecimientoConsultas(LecturaDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<EstablecimientoResponse>> ObtenerTodosAsync(int? idPropietario)
    {
        var query = _db.Establecimientos.AsQueryable();

        if (idPropietario is not null)
            query = query.Where(e => e.IdPropietario == idPropietario);

        return await query
            .OrderBy(e => e.Nombre)
            .Select(e => new EstablecimientoResponse(
                e.IdEstablecimiento, e.Nombre, e.Direccion, e.Telefono, e.Descripcion, e.IdPropietario))
            .ToListAsync();
    }

    public async Task<EstablecimientoResponse> ObtenerPorIdAsync(int id)
    {
        var establecimiento = await _db.Establecimientos
            .Where(e => e.IdEstablecimiento == id)
            .Select(e => new EstablecimientoResponse(
                e.IdEstablecimiento, e.Nombre, e.Direccion, e.Telefono, e.Descripcion, e.IdPropietario))
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        return establecimiento;
    }
}