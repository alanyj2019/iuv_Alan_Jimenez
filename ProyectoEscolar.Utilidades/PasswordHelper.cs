using BCrypt.Net;

namespace ProyectoEscolar.Utilidades
{
    /// <summary>
    /// Clase de utilidades para el cifrado y verificación segura de contraseñas
    /// Utiliza BCrypt que es una función de hash segura diseñada para contraseñas
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// Cifra una contraseña usando BCrypt con salt automático
        /// </summary>
        /// <param name="password">Contraseña en texto plano</param>
        /// <param name="workFactor">Factor de trabajo para BCrypt (por defecto 12, mayor = más seguro pero más lento)</param>
        /// <returns>Contraseña cifrada con salt incluido</returns>
        public static string CifrarContrasena(string password, int workFactor = 12)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("La contraseña no puede estar vacía", nameof(password));

            // BCrypt.HashPassword genera automáticamente un salt único y lo incluye en el hash
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor);
        }

        /// <summary>
        /// Verifica si una contraseña en texto plano coincide con el hash almacenado
        /// </summary>
        /// <param name="password">Contraseña en texto plano a verificar</param>
        /// <param name="hashedPassword">Hash de contraseña almacenado en la base de datos</param>
        /// <returns>True si la contraseña coincide, False en caso contrario</returns>
        public static bool VerificarContrasena(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            if (string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                // BCrypt.Verify compara automáticamente la contraseña con el hash y salt
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                // En caso de error en la verificación, retornar false por seguridad
                return false;
            }
        }

        /// <summary>
        /// Valida que una contraseña cumpla con criterios básicos de seguridad
        /// </summary>
        /// <param name="password">Contraseña a validar</param>
        /// <returns>ResultadoValidacion con el resultado y mensaje</returns>
        public static ResultadoValidacion ValidarFortalezaContrasena(string password)
        {
            if (string.IsNullOrEmpty(password))
                return new ResultadoValidacion(false, "La contraseña no puede estar vacía");

            var errores = new List<string>();

            // Longitud mínima
            if (password.Length < 8)
                errores.Add("Debe tener al menos 8 caracteres");

            // Al menos una mayúscula
            if (!password.Any(char.IsUpper))
                errores.Add("Debe contener al menos una letra mayúscula");

            // Al menos una minúscula
            if (!password.Any(char.IsLower))
                errores.Add("Debe contener al menos una letra minúscula");

            // Al menos un número
            if (!password.Any(char.IsDigit))
                errores.Add("Debe contener al menos un número");

            // Al menos un carácter especial
            if (!password.Any(c => !char.IsLetterOrDigit(c)))
                errores.Add("Debe contener al menos un carácter especial");

            bool esValida = !errores.Any();
            string mensaje = esValida 
                ? "La contraseña cumple con los criterios de seguridad" 
                : string.Join(", ", errores);

            return new ResultadoValidacion(esValida, mensaje);
        }

        /// <summary>
        /// Genera una contraseña aleatoria segura
        /// </summary>
        /// <param name="longitud">Longitud de la contraseña (mínimo 8)</param>
        /// <returns>Contraseña aleatoria que cumple con los criterios de seguridad</returns>
        public static string GenerarContrasenaAleatoria(int longitud = 12)
        {
            if (longitud < 8)
                throw new ArgumentException("La longitud mínima debe ser 8 caracteres", nameof(longitud));

            const string mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string minusculas = "abcdefghijklmnopqrstuvwxyz";
            const string numeros = "0123456789";
            const string especiales = "!@#$%^&*()-_=+[]{}|;:,.<>?";
            
            var random = new Random();
            var password = new char[longitud];

            // Garantizar al menos un carácter de cada tipo
            password[0] = mayusculas[random.Next(mayusculas.Length)];
            password[1] = minusculas[random.Next(minusculas.Length)];
            password[2] = numeros[random.Next(numeros.Length)];
            password[3] = especiales[random.Next(especiales.Length)];

            // Llenar el resto aleatoriamente
            string todosCaracteres = mayusculas + minusculas + numeros + especiales;
            for (int i = 4; i < longitud; i++)
            {
                password[i] = todosCaracteres[random.Next(todosCaracteres.Length)];
            }

            // Mezclar el array para evitar patrones predecibles
            for (int i = 0; i < longitud; i++)
            {
                int randomIndex = random.Next(longitud);
                (password[i], password[randomIndex]) = (password[randomIndex], password[i]);
            }

            return new string(password);
        }
    }

    /// <summary>
    /// Resultado de validación de contraseña
    /// </summary>
    public class ResultadoValidacion
    {
        public bool EsValida { get; }
        public string Mensaje { get; }

        public ResultadoValidacion(bool esValida, string mensaje)
        {
            EsValida = esValida;
            Mensaje = mensaje;
        }
    }
}