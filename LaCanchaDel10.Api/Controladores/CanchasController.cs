using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/canchas")]
public class CanchasController : ControllerBase
{
    private readonly ICanchaService _service;

    public CanchasController(ICanchaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CanchaResponse>>> ObtenerTodas([FromQuery] int? idEstablecimiento, [FromQuery] string? tipo)
    {
        return Ok(await _service.ObtenerTodasAsync(idEstablecimiento, tipo));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CanchaResponse>> ObtenerPorId(int id)
    {
        return Ok(await _service.ObtenerPorIdAsync(id));
    }

    [Authorize(Roles = "Propietario")]
    [HttpPost]
    public async Task<ActionResult<CanchaResponse>> Crear(CanchaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cancha = await _service.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = cancha.IdCancha }, cancha);
    }

    [Authorize(Roles = "Propietario")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CanchaResponse>> Actualizar(int id, CanchaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ActualizarAsync(id, request, idActual));
    }

    [Authorize(Roles = "Propietario")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.EliminarAsync(id, idActual);
        return NoContent();
    }

    [HttpGet("{id:int}/horarios")]
    public async Task<ActionResult<IEnumerable<HorarioResponse>>> ObtenerHorarios(int id, [FromQuery] DateOnly? fecha)
    {
        return Ok(await _service.ObtenerHorariosAsync(id, fecha));
    }

    [Authorize(Roles = "Propietario")]
    [HttpGet("{id:int}/reservas")]
    public async Task<ActionResult<IEnumerable<ReservaResponse>>> ObtenerReservas(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ObtenerReservasAsync(id, idActual));
    }
}