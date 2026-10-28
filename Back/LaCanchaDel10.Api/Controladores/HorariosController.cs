using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/horarios")]
[Authorize(Roles = "Propietario")]
public class HorariosController : ControllerBase
{
    private readonly IHorarioService _service;

    public HorariosController(IHorarioService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<ActionResult<HorarioResponse>> Crear(HorarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var horario = await _service.CrearAsync(request, idActual);
        return StatusCode(201, horario);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<HorarioResponse>> Actualizar(int id, HorarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _service.ActualizarAsync(id, request, idActual));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _service.EliminarAsync(id, idActual);
        return NoContent();
    }
}