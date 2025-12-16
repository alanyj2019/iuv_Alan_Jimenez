<template>
  <div class="dashboard">
    <!-- Header del Dashboard -->
    <div class="dashboard-header">
      <div class="welcome-section">
        <h1>
          <i class="pi pi-home"></i>
          Dashboard
        </h1>
        <p class="welcome-text">
          Bienvenido de nuevo, {{ userName }}
        </p>
      </div>
      <div class="datetime-section">
        <small class="text-muted">
          <i class="pi pi-clock"></i>
          {{ currentDateTime }}
        </small>
      </div>
    </div>

    <!-- Tarjetas de estadísticas -->
    <div class="stats-grid">
      <Card class="stat-card" v-for="stat in stats" :key="stat.title">
        <template #content>
          <div class="stat-content">
            <div class="stat-info">
              <h3 class="stat-title">{{ stat.title }}</h3>
              <div class="stat-value">{{ stat.value }}</div>
            </div>
            <div class="stat-icon" :style="{ backgroundColor: stat.color }">
              <i :class="stat.icon"></i>
            </div>
          </div>
        </template>
      </Card>
    </div>

    <!-- Contenido principal -->
    <div class="dashboard-content">
      <!-- Actividad reciente -->
      <Card class="activity-card">
        <template #title>
          <div class="card-header">
            <h3>
              <i class="pi pi-list"></i>
              Actividad Reciente
            </h3>
            <Button
              icon="pi pi-refresh"
              size="small"
              text
              @click="loadRecentActivity"
              :loading="loadingActivity"
            />
          </div>
        </template>
        <template #content>
          <div v-if="loadingActivity" class="loading-container">
            <ProgressBar mode="indeterminate" style="height: 4px" />
            <p class="loading-text">Cargando actividad...</p>
          </div>
          <div v-else-if="recentActivity.length === 0" class="empty-state">
            <i class="pi pi-inbox empty-icon"></i>
            <p>No hay actividad reciente</p>
          </div>
          <div v-else class="activity-list">
            <div 
              v-for="activity in recentActivity" 
              :key="activity.id" 
              class="activity-item"
            >
              <div class="activity-icon" :class="getActivityIconClass(activity.type)">
                <i :class="getActivityIcon(activity.type)"></i>
              </div>
              <div class="activity-details">
                <p class="activity-description">{{ activity.description }}</p>
                <small class="activity-time">{{ formatDate(activity.timestamp) }}</small>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Accesos rápidos y estado del sistema -->
      <div class="sidebar-cards">
        <!-- Accesos rápidos -->
        <Card class="quick-actions-card">
          <template #title>
            <h3>
              <i class="pi pi-bolt"></i>
              Accesos Rápidos
            </h3>
          </template>
          <template #content>
            <div class="quick-actions">
              <Button
                icon="pi pi-users"
                label="Gestionar Usuarios"
                class="w-full"
                outlined
                @click="$emit('navigate', 'users')"
              />
              <Button
                icon="pi pi-chart-bar"
                label="Ver Reportes"
                class="w-full"
                outlined
                @click="$emit('navigate', 'reports')"
              />
              <Button
                icon="pi pi-cog"
                label="Configuración"
                class="w-full"
                outlined
                @click="showConfigMessage"
              />
              <Button
                icon="pi pi-server"
                label="Probar API"
                class="w-full"
                outlined
                @click="testApiConnection"
                :loading="testingConnection"
              />
            </div>
          </template>
        </Card>

        <!-- Estado del sistema -->
        <Card class="system-status-card">
          <template #title>
            <h3>
              <i class="pi pi-desktop"></i>
              Estado del Sistema
            </h3>
          </template>
          <template #content>
            <div class="system-status">
              <div class="status-item">
                <span>API Connection:</span>
                <Chip 
                  :label="systemStatus.api ? 'Conectado' : 'Desconectado'"
                  :class="systemStatus.api ? 'status-success' : 'status-error'"
                >
                  <template #icon>
                    <i :class="systemStatus.api ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                  </template>
                </Chip>
              </div>
              <div class="status-item">
                <span>Base de Datos:</span>
                <Chip 
                  :label="systemStatus.database ? 'Conectado' : 'Desconectado'"
                  :class="systemStatus.database ? 'status-success' : 'status-error'"
                >
                  <template #icon>
                    <i :class="systemStatus.database ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
                  </template>
                </Chip>
              </div>
              <div class="status-item">
                <span>Última verificación:</span>
                <small class="text-muted">{{ lastSystemCheck }}</small>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>

    <!-- Toast para notificaciones -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { authService, tokenService } from '../services/api'

// Composables
const toast = useToast()

// Emits
defineEmits<{
  navigate: [view: string]
}>()

// Estado reactivo
const currentDateTime = ref('')
const userName = ref('')
const loadingActivity = ref(false)
const testingConnection = ref(false)

const stats = ref([
  {
    title: 'Total Usuarios',
    value: 0,
    icon: 'pi pi-users',
    color: '#3B82F6'
  },
  {
    title: 'Usuarios Activos',
    value: 0,
    icon: 'pi pi-user-check',
    color: '#10B981'
  },
  {
    title: 'Sucursales',
    value: 0,
    icon: 'pi pi-building',
    color: '#F59E0B'
  },
  {
    title: 'Accesos Hoy',
    value: 0,
    icon: 'pi pi-calendar',
    color: '#8B5CF6'
  }
])

const recentActivity = ref([
  {
    id: 1,
    type: 'login',
    description: 'Usuario admin inició sesión',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    type: 'user',
    description: 'Nuevo usuario registrado: juan.perez',
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 3,
    type: 'system',
    description: 'Sistema actualizado correctamente',
    timestamp: new Date(Date.now() - 3600000)
  }
])

const systemStatus = ref({
  api: false,
  database: false
})

const lastSystemCheck = ref('')

// Variables para intervalos
let dateTimeInterval: NodeJS.Timeout
let systemCheckInterval: NodeJS.Timeout

// Métodos
const updateDateTime = () => {
  const now = new Date()
  currentDateTime.value = now.toLocaleString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadDashboardData = () => {
  // Simular carga de datos - reemplazar con llamadas reales al API
  stats.value[0].value = Math.floor(Math.random() * 100) + 50
  stats.value[1].value = Math.floor(Math.random() * 50) + 25
  stats.value[2].value = Math.floor(Math.random() * 10) + 5
  stats.value[3].value = Math.floor(Math.random() * 200) + 100
}

const loadRecentActivity = async () => {
  loadingActivity.value = true
  try {
    // Simular carga de actividad - reemplazar con API real
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Por ahora usar datos simulados
    recentActivity.value = [
      {
        id: Date.now(),
        type: 'login',
        description: 'Usuario admin inició sesión',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        id: Date.now() + 1,
        type: 'user',
        description: 'Usuario actualizado: maria.garcia',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      },
      {
        id: Date.now() + 2,
        type: 'system',
        description: 'Respaldo realizado exitosamente',
        timestamp: new Date(Date.now() - Math.random() * 3600000)
      }
    ]
  } catch (error) {
    console.error('Error loading recent activity:', error)
  } finally {
    loadingActivity.value = false
  }
}

const checkSystemStatus = async () => {
  try {
    const response = await authService.testConnection()
    systemStatus.value.api = true
    systemStatus.value.database = response.isSuccess
  } catch (error) {
    systemStatus.value.api = false
    systemStatus.value.database = false
  }
  
  lastSystemCheck.value = new Date().toLocaleTimeString('es-ES')
}

const testApiConnection = async () => {
  testingConnection.value = true
  try {
    const response = await authService.testConnection()
    if (response.isSuccess) {
      toast.add({
        severity: 'success',
        summary: 'Conexión exitosa',
        detail: 'La API está respondiendo correctamente',
        life: 3000
      })
    } else {
      toast.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'API conectada pero con problemas en la base de datos',
        life: 4000
      })
    }
    await checkSystemStatus()
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error de conexión',
      detail: 'No se pudo conectar con la API',
      life: 4000
    })
  } finally {
    testingConnection.value = false
  }
}

const showConfigMessage = () => {
  toast.add({
    severity: 'info',
    summary: 'Información',
    detail: 'Módulo de configuración en desarrollo',
    life: 3000
  })
}

const getActivityIcon = (type: string) => {
  const icons = {
    login: 'pi pi-sign-in',
    user: 'pi pi-user-plus',
    system: 'pi pi-cog',
    error: 'pi pi-exclamation-triangle'
  }
  return icons[type as keyof typeof icons] || 'pi pi-info-circle'
}

const getActivityIconClass = (type: string) => {
  const classes = {
    login: 'activity-icon-login',
    user: 'activity-icon-user',
    system: 'activity-icon-system',
    error: 'activity-icon-error'
  }
  return classes[type as keyof typeof classes] || 'activity-icon-default'
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  const userData = tokenService.getUserData()
  userName.value = userData?.nombre || userData?.usuario || 'Usuario'
  
  updateDateTime()
  loadDashboardData()
  loadRecentActivity()
  checkSystemStatus()
  
  // Configurar intervalos
  dateTimeInterval = setInterval(updateDateTime, 60000) // Cada minuto
  systemCheckInterval = setInterval(checkSystemStatus, 300000) // Cada 5 minutos
})

onUnmounted(() => {
  if (dateTimeInterval) clearInterval(dateTimeInterval)
  if (systemCheckInterval) clearInterval(systemCheckInterval)
})
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.welcome-section h1 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.welcome-text {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1.1rem;
}

.datetime-section {
  text-align: right;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid var(--surface-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.stat-title {
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-color);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
}

.activity-card {
  height: fit-content;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0;
}

.card-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.loading-container {
  text-align: center;
  padding: 2rem 0;
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-color-secondary);
}

.empty-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-color-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: var(--surface-ground);
  transition: background 0.2s ease;
}

.activity-item:hover {
  background: var(--surface-hover);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.activity-icon-login {
  background: var(--blue-500);
}

.activity-icon-user {
  background: var(--green-500);
}

.activity-icon-system {
  background: var(--orange-500);
}

.activity-icon-error {
  background: var(--red-500);
}

.activity-icon-default {
  background: var(--gray-500);
}

.activity-details {
  flex: 1;
}

.activity-description {
  margin: 0 0 0.25rem 0;
  color: var(--text-color);
  font-weight: 500;
}

.activity-time {
  color: var(--text-color-secondary);
}

.sidebar-cards {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.system-status {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-success :deep(.p-chip) {
  background: var(--green-100);
  color: var(--green-800);
}

.status-error :deep(.p-chip) {
  background: var(--red-100);
  color: var(--red-800);
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .sidebar-cards {
    grid-template-columns: 1fr;
  }
}
</style>