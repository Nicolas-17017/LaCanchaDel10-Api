using System.Security.Claims;
using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios.Comandos;
using LaCanchaDel10.Api.Servicios.Consultas;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/usuarios")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioConsultas _consultas;
    private readonly IUsuarioComandos _comandos;

    public UsuariosController(IUsuarioConsultas consultas, IUsuarioComandos comandos)
    {
        _consultas = consultas;
        _comandos = comandos;
    }

    /// <summary>Registra un nuevo usuario (cliente o propietario). [Comando]</summary>
    [HttpPost]
    public async Task<ActionResult<UsuarioResponse>> Registrar(RegistrarUsuarioRequest request)
    {
        var usuario = await _comandos.RegistrarAsync(request);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = usuario.IdUsuario }, usuario);
    }

    /// <summary>Consulta un usuario por id. [Consulta]</summary>
    [Authorize]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<UsuarioResponse>> ObtenerPorId(int id)
    {
        return Ok(await _consultas.ObtenerPorIdAsync(id));
    }

    /// <summary>Actualiza el perfil del usuario autenticado. [Comando]</summary>
    [Authorize]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<UsuarioResponse>> Actualizar(int id, ActualizarUsuarioRequest request)
    {
        var idActual = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return Ok(await _comandos.ActualizarAsync(id, request, idActual));
    }
}