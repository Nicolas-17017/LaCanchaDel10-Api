using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/establecimientos")]
public class EstablecimientosController : ControllerBase
{
    private readonly IEstablecimientoService _service;

    public EstablecimientosController(IEstablecimientoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstablecimientoResponse>>> ObtenerTodos([FromQuery] int? idPropietario)
    {
        return Ok(await _service.ObtenerTodosAsync(idPropietario));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EstablecimientoResponse>> ObtenerPorId(int id)
    {
        return Ok(await _service.ObtenerPorIdAsync(id));
    }

    [Authorize(Roles = "Propietario")]
    [HttpPost]
    public async Task<ActionResult<EstablecimientoResponse>> Crear(EstablecimientoRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var establecimiento = await _service.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = establecimiento.IdEstablecimiento }, establecimiento);
    }

    [Authorize(Roles = "Propietario")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EstablecimientoResponse>> Actualizar(int id, EstablecimientoRequest request)
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
}