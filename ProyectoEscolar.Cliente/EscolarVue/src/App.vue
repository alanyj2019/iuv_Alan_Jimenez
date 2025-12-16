<template>
  <div id="app">
    <!-- Pantalla de login -->
    <LoginComponent 
      v-if="!isAuthenticated" 
      @login-success="handleLoginSuccess" 
    />

    <!-- Aplicación principal -->
    <div v-else class="main-app">
      <!-- Navbar -->
      <nav class="navbar">
        <div class="navbar-brand">
          <i class="pi pi-graduation-cap"></i>
          <span>Proyecto Escolar</span>
        </div>
        
        <div class="navbar-menu">
          <Button 
            icon="pi pi-home" 
            label="Dashboard" 
            text 
            @click="currentView = 'dashboard'"
            :class="{ 'active': currentView === 'dashboard' }"
          />
          <Button 
            icon="pi pi-users" 
            label="Usuarios" 
            text 
            @click="currentView = 'users'"
            :class="{ 'active': currentView === 'users' }"
          />
          <Button 
            icon="pi pi-chart-bar" 
            label="Reportes" 
            text 
            @click="currentView = 'reports'"
            :class="{ 'active': currentView === 'reports' }"
          />
        </div>

        <div class="navbar-user">
          <Button 
            :label="currentUser.nombre || 'Usuario'"
            icon="pi pi-user"
            text
            @click="toggleUserMenu"
            aria-haspopup="true"
            aria-controls="user_menu"
          />
          <Menu 
            id="user_menu"
            ref="userMenu" 
            :model="userMenuItems" 
            :popup="true"
          />
        </div>
      </nav>

      <!-- Contenido principal -->
      <main class="main-content">
        <!-- Dashboard -->
        <DashboardComponent v-if="currentView === 'dashboard'" />
        
        <!-- Usuarios -->
        <div v-else-if="currentView === 'users'" class="view-container">
          <h2><i class="pi pi-users"></i> Gestión de Usuarios</h2>
          <p>Módulo de usuarios en desarrollo...</p>
        </div>
        
        <!-- Reportes -->
        <div v-else-if="currentView === 'reports'" class="view-container">
          <h2><i class="pi pi-chart-bar"></i> Reportes</h2>
          <p>Módulo de reportes en desarrollo...</p>
        </div>
      </main>
    </div>

    <!-- Toast global -->
    <Toast position="top-right" />

    <!-- Dialog de cambio de contraseña -->
    <Dialog
      v-model:visible="showChangePasswordDialog"
      modal
      header="Cambiar Contraseña"
      :style="{ width: '500px' }"
    >
      <ChangePasswordComponent 
        v-if="showChangePasswordDialog"
        @success="handlePasswordChanged"
        @cancel="showChangePasswordDialog = false"
      />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import LoginComponent from './components/Login.vue'
import DashboardComponent from './components/Dashboard.vue'
import ChangePasswordComponent from './components/ChangePassword.vue'
import { tokenService, authService } from './services/api'

// Composables
const toast = useToast()

// Referencias
const userMenu = ref()

// Estado reactivo
const isAuthenticated = ref(false)
const currentUser = ref<any>({})
const currentView = ref('dashboard')
const showChangePasswordDialog = ref(false)

// Menú de usuario
const userMenuItems = ref([
  {
    label: 'Mi Perfil',
    icon: 'pi pi-user',
    command: () => {
      toast.add({
        severity: 'info',
        summary: 'Información',
        detail: 'Funcionalidad de perfil en desarrollo',
        life: 3000
      })
    }
  },
  {
    label: 'Cambiar Contraseña',
    icon: 'pi pi-key',
    command: () => {
      showChangePasswordDialog.value = true
    }
  },
  {
    separator: true
  },
  {
    label: 'Cerrar Sesión',
    icon: 'pi pi-sign-out',
    command: logout
  }
])

// Métodos
const checkAuthentication = async () => {
  const token = tokenService.getToken()
  const userData = tokenService.getUserData()
  
  if (token && userData) {
    try {
      // Verificar que el token sea válido
      await authService.testConnection()
      isAuthenticated.value = true
      currentUser.value = userData
    } catch (error) {
      // Token inválido, limpiar datos
      tokenService.logout()
      isAuthenticated.value = false
    }
  }
}

const handleLoginSuccess = (loginData: any) => {
  isAuthenticated.value = true
  currentUser.value = {
    usuario: loginData.usuario,
    nombre: loginData.usuario // Expandir con más datos según sea necesario
  }
  
  toast.add({
    severity: 'success',
    summary: 'Bienvenido',
    detail: `¡Hola ${currentUser.value.nombre}! Has iniciado sesión correctamente.`,
    life: 4000
  })
}

const handlePasswordChanged = () => {
  showChangePasswordDialog.value = false
  toast.add({
    severity: 'success',
    summary: 'Éxito',
    detail: 'Contraseña actualizada correctamente',
    life: 3000
  })
}

const toggleUserMenu = (event: Event) => {
  userMenu.value.toggle(event)
}

function logout() {
  tokenService.logout()
  isAuthenticated.value = false
  currentUser.value = {}
  currentView.value = 'dashboard'
  
  toast.add({
    severity: 'info',
    summary: 'Sesión Cerrada',
    detail: 'Has cerrado sesión correctamente',
    life: 3000
  })
}

// Lifecycle
onMounted(() => {
  checkAuthentication()
})
</script>

<style scoped>
#app {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.main-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  background: var(--primary-color);
  color: white;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.navbar-brand i {
  font-size: 1.5rem;
}

.navbar-menu {
  display: flex;
  gap: 0.5rem;
}

.navbar-menu :deep(.p-button) {
  color: rgba(255,255,255,0.8);
  border-color: transparent;
}

.navbar-menu :deep(.p-button:hover) {
  background: rgba(255,255,255,0.1);
  color: white;
}

.navbar-menu :deep(.p-button.active) {
  background: rgba(255,255,255,0.2);
  color: white;
}

.navbar-user {
  position: relative;
}

.navbar-user :deep(.p-button) {
  color: white;
  border-color: rgba(255,255,255,0.3);
}

.navbar-user :deep(.p-button:hover) {
  background: rgba(255,255,255,0.1);
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: #f8f9fa;
}

.view-container {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.view-container h2 {
  margin: 0 0 1rem 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .navbar-menu {
    order: 3;
    width: 100%;
    justify-content: center;
  }
  
  .main-content {
    padding: 1rem;
  }
}
</style>
