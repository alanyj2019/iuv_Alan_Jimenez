// Aplicación principal Vue.js
const { createApp } = Vue;

const app = createApp({
    data() {
        return {
            isAuthenticated: false,
            usuario: {},
            currentRoute: 'home',
            isLoading: false,
            notification: {
                show: false,
                message: '',
                type: 'info' // success, warning, danger, info
            },
            showChangePasswordModal: false
        };
    },
    
    components: {
        'login-component': window.VueComponents.LoginComponent,
        'change-password-modal': window.VueComponents.ChangePasswordModal
    },
    
    mounted() {
        this.checkAuthentication();
        this.setupAxiosInterceptors();
    },
    
    methods: {
        checkAuthentication() {
            const token = localStorage.getItem('authToken');
            const userData = localStorage.getItem('userData');
            
            if (token && userData) {
                this.isAuthenticated = true;
                this.usuario = JSON.parse(userData);
                
                // Verificar si el token es válido
                this.verifyToken();
            }
        },
        
        async verifyToken() {
            try {
                await axios.get('/api/Autenticacion/test-connection');
            } catch (error) {
                if (error.response?.status === 401) {
                    this.logout();
                }
            }
        },
        
        setupAxiosInterceptors() {
            // Ya configurado en vue-components.js
            window.vueApp = this; // Referencia global para interceptores
        },
        
        handleLoginSuccess(loginData) {
            this.isAuthenticated = true;
            this.usuario = {
                usuario: loginData.usuario,
                nombre: loginData.usuario // Puedes expandir esto con más datos del API
            };
            
            this.showNotification('¡Bienvenido! Has iniciado sesión correctamente.', 'success');
        },
        
        logout() {
            // Limpiar datos de autenticación
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            
            // Resetear estado
            this.isAuthenticated = false;
            this.usuario = {};
            this.currentRoute = 'home';
            
            this.showNotification('Has cerrado sesión correctamente.', 'info');
            
            // Recargar página para limpiar cualquier estado restante
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        
        navigateTo(route) {
            this.currentRoute = route;
            // Aquí puedes implementar navegación SPA o redirigir a páginas Razor
            console.log(`Navegando a: ${route}`);
        },
        
        showProfile() {
            this.showNotification('Funcionalidad de perfil no implementada aún.', 'info');
        },
        
        changePassword() {
            this.showChangePasswordModal = true;
        },
        
        handlePasswordChanged(message) {
            this.showNotification(message, 'success');
        },
        
        showNotification(message, type = 'info') {
            this.notification = {
                show: true,
                message,
                type
            };
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                this.hideNotification();
            }, 5000);
        },
        
        hideNotification() {
            this.notification.show = false;
        },
        
        getNotificationIcon(type) {
            const icons = {
                success: 'fas fa-check-circle',
                warning: 'fas fa-exclamation-triangle',
                danger: 'fas fa-times-circle',
                info: 'fas fa-info-circle'
            };
            return icons[type] || icons.info;
        },
        
        // Métodos utilitarios para hacer peticiones al API
        async apiGet(url) {
            try {
                this.isLoading = true;
                const response = await axios.get(url);
                return response.data;
            } catch (error) {
                this.handleApiError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        
        async apiPost(url, data) {
            try {
                this.isLoading = true;
                const response = await axios.post(url, data);
                return response.data;
            } catch (error) {
                this.handleApiError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        
        async apiPut(url, data) {
            try {
                this.isLoading = true;
                const response = await axios.put(url, data);
                return response.data;
            } catch (error) {
                this.handleApiError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        
        async apiDelete(url) {
            try {
                this.isLoading = true;
                const response = await axios.delete(url);
                return response.data;
            } catch (error) {
                this.handleApiError(error);
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        
        handleApiError(error) {
            console.error('API Error:', error);
            
            let message = 'Error de conexión con el servidor';
            
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.status) {
                switch (error.response.status) {
                    case 401:
                        message = 'No autorizado. Por favor inicia sesión nuevamente.';
                        break;
                    case 403:
                        message = 'No tienes permisos para realizar esta acción.';
                        break;
                    case 404:
                        message = 'Recurso no encontrado.';
                        break;
                    case 500:
                        message = 'Error interno del servidor.';
                        break;
                }
            }
            
            this.showNotification(message, 'danger');
        }
    }
});

// Montar la aplicación
app.mount('#app');

// También montar el navbar si existe
const navbar = document.getElementById('mainNavbar');
if (navbar) {
    app.mount('#mainNavbar');
}

// Exportar para uso global
window.vueApp = app;