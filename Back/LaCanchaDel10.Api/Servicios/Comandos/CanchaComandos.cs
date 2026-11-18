using LaCanchaDel10.Api.Comun;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Modelos;
using LaCanchaDel10.Api.Persistencia;

namespace LaCanchaDel10.Api.Servicios.Comandos;

public interface ICanchaComandos
{
    Task<CanchaResponse> CrearAsync(CanchaRequest request, int idUsuarioActual);
    Task<CanchaResponse> ActualizarAsync(int id, CanchaRequest request, int idUsuarioActual);
    Task EliminarAsync(int id, int idUsuarioActual);
}

public class CanchaComandos : ICanchaComandos
{
    private readonly AppDbContext _db;

    public CanchaComandos(AppDbContext db)
    {
        _db = db;
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

        // Se desactiva en lugar de borrar para no perder el historial de reservas.
        cancha.Estado = EstadoCancha.Inactiva;
        await _db.SaveChangesAsync();
    }

    private async Task ValidarPropietarioDelEstablecimientoAsync(int idEstablecimiento, int idUsuarioActual)
    {
        var establecimiento = await _db.Establecimientos.FindAsync(idEstablecimiento)
            ?? throw new NotFoundException("Establecimiento no encontrado.");

        if (establecimiento.IdPropietario != idUsuarioActual)
            throw new ForbiddenException("No administras este establecimiento.");
    }

    private static CanchaResponse ToResponse(Cancha c) =>
        new(c.IdCancha, c.Nombre, c.Tipo, c.Precio, c.Estado, c.IdEstablecimiento);
}