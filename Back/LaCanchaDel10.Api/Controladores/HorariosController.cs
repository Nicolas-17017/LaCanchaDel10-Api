using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios.Comandos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/horarios")]
[Authorize(Roles = "Propietario")]
public class HorariosController : ControllerBase
{
    private readonly IHorarioComandos _comandos;

    public HorariosController(IHorarioComandos comandos)
    {
        _comandos = comandos;
    }

    /// <summary>Publica un horario para una cancha propia. [Comando]</summary>
    [HttpPost]
    public async Task<ActionResult<HorarioResponse>> Crear(HorarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var horario = await _comandos.CrearAsync(request, idActual);
        return StatusCode(201, horario);
    }

    /// <summary>Actualiza un horario sin reserva. [Comando]</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<HorarioResponse>> Actualizar(int id, HorarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _comandos.ActualizarAsync(id, request, idActual));
    }

    /// <summary>Elimina un horario sin reserva. [Comando]</summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _comandos.EliminarAsync(id, idActual);
        return NoContent();
    }
}