using System.Net;
using System.Text.Json;

namespace LaCanchaDel10.Api.Comun;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            var status = ex switch
            {
                NotFoundException => HttpStatusCode.NotFound,
                ConflictException => HttpStatusCode.Conflict,
                ForbiddenException => HttpStatusCode.Forbidden,
                BadRequestException => HttpStatusCode.BadRequest,
                UnauthorizedAccessException => HttpStatusCode.Unauthorized,
                _ => HttpStatusCode.InternalServerError
            };

            if (status == HttpStatusCode.InternalServerError)
            {
                _logger.LogError(ex, "Error no controlado");
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;

            var payload = JsonSerializer.Serialize(new { mensaje = ex.Message });
            await context.Response.WriteAsync(payload);
        }
    }
}