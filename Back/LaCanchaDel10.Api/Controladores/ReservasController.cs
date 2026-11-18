using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios.Comandos;
using LaCanchaDel10.Api.Servicios.Consultas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/reservas")]
[Authorize]
public class ReservasController : ControllerBase
{
    private readonly IReservaConsultas _consultas;
    private readonly IReservaComandos _comandos;

    public ReservasController(IReservaConsultas consultas, IReservaComandos comandos)
    {
        _consultas = consultas;
        _comandos = comandos;
    }

    /// <summary>Reservas del usuario autenticado, con cancha, fecha y hora. [Consulta]</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaDetalleResponse>>> ObtenerMias()
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _consultas.ObtenerMisReservasAsync(idActual));
    }

    /// <summary>Detalle de una reserva. [Consulta]</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservaDetalleResponse>> ObtenerPorId(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _consultas.ObtenerPorIdAsync(id, idActual));
    }

    /// <summary>Reserva un horario disponible. [Comando]</summary>
    [HttpPost]
    public async Task<ActionResult<ReservaResponse>> Crear(ReservaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var reserva = await _comandos.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = reserva.IdReserva }, reserva);
    }

    /// <summary>Cambia el estado de una reserva (propietario de la cancha). [Comando]</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ReservaResponse>> ActualizarEstado(int id, ActualizarReservaRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _comandos.ActualizarEstadoAsync(id, request, idActual));
    }

    /// <summary>Cancela una reserva propia y libera el horario. [Comando]</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _comandos.CancelarAsync(id, idActual);
        return NoContent();
    }
}