using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios.Comandos;
using LaCanchaDel10.Api.Servicios.Consultas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/establecimientos")]
public class EstablecimientosController : ControllerBase
{
    private readonly IEstablecimientoConsultas _consultas;
    private readonly IEstablecimientoComandos _comandos;

    public EstablecimientosController(IEstablecimientoConsultas consultas, IEstablecimientoComandos comandos)
    {
        _consultas = consultas;
        _comandos = comandos;
    }

    /// <summary>Lista establecimientos; filtra por propietario opcionalmente. [Consulta]</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstablecimientoResponse>>> ObtenerTodos([FromQuery] int? idPropietario)
    {
        return Ok(await _consultas.ObtenerTodosAsync(idPropietario));
    }

    /// <summary>Consulta un establecimiento. [Consulta]</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EstablecimientoResponse>> ObtenerPorId(int id)
    {
        return Ok(await _consultas.ObtenerPorIdAsync(id));
    }

    /// <summary>Registra un establecimiento para el propietario autenticado. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpPost]
    public async Task<ActionResult<EstablecimientoResponse>> Crear(EstablecimientoRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var establecimiento = await _comandos.CrearAsync(request, idActual);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = establecimiento.IdEstablecimiento }, establecimiento);
    }

    /// <summary>Actualiza un establecimiento propio. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EstablecimientoResponse>> Actualizar(int id, EstablecimientoRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _comandos.ActualizarAsync(id, request, idActual));
    }

    /// <summary>Elimina un establecimiento propio. [Comando]</summary>
    [Authorize(Roles = "Propietario")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _comandos.EliminarAsync(id, idActual);
        return NoContent();
    }
}