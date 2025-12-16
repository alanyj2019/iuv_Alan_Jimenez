<template>
  <div class="change-password">
    <form @submit.prevent="handleChangePassword" class="password-form">
      <!-- Contraseña actual -->
      <div class="field">
        <label for="currentPassword" class="field-label">
          <i class="pi pi-lock"></i>
          Contraseña Actual
        </label>
        <Password
          id="currentPassword"
          v-model="passwordForm.contrasenaActual"
          :class="{ 'p-invalid': errors.contrasenaActual }"
          placeholder="Ingresa tu contraseña actual"
          :disabled="isLoading"
          :feedback="false"
          toggle-mask
          class="w-full"
        />
        <small v-if="errors.contrasenaActual" class="p-error">
          {{ errors.contrasenaActual }}
        </small>
      </div>

      <!-- Nueva contraseña -->
      <div class="field">
        <label for="newPassword" class="field-label">
          <i class="pi pi-key"></i>
          Nueva Contraseña
        </label>
        <Password
          id="newPassword"
          v-model="passwordForm.contrasenaNueva"
          :class="{ 'p-invalid': errors.contrasenaNueva }"
          placeholder="Ingresa tu nueva contraseña"
          :disabled="isLoading"
          :feedback="true"
          toggle-mask
          class="w-full"
          :pt="{
            meter: { class: 'password-meter' },
            meterLabel: { class: 'password-meter-label' }
          }"
        />
        <small v-if="errors.contrasenaNueva" class="p-error">
          {{ errors.contrasenaNueva }}
        </small>
      </div>

      <!-- Confirmar nueva contraseña -->
      <div class="field">
        <label for="confirmPassword" class="field-label">
          <i class="pi pi-check"></i>
          Confirmar Nueva Contraseña
        </label>
        <Password
          id="confirmPassword"
          v-model="confirmPassword"
          :class="{ 'p-invalid': errors.confirmPassword }"
          placeholder="Confirma tu nueva contraseña"
          :disabled="isLoading"
          :feedback="false"
          toggle-mask
          class="w-full"
        />
        <small v-if="errors.confirmPassword" class="p-error">
          {{ errors.confirmPassword }}
        </small>
      </div>

      <!-- Requisitos de contraseña -->
      <div class="password-requirements">
        <h4><i class="pi pi-info-circle"></i> Requisitos de contraseña:</h4>
        <ul class="requirements-list">
          <li :class="{ 'requirement-met': hasMinLength }">
            <i :class="hasMinLength ? 'pi pi-check' : 'pi pi-times'"></i>
            Al menos 8 caracteres
          </li>
          <li :class="{ 'requirement-met': hasUpperCase }">
            <i :class="hasUpperCase ? 'pi pi-check' : 'pi pi-times'"></i>
            Al menos una letra mayúscula
          </li>
          <li :class="{ 'requirement-met': hasLowerCase }">
            <i :class="hasLowerCase ? 'pi pi-check' : 'pi pi-times'"></i>
            Al menos una letra minúscula
          </li>
          <li :class="{ 'requirement-met': hasNumber }">
            <i :class="hasNumber ? 'pi pi-check' : 'pi pi-times'"></i>
            Al menos un número
          </li>
          <li :class="{ 'requirement-met': hasSpecialChar }">
            <i :class="hasSpecialChar ? 'pi pi-check' : 'pi pi-times'"></i>
            Al menos un carácter especial
          </li>
        </ul>
      </div>

      <!-- Mensaje de error general -->
      <Message
        v-if="changePasswordError"
        severity="error"
        :closable="false"
        class="error-message"
      >
        {{ changePasswordError }}
      </Message>

      <!-- Botones -->
      <div class="form-buttons">
        <Button
          label="Cancelar"
          icon="pi pi-times"
          outlined
          @click="$emit('cancel')"
          :disabled="isLoading"
        />
        <Button
          type="submit"
          label="Cambiar Contraseña"
          icon="pi pi-check"
          :loading="isLoading"
          :disabled="!isFormValid || isLoading"
        />
      </div>
    </form>

    <!-- Toast para notificaciones -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import { authService, tokenService, validators } from '../services/api'

// Interfaces
interface PasswordForm {
  usuario: string
  contrasenaActual: string
  contrasenaNueva: string
}

interface ValidationErrors {
  contrasenaActual?: string
  contrasenaNueva?: string
  confirmPassword?: string
}

// Composables
const toast = useToast()

// Props y Emits
defineEmits<{
  success: []
  cancel: []
}>()

// Estado reactivo
const passwordForm = ref<PasswordForm>({
  usuario: '',
  contrasenaActual: '',
  contrasenaNueva: ''
})

const confirmPassword = ref('')
const errors = ref<ValidationErrors>({})
const changePasswordError = ref('')
const isLoading = ref(false)

// Computed para validaciones de contraseña
const hasMinLength = computed(() => passwordForm.value.contrasenaNueva.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(passwordForm.value.contrasenaNueva))
const hasLowerCase = computed(() => /[a-z]/.test(passwordForm.value.contrasenaNueva))
const hasNumber = computed(() => /\d/.test(passwordForm.value.contrasenaNueva))
const hasSpecialChar = computed(() => /[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.value.contrasenaNueva))

const isPasswordValid = computed(() => {
  return hasMinLength.value && 
         hasUpperCase.value && 
         hasLowerCase.value && 
         hasNumber.value && 
         hasSpecialChar.value
})

const isFormValid = computed(() => {
  return passwordForm.value.contrasenaActual.trim() !== '' &&
         isPasswordValid.value &&
         passwordForm.value.contrasenaNueva === confirmPassword.value &&
         Object.keys(errors.value).length === 0
})

// Métodos de validación
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // Validar contraseña actual
  if (!passwordForm.value.contrasenaActual.trim()) {
    errors.value.contrasenaActual = 'La contraseña actual es requerida'
    isValid = false
  }

  // Validar nueva contraseña
  const passwordValidation = validators.password(passwordForm.value.contrasenaNueva)
  if (passwordValidation) {
    errors.value.contrasenaNueva = passwordValidation
    isValid = false
  }

  // Validar confirmación de contraseña
  const confirmPasswordValidation = validators.confirmPassword(
    passwordForm.value.contrasenaNueva, 
    confirmPassword.value
  )
  if (confirmPasswordValidation) {
    errors.value.confirmPassword = confirmPasswordValidation
    isValid = false
  }

  return isValid
}

const clearErrors = () => {
  errors.value = {}
  changePasswordError.value = ''
}

// Método principal
const handleChangePassword = async () => {
  clearErrors()

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await authService.changePassword(passwordForm.value)

    if (response.isSuccess) {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Contraseña actualizada correctamente',
        life: 3000
      })

      // Limpiar formulario
      passwordForm.value.contrasenaActual = ''
      passwordForm.value.contrasenaNueva = ''
      confirmPassword.value = ''

      // Emitir evento de éxito
      setTimeout(() => {
        emit('success')
      }, 1000)

    } else {
      changePasswordError.value = response.message || 'Error al cambiar contraseña'
      
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: response.message || 'No se pudo cambiar la contraseña',
        life: 5000
      })
    }

  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    
    changePasswordError.value = 'Error de conexión. Verifica tu conexión a internet.'
    
    toast.add({
      severity: 'error',
      summary: 'Error de conexión',
      detail: 'No se pudo conectar con el servidor',
      life: 5000
    })
    
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  const userData = tokenService.getUserData()
  passwordForm.value.usuario = userData?.usuario || ''
  clearErrors()
})
</script>

<style scoped>
.change-password {
  padding: 1rem;
}

.password-form {
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
  font-size: 0.9rem;
}

.password-requirements {
  background: var(--surface-ground);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  padding: 1rem;
}

.password-requirements h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.requirements-list li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--text-color-secondary);
  transition: color 0.2s ease;
}

.requirements-list li.requirement-met {
  color: var(--green-600);
}

.requirements-list li i {
  font-size: 0.75rem;
}

.requirements-list li.requirement-met i {
  color: var(--green-600);
}

.requirements-list li:not(.requirement-met) i {
  color: var(--red-500);
}

.error-message {
  margin: 0;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

/* Estilos para campos inválidos */
:deep(.p-invalid) {
  border-color: var(--red-500);
}

:deep(.p-invalid:focus) {
  box-shadow: 0 0 0 0.2rem rgba(239, 68, 68, 0.2);
}

/* Personalizar medidor de fortaleza de contraseña */
:deep(.password-meter) {
  margin-top: 0.5rem;
}

:deep(.password-meter-label) {
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .form-buttons {
    flex-direction: column;
  }
  
  .requirements-list {
    font-size: 0.8rem;
  }
}
</style>