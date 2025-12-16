<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <i class="pi pi-graduation-cap" style="font-size: 3rem; color: var(--primary-color);"></i>
        <h1 class="login-title">Proyecto Escolar</h1>
        <p class="login-subtitle">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Campo Usuario -->
        <div class="field">
          <label for="usuario" class="field-label">
            <i class="pi pi-user"></i>
            Usuario
          </label>
          <InputText
            id="usuario"
            v-model="loginForm.usuario"
            :class="{ 'p-invalid': errors.usuario }"
            placeholder="Ingresa tu usuario"
            :disabled="isLoading"
            autocomplete="username"
            class="w-full"
          />
          <small v-if="errors.usuario" class="p-error">{{ errors.usuario }}</small>
        </div>

        <!-- Campo Contraseña -->
        <div class="field">
          <label for="password" class="field-label">
            <i class="pi pi-lock"></i>
            Contraseña
          </label>
          <Password
            id="password"
            v-model="loginForm.password"
            :class="{ 'p-invalid': errors.password }"
            placeholder="Ingresa tu contraseña"
            :disabled="isLoading"
            :feedback="false"
            toggle-mask
            autocomplete="current-password"
            class="w-full"
          />
          <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
        </div>

        <!-- Recordar usuario -->
        <div class="field-checkbox">
          <Checkbox
            id="remember"
            v-model="rememberUser"
            :binary="true"
          />
          <label for="remember">Recordar usuario</label>
        </div>

        <!-- Mensaje de error general -->
        <Message
          v-if="loginError"
          severity="error"
          :closable="false"
          class="login-error"
        >
          <i class="pi pi-exclamation-triangle"></i>
          {{ loginError }}
        </Message>

        <!-- Botón de login -->
        <Button
          type="submit"
          :loading="isLoading"
          loading-icon="pi pi-spin pi-spinner"
          :disabled="!isFormValid || isLoading"
          class="login-button w-full"
          size="large"
        >
          <template #default>
            <i v-if="!isLoading" class="pi pi-sign-in mr-2"></i>
            {{ isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión' }}
          </template>
        </Button>

        <!-- Enlaces adicionales -->
        <div class="login-links">
          <a href="#" @click.prevent="showForgotPassword" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>

    <!-- Toast para notificaciones -->
    <Toast />

    <!-- Dialog para recuperar contraseña -->
    <Dialog
      v-model:visible="showForgotDialog"
      modal
      header="Recuperar Contraseña"
      :style="{ width: '450px' }"
    >
      <div class="forgot-password-content">
        <p>Ingresa tu usuario para recibir instrucciones de recuperación:</p>
        <div class="field">
          <label for="forgotUser">Usuario:</label>
          <InputText
            id="forgotUser"
            v-model="forgotPasswordUser"
            placeholder="Tu usuario"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          @click="showForgotDialog = false"
          class="p-button-text"
        />
        <Button
          label="Enviar"
          icon="pi pi-send"
          @click="sendPasswordReset"
          :disabled="!forgotPasswordUser"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import Dialog from 'primevue/dialog'

// Importar el servicio de API
import { authService, tokenService, validators, type LoginRequest, type LoginResponse } from '../services/api'

// Interfaces
interface LoginForm {
  usuario: string
  password: string
}

interface ValidationErrors {
  usuario?: string
  password?: string
}

// Composables
const toast = useToast()

// Props y Emits
const emit = defineEmits<{
  loginSuccess: [data: LoginResponse['data']]
}>()

// Estado reactivo
const loginForm = ref<LoginForm>({
  usuario: '',
  password: ''
})

const errors = ref<ValidationErrors>({})
const loginError = ref<string>('')
const isLoading = ref<boolean>(false)
const rememberUser = ref<boolean>(false)
const showForgotDialog = ref<boolean>(false)
const forgotPasswordUser = ref<string>('')

// Computed
const isFormValid = computed(() => {
  return loginForm.value.usuario.trim() !== '' && 
         loginForm.value.password.trim() !== '' &&
         Object.keys(errors.value).length === 0
})

// Métodos de validación
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validar usuario usando validadores del servicio
  const usuarioValidation = validators.required(loginForm.value.usuario, 'Usuario')
  if (usuarioValidation) {
    errors.value.usuario = usuarioValidation
    isValid = false
  } else {
    const minLengthValidation = validators.minLength(loginForm.value.usuario, 3, 'Usuario')
    if (minLengthValidation) {
      errors.value.usuario = minLengthValidation
      isValid = false
    }
  }

  // Validar contraseña usando validadores del servicio
  const passwordValidation = validators.required(loginForm.value.password, 'Contraseña')
  if (passwordValidation) {
    errors.value.password = passwordValidation
    isValid = false
  } else {
    const minLengthValidation = validators.minLength(loginForm.value.password, 4, 'Contraseña')
    if (minLengthValidation) {
      errors.value.password = minLengthValidation
      isValid = false
    }
  }

  return isValid
}

const clearErrors = () => {
  errors.value = {}
  loginError.value = ''
}

// Métodos de autenticación
const handleLogin = async () => {
  clearErrors()

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    console.log('Iniciando login con:', loginForm.value.usuario)
    
    // Usar el servicio de autenticación
    const credentials: LoginRequest = {
      usuario: loginForm.value.usuario,
      password: loginForm.value.password
    }

    const response = await authService.login(credentials)
    console.log('Respuesta del login:', response)

    if (response.isSuccess) {
      // Usar tokenService para manejar tokens
      tokenService.setToken(response.data.token)
      
      const userData = {
        usuario: response.data.usuario,
        nombre: response.data.usuario, // Puedes expandir con más datos
        loginTime: new Date().toISOString()
      }
      
      tokenService.setUserData(userData)

      // Recordar usuario si está marcado
      if (rememberUser.value) {
        localStorage.setItem('rememberedUser', loginForm.value.usuario)
      } else {
        localStorage.removeItem('rememberedUser')
      }

      // Mostrar mensaje de éxito
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: '¡Bienvenido! Has iniciado sesión correctamente.',
        life: 3000
      })

      // Emitir evento de login exitoso
      emit('loginSuccess', response.data)

    } else {
      loginError.value = response.message || 'Credenciales inválidas'
      
      toast.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: response.message || 'Usuario o contraseña incorrectos',
        life: 5000
      })
    }

  } catch (error: any) {
    console.error('Error durante el login:', error)
    
    // Manejo mejorado de errores usando información del error de Axios
    let errorMessage = 'Error de conexión. Verifica tu conexión a internet.'
    
    if (error.response) {
      // Error de respuesta del servidor
      if (error.response.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos'
      } else if (error.response.status === 500) {
        errorMessage = 'Error interno del servidor'
      } else {
        errorMessage = `Error del servidor: ${error.response.status}`
      }
    } else if (error.request) {
      // Error de red
      errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'El servidor no está disponible. Contacta al administrador.'
    }
    
    loginError.value = errorMessage
    
    toast.add({
      severity: 'error',
      summary: 'Error de conexión',
      detail: errorMessage,
      life: 5000
    })
    
  } finally {
    isLoading.value = false
  }
}

const showForgotPassword = () => {
  showForgotDialog.value = true
  forgotPasswordUser.value = loginForm.value.usuario
}

const sendPasswordReset = () => {
  if (forgotPasswordUser.value.trim()) {
    toast.add({
      severity: 'info',
      summary: 'Solicitud enviada',
      detail: 'Se han enviado las instrucciones de recuperación (funcionalidad en desarrollo)',
      life: 5000
    })
    showForgotDialog.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Cargar usuario recordado si existe
  const rememberedUser = localStorage.getItem('rememberedUser')
  if (rememberedUser) {
    loginForm.value.usuario = rememberedUser
    rememberUser.value = true
  }

  // Limpiar cualquier error previo
  clearErrors()

  // Log para debugging
  console.log('Componente Login montado. URL base de API configurada.')
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  color: var(--primary-color);
  margin: 1rem 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.login-subtitle {
  color: var(--text-color-secondary);
  margin: 0;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 600;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-checkbox label {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.login-error {
  margin: 0;
}

.login-button {
  margin-top: 1rem;
  background: linear-gradient(45deg, var(--primary-color), #667eea);
  border: none;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-links {
  text-align: center;
  margin-top: 1rem;
}

.forgot-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: var(--primary-color-dark);
  text-decoration: underline;
}

.forgot-password-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.forgot-password-content p {
  margin: 0;
  color: var(--text-color-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .login-title {
    font-size: 1.5rem;
  }
}

/* Animaciones para estados de carga */
.login-button:disabled {
  opacity: 0.6;
}

/* Estilos para campos inválidos */
:deep(.p-invalid) {
  border-color: var(--red-500);
}

:deep(.p-invalid:focus) {
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.2);
}

/* Personalizar el componente Password */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>