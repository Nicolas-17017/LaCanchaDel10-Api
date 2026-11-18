using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Persistencia;

// Contexto de SOLO LECTURA: hereda el modelo de AppDbContext, no rastrea cambios
// y lanza una excepción si alguien intenta guardar. Lo usan las consultas.
public class LecturaDbContext : AppDbContext
{
    public LecturaDbContext(DbContextOptions<LecturaDbContext> options) : base(options)
    {
        ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
    }

    public override int SaveChanges(bool acceptAllChangesOnSuccess) =>
        throw new InvalidOperationException("LecturaDbContext es de solo lectura.");

    public override Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default) =>
        throw new InvalidOperationException("LecturaDbContext es de solo lectura.");
}