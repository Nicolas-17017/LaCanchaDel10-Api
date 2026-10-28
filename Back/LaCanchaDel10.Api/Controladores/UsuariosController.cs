using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpPost]
    public async Task<ActionResult<UsuarioResponse>> Registrar(RegistrarUsuarioRequest request)
    {
        var usuario = await _usuarioService.RegistrarAsync(request);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.IdUsuario }, usuario);
    }

    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioResponse>> ObtenerPorId(int id)
    {
        return Ok(await _usuarioService.ObtenerPorIdAsync(id));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<UsuarioResponse>> Actualizar(int id, ActualizarUsuarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _usuarioService.ActualizarAsync(id, request, idActual));
    }
}