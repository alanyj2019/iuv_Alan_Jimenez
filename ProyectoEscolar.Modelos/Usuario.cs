using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ProyectoEscolar.Modelos
{
    [Table("Usuario", Schema = "core")]
    public class Usuario
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int UsuarioId { get; set; }

        [Required]
        [ForeignKey("Sucursal")]
        public int SucursalId { get; set; }

        [Required]
        [ForeignKey("Rol")]
        public int RolId { get; set; }

        [Required]
        [MaxLength(80)]
        [Column("Usuario")]
        public string NombreUsuario { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        public bool Activo { get; set; } = true;

        [MaxLength(250)]
        public string? Contrasena { get; set; }

        // Navigation Properties
        public virtual Sucursal? Sucursal { get; set; }
        public virtual CatRol? Rol { get; set; }
    }

    // Modelo para Sucursal
    [Table("Sucursal", Schema = "core")]
    public class Sucursal
    {
        [Key]
        public int SucursalId { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Nombre { get; set; } = string.Empty;
        
        [MaxLength(300)]
        public string? Clave { get; set; }
                
        public bool Activa { get; set; } = true;

        public string? Contrasena { get; set; } 

        // Navigation Properties
        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }

    // Modelo para CatRol
    [Table("CatRol", Schema = "ref")]
    public class CatRol
    {
        [Key]
        public int RolId { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;
        
       
        // Navigation Properties
        public virtual ICollection<Usuario> Usuarios { get; set; } = new List<Usuario>();
    }

    // Modelo para Logs de Serilog
    [Table("Logs", Schema = "dbo")]
    public class LogEntry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string? Message { get; set; }

        [MaxLength(128)]
        public string? Level { get; set; }

        public DateTime TimeStamp { get; set; }

        public string? Exception { get; set; }

        [MaxLength(128)]
        public string? LogEvent { get; set; }

        [MaxLength(1024)]
        public string? Properties { get; set; }

        [MaxLength(128)]
        public string? MachineName { get; set; }

        [MaxLength(256)]
        public string? UserName { get; set; }

        [MaxLength(512)]
        public string? SourceContext { get; set; }
    }
}
