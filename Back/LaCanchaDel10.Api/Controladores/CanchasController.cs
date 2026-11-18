using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios.Comandos;
using LaCanchaDel10.Api.Servicios.Consultas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/canchas")]
public class CanchasController : ControllerBase
{
    private readonly ICanchaConsultas _consultas;
    private readonly ICanchaComandos _comandos;

    public CanchasController(ICanchaConsultas consultas, ICanchaComandos comandos)
    {
        _consultas = consultas;
        _comandos = comandos;
    }

    /// <summary>Lista canchas con su establecimiento. Filtros: idEstablecimiento, tipo, soloActivas. [Consulta]</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CanchaDetalleResponse>>> ObtenerTodas(
        [FromQuery] int? idEstablecimiento, [FromQuery] string? tipo, [FromQuery] bool soloActivas = false)
    {
        return Ok(await _consultas.ObtenerTodasAsync(idEstablecimiento, tipo, soloActivas));
    }

    /// <summary>Consulta una cancha. [Consulta]</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CanchaDetalleResponse>> ObtenerPorId(int id)
    {
        return Ok(await _consultas.ObtenerPorIdAsync(id));
    }

    /// <summary>Horarios de una cancha, opcionalmente filtrados por fecha (yyyy-MM-dd). [Consulta]</summary>
    [HttpGet("{id:int}/horarios")]
    public async Task<ActionResult<IEnumerable<HorarioResponse>>> ObtenerHorarios(int id, [FromQuery] DateOnly? fecha)
    {
        return Ok(await _consultas.ObtenerHorariosAsync(id, fecha));
    }

    /// <summary>Reservas de una cancha propia (propietario). [Consulta]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpGet("{id:int}/reservas")]
    public async Task<ActionResult<IEnumerable<ReservaDetalleResponse>>> ObtenerReservas(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _consultas.ObtenerReservasAsync(id, idActual));
    }

    /// <summary>Registra una cancha en un establecimiento propio. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpPost]
    public async Task<ActionResult<CanchaResponse>> Crear(CanchaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cancha = await _comandos.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = cancha.IdCancha }, cancha);
    }

    /// <summary>Actualiza una cancha propia. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CanchaResponse>> Actualizar(int id, CanchaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _comandos.ActualizarAsync(id, request, idActual));
    }

    /// <summary>Desactiva una cancha propia. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _comandos.EliminarAsync(id, idActual);
        return NoContent();
    }
}