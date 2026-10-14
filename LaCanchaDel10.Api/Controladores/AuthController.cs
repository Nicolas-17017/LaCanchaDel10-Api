using LaCanchaDel10.Api.Dtos;
using LaCanchaDel10.Api.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace LaCanchaDel10.Api.Controladores;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }
}