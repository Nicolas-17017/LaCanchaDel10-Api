using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/reservas")]
[Authorize]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _service;

    public ReservasController(IReservaService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<ReservaResponse>> Crear(ReservaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var reserva = await _service.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = reserva.IdReserva }, reserva);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaResponse>>> ObtenerMias()
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ObtenerMisReservasAsync(idActual));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservaResponse>> ObtenerPorId(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ObtenerPorIdAsync(id, idActual));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ReservaResponse>> ActualizarEstado(int id, ActualizarReservaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ActualizarEstadoAsync(id, request, idActual));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.CancelarAsync(id, idActual);
        return NoContent();
    }
}