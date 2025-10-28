using BCrypt.Net;

namespace ProyectoEscolar.Utilidades
{
    /// <summary>
    /// Clase de utilidades para el cifrado y verificaci�n segura de contrase�as
    /// Utiliza BCrypt que es una funci�n de hash segura dise�ada para contrase�as
    /// </summary>
    public static class PasswordHelper
    {
        /// <summary>
        /// Cifra una contrase�a usando BCrypt con salt autom�tico
        /// </summary>
        /// <param name="password">Contrase�a en texto plano</param>
        /// <param name="workFactor">Factor de trabajo para BCrypt (por defecto 12, mayor = m�s seguro pero m�s lento)</param>
        /// <returns>Contrase�a cifrada con salt incluido</returns>
        public static string CifrarContrasena(string password, int workFactor = 12)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("La contrase�a no puede estar vac�a", nameof(password));

            // BCrypt.HashPassword genera autom�ticamente un salt �nico y lo incluye en el hash
            return BCrypt.Net.BCrypt.HashPassword(password, workFactor);
        }

        /// <summary>
        /// Verifica si una contrase�a en texto plano coincide con el hash almacenado
        /// </summary>
        /// <param name="password">Contrase�a en texto plano a verificar</param>
        /// <param name="hashedPassword">Hash de contrase�a almacenado en la base de datos</param>
        /// <returns>True si la contrase�a coincide, False en caso contrario</returns>
        public static bool VerificarContrasena(string password, string hashedPassword)
        {
            if (string.IsNullOrEmpty(password))
                return false;

            if (string.IsNullOrEmpty(hashedPassword))
                return false;

            try
            {
                // BCrypt.Verify compara autom�ticamente la contrase�a con el hash y salt
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                // En caso de error en la verificaci�n, retornar false por seguridad
                return false;
            }
        }

        /// <summary>
        /// Valida que una contrase�a cumpla con criterios b�sicos de seguridad
        /// </summary>
        /// <param name="password">Contrase�a a validar</param>
        /// <returns>ResultadoValidacion con el resultado y mensaje</returns>
        public static ResultadoValidacion ValidarFortalezaContrasena(string password)
        {
            if (string.IsNullOrEmpty(password))
                return new ResultadoValidacion(false, "La contrase�a no puede estar vac�a");

            var errores = new List<string>();

            // Longitud m�nima
            if (password.Length < 8)
                errores.Add("Debe tener al menos 8 caracteres");

            // Al menos una may�scula
            if (!password.Any(char.IsUpper))
                errores.Add("Debe contener al menos una letra may�scula");

            // Al menos una min�scula
            if (!password.Any(char.IsLower))
                errores.Add("Debe contener al menos una letra min�scula");

            // Al menos un n�mero
            if (!password.Any(char.IsDigit))
                errores.Add("Debe contener al menos un n�mero");

            // Al menos un car�cter especial
            if (!password.Any(c => !char.IsLetterOrDigit(c)))
                errores.Add("Debe contener al menos un car�cter especial");

            bool esValida = !errores.Any();
            string mensaje = esValida 
                ? "La contrase�a cumple con los criterios de seguridad" 
                : string.Join(", ", errores);

            return new ResultadoValidacion(esValida, mensaje);
        }

        /// <summary>
        /// Genera una contrase�a aleatoria segura
        /// </summary>
        /// <param name="longitud">Longitud de la contrase�a (m�nimo 8)</param>
        /// <returns>Contrase�a aleatoria que cumple con los criterios de seguridad</returns>
        public static string GenerarContrasenaAleatoria(int longitud = 12)
        {
            if (longitud < 8)
                throw new ArgumentException("La longitud m�nima debe ser 8 caracteres", nameof(longitud));

            const string mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            const string minusculas = "abcdefghijklmnopqrstuvwxyz";
            const string numeros = "0123456789";
            const string especiales = "!@#$%^&*()-_=+[]{}|;:,.<>?";
            
            var random = new Random();
            var password = new char[longitud];

            // Garantizar al menos un car�cter de cada tipo
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
    /// Resultado de validaci�n de contrase�a
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