// Componentes Vue.js para Proyecto Escolar

// Configuración global de Axios
axios.defaults.baseURL = 'https://localhost:7000'; // Ajusta el puerto de tu API
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para agregar token automáticamente
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Interceptor para manejar respuestas y errores
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.vueApp.logout();
        }
        return Promise.reject(error);
    }
);

// Componente de Login
const LoginComponent = {
    template: `
        <div class="login-container d-flex align-items-center justify-content-center">
            <div class="login-card p-4" style="width: 100%; max-width: 400px;">
                <form @submit.prevent="login">
                    <div class="text-center mb-4">
                        <i class="fas fa-graduation-cap fa-3x text-primary mb-3"></i>
                        <h2 class="fw-bold text-primary">Proyecto Escolar</h2>
                        <p class="text-muted">Ingresa tus credenciales para continuar</p>
                    </div>

                    <div class="mb-3">
                        <label for="usuario" class="form-label">
                            <i class="fas fa-user"></i> Usuario
                        </label>
                        <input 
                            type="text" 
                            class="form-control"
                            id="usuario"
                            v-model="formData.usuario"
                            :class="{ 'is-invalid': errors.usuario }"
                            placeholder="Ingresa tu usuario"
                            :disabled="isLoading"
                            required
                        >
                        <div v-if="errors.usuario" class="invalid-feedback">
                            {{ errors.usuario }}
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="password" class="form-label">
                            <i class="fas fa-lock"></i> Contraseña
                        </label>
                        <div class="input-group">
                            <input 
                                :type="showPassword ? 'text' : 'password'" 
                                class="form-control"
                                id="password"
                                v-model="formData.password"
                                :class="{ 'is-invalid': errors.password }"
                                placeholder="Ingresa tu contraseña"
                                :disabled="isLoading"
                                required
                            >
                            <button 
                                class="btn btn-outline-secondary" 
                                type="button" 
                                @click="togglePassword"
                                :disabled="isLoading"
                            >
                                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                            </button>
                        </div>
                        <div v-if="errors.password" class="invalid-feedback d-block">
                            {{ errors.password }}
                        </div>
                    </div>

                    <div v-if="errorMessage" class="alert alert-danger" role="alert">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ errorMessage }}
                    </div>

                    <button 
                        type="submit" 
                        class="btn btn-primary w-100 py-2"
                        :disabled="isLoading"
                    >
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="fas fa-sign-in-alt me-2"></i>
                        {{ isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión' }}
                    </button>

                    <div class="text-center mt-3">
                        <small class="text-muted">
                            <a href="#" @click="showForgotPassword" class="text-decoration-none">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </small>
                    </div>
                </form>
            </div>
        </div>
    `,
    data() {
        return {
            formData: {
                usuario: '',
                password: ''
            },
            errors: {},
            errorMessage: '',
            isLoading: false,
            showPassword: false
        };
    },
    methods: {
        async login() {
            this.clearErrors();
            
            if (!this.validateForm()) {
                return;
            }

            this.isLoading = true;

            try {
                const response = await axios.post('/api/Autenticacion/login', {
                    usuario: this.formData.usuario,
                    password: this.formData.password
                });

                if (response.data.isSuccess) {
                    // Guardar token y datos del usuario
                    localStorage.setItem('authToken', response.data.data.token);
                    localStorage.setItem('userData', JSON.stringify({
                        usuario: response.data.data.usuario,
                        nombre: response.data.data.usuario // Puedes obtener más datos del API
                    }));

                    this.$emit('login-success', response.data.data);
                } else {
                    this.errorMessage = response.data.message || 'Error en las credenciales';
                }
            } catch (error) {
                console.error('Error durante el login:', error);
                
                if (error.response?.data?.message) {
                    this.errorMessage = error.response.data.message;
                } else if (error.response?.status === 401) {
                    this.errorMessage = 'Usuario o contraseña incorrectos';
                } else {
                    this.errorMessage = 'Error de conexión. Intenta nuevamente.';
                }
            } finally {
                this.isLoading = false;
            }
        },
        
        validateForm() {
            this.errors = {};
            let isValid = true;

            if (!this.formData.usuario.trim()) {
                this.errors.usuario = 'El usuario es requerido';
                isValid = false;
            }

            if (!this.formData.password.trim()) {
                this.errors.password = 'La contraseña es requerida';
                isValid = false;
            } else if (this.formData.password.length < 4) {
                this.errors.password = 'La contraseña debe tener al menos 4 caracteres';
                isValid = false;
            }

            return isValid;
        },

        clearErrors() {
            this.errors = {};
            this.errorMessage = '';
        },

        togglePassword() {
            this.showPassword = !this.showPassword;
        },

        showForgotPassword() {
            alert('Funcionalidad de recuperación de contraseña no implementada aún.');
        }
    }
};

// Componente para cambiar contraseña
const ChangePasswordModal = {
    template: `
        <div class="modal fade show" style="display: block;" tabindex="-1">
            <div class="modal-backdrop fade show"></div>
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-key"></i> Cambiar Contraseña
                        </h5>
                        <button type="button" class="btn-close" @click="$emit('close')"></button>
                    </div>
                    <form @submit.prevent="changePassword">
                        <div class="modal-body">
                            <div class="mb-3">
                                <label for="currentPassword" class="form-label">Contraseña Actual</label>
                                <input 
                                    type="password" 
                                    class="form-control"
                                    id="currentPassword"
                                    v-model="formData.contrasenaActual"
                                    :class="{ 'is-invalid': errors.contrasenaActual }"
                                    required
                                >
                                <div v-if="errors.contrasenaActual" class="invalid-feedback">
                                    {{ errors.contrasenaActual }}
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="newPassword" class="form-label">Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    class="form-control"
                                    id="newPassword"
                                    v-model="formData.contrasenaNueva"
                                    :class="{ 'is-invalid': errors.contrasenaNueva }"
                                    required
                                >
                                <div v-if="errors.contrasenaNueva" class="invalid-feedback">
                                    {{ errors.contrasenaNueva }}
                                </div>
                                <div class="form-text">
                                    <small>
                                        La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, 
                                        minúsculas, números y caracteres especiales.
                                    </small>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="confirmPassword" class="form-label">Confirmar Nueva Contraseña</label>
                                <input 
                                    type="password" 
                                    class="form-control"
                                    id="confirmPassword"
                                    v-model="confirmPassword"
                                    :class="{ 'is-invalid': errors.confirmPassword }"
                                    required
                                >
                                <div v-if="errors.confirmPassword" class="invalid-feedback">
                                    {{ errors.confirmPassword }}
                                </div>
                            </div>

                            <div v-if="errorMessage" class="alert alert-danger">
                                {{ errorMessage }}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" @click="$emit('close')">
                                Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary" :disabled="isLoading">
                                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                                {{ isLoading ? 'Cambiando...' : 'Cambiar Contraseña' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            formData: {
                usuario: '',
                contrasenaActual: '',
                contrasenaNueva: ''
            },
            confirmPassword: '',
            errors: {},
            errorMessage: '',
            isLoading: false
        };
    },
    mounted() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        this.formData.usuario = userData.usuario || '';
    },
    methods: {
        async changePassword() {
            this.clearErrors();
            
            if (!this.validateForm()) {
                return;
            }

            this.isLoading = true;

            try {
                const response = await axios.post('/api/Autenticacion/cambiar-contrasena', this.formData);

                if (response.data.isSuccess) {
                    this.$emit('success', 'Contraseña cambiada exitosamente');
                    this.$emit('close');
                } else {
                    this.errorMessage = response.data.message || 'Error al cambiar contraseña';
                }
            } catch (error) {
                console.error('Error al cambiar contraseña:', error);
                this.errorMessage = error.response?.data?.message || 'Error de conexión';
            } finally {
                this.isLoading = false;
            }
        },

        validateForm() {
            this.errors = {};
            let isValid = true;

            if (!this.formData.contrasenaActual) {
                this.errors.contrasenaActual = 'La contraseña actual es requerida';
                isValid = false;
            }

            if (!this.formData.contrasenaNueva) {
                this.errors.contrasenaNueva = 'La nueva contraseña es requerida';
                isValid = false;
            }

            if (this.formData.contrasenaNueva !== this.confirmPassword) {
                this.errors.confirmPassword = 'Las contraseñas no coinciden';
                isValid = false;
            }

            return isValid;
        },

        clearErrors() {
            this.errors = {};
            this.errorMessage = '';
        }
    }
};

// Registrar componentes globalmente
window.VueComponents = {
    LoginComponent,
    ChangePasswordModal
};