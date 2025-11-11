using Microsoft.EntityFrameworkCore;
using ProyectoEscolar.Modelos;

namespace ProyectoEscolar.AccesoDatos.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
    {
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Sucursal> Sucursales { get; set; }
        public DbSet<CatRol> CatRoles { get; set; }
        public DbSet<LogEntry> Logs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuraciones adicionales para las relaciones
            modelBuilder.Entity<Usuario>(entity =>
            {
                // Configurar índice único para el nombre de usuario
                entity.HasIndex(u => u.NombreUsuario)
                      .IsUnique()
                      .HasDatabaseName("UX_Usuario");

                // Configurar relación con Sucursal
                entity.HasOne(u => u.Sucursal)
                      .WithMany(s => s.Usuarios)
                      .HasForeignKey(u => u.SucursalId);

                // Configurar relación con CatRol
                entity.HasOne(u => u.Rol)
                      .WithMany(r => r.Usuarios)
                      .HasForeignKey(u => u.RolId);

                // Configurar valor por defecto para Activo usando SQL
                entity.Property(u => u.Activo)
                      .HasDefaultValueSql("1");
            });

            // Configurar Sucursal
            //modelBuilder.Entity<Sucursal>(entity =>
            //{
            //    entity.Property(s => s.Activa)
            //          .HasDefaultValueSql("1");

            //    entity.Property(s => s.FechaCreacion)
            //          .HasDefaultValueSql("GETDATE()");
            //});

            // Configurar CatRol
            //modelBuilder.Entity<CatRol>(entity =>
            //{
            //    entity.Property(r => r.Activo)
            //          .HasDefaultValueSql("1");

            //    entity.Property(r => r.FechaCreacion)
            //          .HasDefaultValueSql("GETDATE()");
            //});

            // Configurar LogEntry para Serilog
            modelBuilder.Entity<LogEntry>(entity =>
            {
                entity.Property(l => l.TimeStamp)
                      .HasDefaultValueSql("GETDATE()");

                // Índices para mejorar rendimiento de consultas de logs
                entity.HasIndex(l => l.TimeStamp)
                      .HasDatabaseName("IX_Logs_TimeStamp");

                entity.HasIndex(l => l.Level)
                      .HasDatabaseName("IX_Logs_Level");

                entity.HasIndex(l => new { l.Level, l.TimeStamp })
                      .HasDatabaseName("IX_Logs_Level_TimeStamp");
            });
        }
    }
}
