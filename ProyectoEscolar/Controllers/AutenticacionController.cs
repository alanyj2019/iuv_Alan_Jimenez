using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ProyectoEscolar.AccesoDatos.Data;
using ProyectoEscolar.Utilidades;
using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ProyectoEscolar.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AutenticacionController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AutenticacionController> _logger;

        public AutenticacionController(IConfiguration configuration, ApplicationDbContext context, ILogger<AutenticacionController> logger)
        {
            _configuration = configuration;
            _context = context;
            _logger = logger;
        }    

        [HttpGet("test-logs")]
        public ModelResponse TestLogs()
        {
            try
            {
                _logger.LogInformation("Probando diferentes niveles de log");
                _logger.LogDebug("Este es un mensaje de Debug");
                _logger.LogWarning("Este es un mensaje de Warning");
                _logger.LogError("Este es un mensaje de Error de prueba");

                // Simular una excepción para probar el logging
                try
                {
                    throw new InvalidOperationException("Excepción de prueba para verificar logging");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Excepción capturada durante prueba de logs");
                }

                return new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Logs de prueba generados exitosamente",
                    Data = new
                    {
                        Timestamp = DateTime.Now,
                        LogsGenerated = new[] { "Information", "Debug", "Warning", "Error" }
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogCritical(ex, "Error crítico durante prueba de logs");
                return new ModelResponse
                {
                    IsSuccess = false,
                    Message = "Error durante prueba de logs",
                    Data = null
                };
            }
        }

        [HttpPost("login")]
        public async Task<ModelResponse> GetToken([FromBody] LoginRequest request)
        {
            try
            {
                _logger.LogInformation("Intento de login para usuario: {Usuario}", request.Usuario);

                // Validar modelo contra las validaciones de datos
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Datos de entrada inválidos para login del usuario: {Usuario}", request.Usuario);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Datos de entrada inválidos",
                        Data = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    };
                }

                // Validar credenciales contra la base de datos
                var resultadoValidacion = await ValidarCredenciales(request.Usuario, request.Password);
                
                if (resultadoValidacion.IsSuccess)
                {
                    var token = GenerarToken(request.Usuario);
                    
                    // Actualizar último acceso
                    await ActualizarUltimoAcceso(request.Usuario);
                    
                    _logger.LogInformation("Login exitoso para usuario: {Usuario}", request.Usuario);
                    
                    return new ModelResponse
                    {
                        IsSuccess = true,
                        Message = "Token generado exitosamente",
                        Data = new { token = token, usuario = request.Usuario }
                    };
                }
                else
                {
                    _logger.LogWarning("Login fallido para usuario: {Usuario} - {Mensaje}", request.Usuario, resultadoValidacion.Message);
                    return resultadoValidacion;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error interno durante el login del usuario: {Usuario}", request.Usuario);
                return new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error interno del servidor: {ex.Message}",
                    Data = null
                };
            }
        }

        [HttpPost("cambiar-contrasena")]
        public async Task<ModelResponse> CambiarContrasena([FromBody] CambiarContrasenaRequest request)
        {
            try
            {
                _logger.LogInformation("Iniciando cambio de contraseña para usuario: {Usuario}", request.Usuario);
                
                if (!ModelState.IsValid)
                {
                    _logger.LogWarning("Datos inválidos para cambio de contraseña del usuario: {Usuario}", request.Usuario);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Datos de entrada inválidos",
                        Data = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
                    };
                }

                // Buscar usuario
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.NombreUsuario == request.Usuario && u.Activo);

                if (usuario == null)
                {
                    _logger.LogWarning("Usuario no encontrado para cambio de contraseña: {Usuario}", request.Usuario);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado",
                        Data = null
                    };
                }

                // Verificar contraseña actual
                if (!PasswordHelper.VerificarContrasena(request.ContrasenaActual, usuario.Contrasena ?? ""))
                {
                    _logger.LogWarning("Contraseña actual incorrecta para usuario: {Usuario}", request.Usuario);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Contraseña actual incorrecta",
                        Data = null
                    };
                }

                // Validar fortaleza de nueva contraseña
                var validacion = PasswordHelper.ValidarFortalezaContrasena(request.ContrasenaNueva);
                if (!validacion.EsValida)
                {
                    _logger.LogWarning("Nueva contraseña no cumple requisitos para usuario: {Usuario} - {Mensaje}", request.Usuario, validacion.Mensaje);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = $"La nueva contraseña no cumple los requisitos: {validacion.Mensaje}",
                        Data = null
                    };
                }

                // Actualizar contraseña
                usuario.Contrasena = PasswordHelper.CifrarContrasena(request.ContrasenaNueva);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Contraseña actualizada exitosamente para usuario: {Usuario}", request.Usuario);

                return new ModelResponse
                {
                    IsSuccess = true,
                    Message = "Contraseña actualizada exitosamente",
                    Data = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cambiar contraseña para usuario: {Usuario}", request.Usuario);
                return new ModelResponse
                {
                    IsSuccess = false,
                    Message = $"Error interno del servidor: {ex.Message}",
                    Data = null
                };
            }
        }

        private async Task<ModelResponse> ValidarCredenciales(string usuario, string password)
        {
            try
            {
                _logger.LogDebug("Validando credenciales para usuario: {Usuario}", usuario);
                
                // Buscar usuario en la base de datos
                var usuarioDb = await _context.Usuarios
                    .Include(u => u.Sucursal)
                    .Include(u => u.Rol)
                    .FirstOrDefaultAsync(u => u.NombreUsuario == usuario && u.Activo);

                if (usuarioDb == null)
                {
                    _logger.LogWarning("Usuario no encontrado o inactivo durante validación: {Usuario}", usuario);
                    return new ModelResponse
                    {
                        IsSuccess = false,
                        Message = "Usuario no encontrado o inactivo",
                        Data = null
                    };
                }

                // Si no tiene contraseña cifrada (primera vez), usar validación básica
                if (string.IsNullOrEmpty(usuarioDb.Contrasena))
                {
                    _logger.LogInformation("Primera vez cifrando contraseña para usuario: {Usuario}", usuario);
                    bool esValida = !string.IsNullOrEmpty(password) && password.Length >= 4;
                    
                    if (esValida)
                    {
                        // Cifrar y guardar la contraseña por primera vez
                        usuarioDb.Contrasena = PasswordHelper.CifrarContrasena(password);
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Contraseña cifrada y guardada por primera vez para usuario: {Usuario}", usuario);
                    }

                    return new ModelResponse
                    {
                        IsSuccess = esValida,
                        Message = esValida ? "Credenciales válidas" : "Credenciales inválidas",
                        Data = null
                    };
                }

                // Verificar contraseña cifrada
                bool passwordValida = PasswordHelper.VerificarContrasena(password, usuarioDb.Contrasena);
                
                _logger.LogDebug("Validación de contraseña completada para usuario: {Usuario} - Válida: {EsValida}", usuario, passwordValida);

                return new ModelResponse
                {
                    IsSuccess = passwordValida,
                    Message = passwordValida ? "Credenciales válidas" : "Credenciales inválidas",
                    Data = null
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error durante la validación de credenciales para usuario: {Usuario}", usuario);
                return new ModelResponse
                {
                    IsSuccess = false,
                    Message = "Error al validar credenciales",
                    Data = null
                };
            }
        }

        private async Task ActualizarUltimoAcceso(string usuario)
        {
            try
            {
                var usuarioDb = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.NombreUsuario == usuario);

                if (usuarioDb != null)
                {
                    // Si tienes un campo UltimoAcceso en la tabla, descomenta esta línea
                    // usuarioDb.UltimoAcceso = DateTime.Now;
                    await _context.SaveChangesAsync();
                    _logger.LogDebug("Último acceso actualizado para usuario: {Usuario}", usuario);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error al actualizar último acceso para usuario: {Usuario}", usuario);
                // No fallar el login si no se puede actualizar el último acceso
            }
        }

        private string GenerarToken(string usuario)
        {
            _logger.LogDebug("Generando JWT token para usuario: {Usuario}", usuario);
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, usuario),
                new Claim(ClaimTypes.NameIdentifier, usuario),
                new Claim(JwtRegisteredClaimNames.Sub, usuario),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:Issuer"],
                audience: _configuration["JWT:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_configuration["JWT:ExpirationInMinutes"])),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public string Usuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña es requerida")]
        [MinLength(4, ErrorMessage = "La contraseña debe tener al menos 4 caracteres")]
        public string Password { get; set; } = string.Empty;
    }

    public class CambiarContrasenaRequest
    {
        [Required(ErrorMessage = "El usuario es requerido")]
        public string Usuario { get; set; } = string.Empty;

        [Required(ErrorMessage = "La contraseña actual es requerida")]
        public string ContrasenaActual { get; set; } = string.Empty;

        [Required(ErrorMessage = "La nueva contraseña es requerida")]
        public string ContrasenaNueva { get; set; } = string.Empty;
    }
}
