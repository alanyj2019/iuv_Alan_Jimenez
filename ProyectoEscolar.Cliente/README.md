# Proyecto Escolar - Cliente Vue.js + API ASP.NET Core

## ?? Características Implementadas

### ? **Backend API (.NET 8)**
- JWT Authentication con Serilog
- Entity Framework Core con SQL Server
- Cifrado de contraseñas con BCrypt
- Logging avanzado en base de datos
- CORS configurado para cliente web
- Manejo de excepciones globales

### ? **Frontend Cliente (Razor Pages + Vue.js 3)**
- Integración híbrida Razor Pages + Vue.js
- Sistema de login completo
- Dashboard moderno y responsivo
- Manejo de estados de autenticación
- Notificaciones automáticas
- Componentes reutilizables

---

## ??? Configuración y Ejecución

### **1. Configurar Base de Datos**

Actualiza las cadenas de conexión en:
- `ProyectoEscolar/appsettings.json` (API)

```json
"ConnectionStrings": {
    "DefaultConnection": "Server=TU_SERVIDOR;Database=iuv;User ID=TU_USUARIO;Password=TU_PASSWORD;..."
}
```

### **2. Ejecutar API**

```bash
cd ProyectoEscolar
dotnet run
```

La API estará disponible en: `https://localhost:7000`

### **3. Ejecutar Cliente**

```bash
cd ProyectoEscolar.Cliente
dotnet run
```

El cliente estará disponible en: `https://localhost:7001`

### **4. Ajustar URLs si es necesario**

Si los puertos cambian, actualiza:
- `vue-components.js` - línea 4: `axios.defaults.baseURL`
- `api-service.js` - línea 4: `baseURL`
- `Program.cs` (API) - línea 43: política CORS

---

## ?? **Usuarios de Prueba**

Para probar el login, crea un usuario en la base de datos:

```sql
INSERT INTO [core].[Usuario] (SucursalId, RolId, Usuario, Nombre, Activo, Contrasena)
VALUES (1, 1, 'admin', 'Administrador', 1, NULL)
-- La contraseña se cifrará automáticamente en el primer login
```

**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `12345678` (se cifrará automáticamente)

---

## ?? **Características del Login**

### **Pantalla de Login**
- Diseño moderno con gradientes
- Validación en tiempo real
- Mostrar/ocultar contraseña
- Indicador de carga
- Manejo de errores

### **Dashboard**
- Estadísticas en tiempo real
- Actividad reciente
- Estado del sistema
- Accesos rápidos
- Navegación dinámica

### **Sistema de Autenticación**
- JWT tokens seguros
- Renovación automática
- Logout automático en tokens expirados
- Persistencia en localStorage

---

## ?? **Estructura de Archivos Frontend**

```
ProyectoEscolar.Cliente/
??? wwwroot/js/
?   ??? api-service.js      # Servicios y configuración API
?   ??? vue-components.js   # Componentes Vue (Login, etc.)
?   ??? vue-app.js         # Aplicación principal Vue
?   ??? site.js            # Scripts adicionales
??? Pages/
?   ??? Index.cshtml       # Dashboard con Vue.js
?   ??? Shared/
?       ??? _Layout.cshtml # Layout principal con Vue
??? appsettings.json       # Configuración cliente
```

---

## ?? **APIs Disponibles**

### **Autenticación**
```http
POST /api/Autenticacion/login
Content-Type: application/json

{
    "usuario": "admin",
    "password": "12345678"
}
```

### **Cambiar Contraseña**
```http
POST /api/Autenticacion/cambiar-contrasena
Authorization: Bearer {token}
Content-Type: application/json

{
    "usuario": "admin",
    "contrasenaActual": "12345678",
    "contrasenaNueva": "NuevaPassword123!"
}
```

### **Probar Conexión**
```http
GET /api/Autenticacion/test-connection
Authorization: Bearer {token}
```

---

## ?? **Próximos Pasos - Funcionalidades Futuras**

### **1. Gestión de Usuarios**
- Crear controlador `UsuariosController`
- CRUD completo de usuarios
- Paginación y filtros
- Asignación de roles

### **2. Gestión de Sucursales**
- Controlador `SucursalesController` 
- Mantenimiento de sucursales
- Relación con usuarios

### **3. Reportes**
- Dashboard con gráficas
- Reportes de usuarios
- Logs de actividad
- Exportación a Excel/PDF

### **4. Configuración**
- Configuración del sistema
- Parámetros globales
- Backup de base de datos

---

## ??? **Seguridad Implementada**

- ? Cifrado de contraseñas con BCrypt
- ? JWT tokens con expiración
- ? Validación de entrada
- ? CORS configurado
- ? Logging de seguridad
- ? Manejo de errores sin exponer información sensible

---

## ?? **Logging y Monitoreo**

### **Ver logs en base de datos:**
```sql
SELECT TOP 100 * 
FROM Logs 
ORDER BY TimeStamp DESC
```

### **Limpiar logs antiguos:**
```http
DELETE /api/Logs/cleanup?diasAntiguedad=30
```

---

## ?? **Personalización UI**

### **Cambiar colores principales:**
Edita en `_Layout.cshtml` (sección `<style>`):
```css
.login-container {
    background: linear-gradient(135deg, #TU_COLOR_1 0%, #TU_COLOR_2 100%);
}
```

### **Agregar nuevos componentes Vue:**
1. Crea el componente en `vue-components.js`
2. Regístralo en `window.VueComponents`
3. Úsalo en `vue-app.js` o en tus páginas

---

## ? **¡Todo Listo!**

Tu aplicación está configurada con:
- ?? **Login seguro** con JWT
- ?? **Dashboard moderno**
- ?? **API RESTful** documentada  
- ?? **Logging completo**
- ?? **UI moderna** con Vue.js

**¡Ya puedes comenzar a desarrollar nuevas funcionalidades! ??**