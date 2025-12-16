// Configuración y servicios para la comunicación con el API

// Configuración del API
const API_CONFIG = {
    baseURL: 'https://localhost:7000', // Cambia por la URL de tu API
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
};

// Configurar Axios por defecto
axios.defaults.baseURL = API_CONFIG.baseURL;
axios.defaults.timeout = API_CONFIG.timeout;
axios.defaults.headers.common['Content-Type'] = API_CONFIG.headers['Content-Type'];

// Servicios específicos del API
const ApiService = {
    // Servicios de autenticación
    auth: {
        async login(credentials) {
            return await axios.post('/api/Autenticacion/login', credentials);
        },
        
        async changePassword(data) {
            return await axios.post('/api/Autenticacion/cambiar-contrasena', data);
        },
        
        async testConnection() {
            return await axios.get('/api/Autenticacion/test-connection');
        }
    },

    // Servicios de usuarios (futuros)
    users: {
        async getAll(page = 1, pageSize = 10) {
            return await axios.get(`/api/Usuarios?page=${page}&pageSize=${pageSize}`);
        },
        
        async getById(id) {
            return await axios.get(`/api/Usuarios/${id}`);
        },
        
        async create(userData) {
            return await axios.post('/api/Usuarios', userData);
        },
        
        async update(id, userData) {
            return await axios.put(`/api/Usuarios/${id}`, userData);
        },
        
        async delete(id) {
            return await axios.delete(`/api/Usuarios/${id}`);
        }
    },

    // Servicios de sucursales (futuros)
    sucursales: {
        async getAll() {
            return await axios.get('/api/Sucursales');
        },
        
        async getById(id) {
            return await axios.get(`/api/Sucursales/${id}`);
        }
    },

    // Servicios de roles (futuros)
    roles: {
        async getAll() {
            return await axios.get('/api/Roles');
        }
    },

    // Servicios de reportes (futuros)
    reports: {
        async getDashboardStats() {
            return await axios.get('/api/Reports/dashboard-stats');
        },
        
        async getUsersReport(dateFrom, dateTo) {
            return await axios.get(`/api/Reports/users?from=${dateFrom}&to=${dateTo}`);
        }
    }
};

// Utilidades para manejo de errores
const ApiErrorHandler = {
    handle(error) {
        console.error('API Error:', error);
        
        let message = 'Error de conexión con el servidor';
        let type = 'danger';
        
        if (error.response) {
            // Error de respuesta del servidor
            switch (error.response.status) {
                case 400:
                    message = error.response.data?.message || 'Datos inválidos';
                    type = 'warning';
                    break;
                case 401:
                    message = 'No autorizado. Por favor inicia sesión nuevamente.';
                    type = 'warning';
                    break;
                case 403:
                    message = 'No tienes permisos para realizar esta acción.';
                    type = 'warning';
                    break;
                case 404:
                    message = 'Recurso no encontrado.';
                    type = 'info';
                    break;
                case 500:
                    message = error.response.data?.message || 'Error interno del servidor.';
                    type = 'danger';
                    break;
                default:
                    message = error.response.data?.message || `Error ${error.response.status}`;
                    type = 'danger';
            }
        } else if (error.request) {
            // Error de red
            message = 'Error de conexión. Verifica tu conexión a internet.';
            type = 'danger';
        } else {
            // Otro tipo de error
            message = error.message || 'Error inesperado';
            type = 'danger';
        }
        
        return { message, type };
    }
};

// Utilidades para el manejo de tokens
const TokenService = {
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    setToken(token) {
        localStorage.setItem('authToken', token);
    },
    
    removeToken() {
        localStorage.removeItem('authToken');
    },
    
    getUserData() {
        const data = localStorage.getItem('userData');
        return data ? JSON.parse(data) : null;
    },
    
    setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    },
    
    removeUserData() {
        localStorage.removeItem('userData');
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    logout() {
        this.removeToken();
        this.removeUserData();
    }
};

// Validadores comunes
const Validators = {
    required(value, fieldName = 'Campo') {
        return value && value.trim() ? null : `${fieldName} es requerido`;
    },
    
    minLength(value, min, fieldName = 'Campo') {
        return value && value.length >= min ? null : `${fieldName} debe tener al menos ${min} caracteres`;
    },
    
    maxLength(value, max, fieldName = 'Campo') {
        return value && value.length <= max ? null : `${fieldName} debe tener máximo ${max} caracteres`;
    },
    
    email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || emailRegex.test(value) ? null : 'Formato de email inválido';
    },
    
    password(value) {
        if (!value) return 'Contraseña es requerida';
        if (value.length < 8) return 'Debe tener al menos 8 caracteres';
        if (!/[A-Z]/.test(value)) return 'Debe contener al menos una mayúscula';
        if (!/[a-z]/.test(value)) return 'Debe contener al menos una minúscula';
        if (!/\d/.test(value)) return 'Debe contener al menos un número';
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Debe contener al menos un carácter especial';
        return null;
    },
    
    confirmPassword(password, confirmPassword) {
        return password === confirmPassword ? null : 'Las contraseñas no coinciden';
    }
};

// Utilidades de formato
const FormatUtils = {
    date(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        return new Date(date).toLocaleDateString('es-ES', defaultOptions);
    },
    
    datetime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            ...options
        };
        return new Date(date).toLocaleString('es-ES', defaultOptions);
    },
    
    currency(amount, currency = 'MXN') {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    number(number, decimals = 0) {
        return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    }
};

// Exportar para uso global
window.ApiService = ApiService;
window.ApiErrorHandler = ApiErrorHandler;
window.TokenService = TokenService;
window.Validators = Validators;
window.FormatUtils = FormatUtils;