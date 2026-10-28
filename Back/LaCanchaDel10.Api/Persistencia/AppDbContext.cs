using LaCanchaDel10.Api.Modelos;
using Microsoft.EntityFrameworkCore;

namespace LaCanchaDel10.Api.Persistencia;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Establecimiento> Establecimientos => Set<Establecimiento>();
    public DbSet<Cancha> Canchas => Set<Cancha>();
    public DbSet<Horario> Horarios => Set<Horario>();
    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Usuario>(e =>
        {
            e.ToTable("Usuario");
            e.HasKey(u => u.IdUsuario);
            e.Property(u => u.ContrasenaHash).HasColumnName("Contrasena").HasMaxLength(255);
            e.Property(u => u.TipoUsuario).HasConversion<string>().HasMaxLength(20);
            e.HasIndex(u => u.Correo).IsUnique();
        });

        modelBuilder.Entity<Establecimiento>(e =>
        {
            e.ToTable("Establecimiento");
            e.HasKey(x => x.IdEstablecimiento);
            e.HasOne(x => x.Propietario)
                .WithMany(u => u.Establecimientos)
                .HasForeignKey(x => x.IdPropietario)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Cancha>(e =>
        {
            e.ToTable("Cancha");
            e.HasKey(x => x.IdCancha);
            e.Property(x => x.Estado).HasConversion<string>().HasMaxLength(20);
            e.HasOne(x => x.Establecimiento)
                .WithMany(es => es.Canchas)
                .HasForeignKey(x => x.IdEstablecimiento)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Horario>(e =>
        {
            e.ToTable("Horario");
            e.HasKey(x => x.IdHorario);
            e.HasOne(x => x.Cancha)
                .WithMany(c => c.Horarios)
                .HasForeignKey(x => x.IdCancha)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.IdCancha, x.Fecha, x.HoraInicio }).IsUnique();
        });

        modelBuilder.Entity<Reserva>(e =>
        {
            e.ToTable("Reserva");
            e.HasKey(x => x.IdReserva);
            e.Property(x => x.Estado).HasConversion<string>().HasMaxLength(20);

            e.HasOne(x => x.Usuario)
                .WithMany(u => u.Reservas)
                .HasForeignKey(x => x.IdUsuario)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Cancha)
                .WithMany(c => c.Reservas)
                .HasForeignKey(x => x.IdCancha)
                .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(x => x.Horario)
            .WithMany(h => h.Reservas)
            .HasForeignKey(x => x.IdHorario)
            .OnDelete(DeleteBehavior.Restrict);

            e.HasIndex(x => x.IdHorario).IsUnique();
        });
    }
}