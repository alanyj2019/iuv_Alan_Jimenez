import axios from 'axios'

// Configuración base de Axios - usar variable de entorno o valor por defecto
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
      // En lugar de redirigir, notificar al componente
      console.warn('Token expirado. Usuario debe autenticarse nuevamente.')
    }
    return Promise.reject(error)
  }
)

// Interfaces
export interface LoginRequest {
  usuario: string
  password: string
}

export interface LoginResponse {
  isSuccess: boolean
  message: string
  data: {
    token: string
    usuario: string
  }
}

export interface ApiResponse<T = any> {
  isSuccess: boolean
  message: string
  data: T
}

export interface ChangePasswordRequest {
  usuario: string
  contrasenaActual: string
  contrasenaNueva: string
}

export interface Usuario {
  usuarioId: number
  sucursalId: number
  rolId: number
  nombreUsuario: string
  nombre: string
  activo: boolean
  contrasena?: string
  sucursal?: {
    sucursalId: number
    nombre: string
  }
  rol?: {
    rolId: number
    nombre: string
  }
}

// Servicios de autenticación
export const authService = {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
      debugger
    console.log('Realizando login a:', API_BASE_URL + '/api/Autenticacion/login')
    const response = await api.post<LoginResponse>('/api/Autenticacion/login', credentials)
    return response.data
  },

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>('/api/Autenticacion/cambiar-contrasena', data)
    return response.data
  },

  async testConnection(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/api/Autenticacion/test-connection')
    return response.data
  },

  async testLogs(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/api/Autenticacion/test-logs')
    return response.data
  }
}

// Servicios de usuarios (futuros)
export const userService = {
  async getAll(page = 1, pageSize = 10): Promise<ApiResponse<Usuario[]>> {
    const response = await api.get<ApiResponse<Usuario[]>>(`/api/Usuarios?page=${page}&pageSize=${pageSize}`)
    return response.data
  },

  async getById(id: number): Promise<ApiResponse<Usuario>> {
    const response = await api.get<ApiResponse<Usuario>>(`/api/Usuarios/${id}`)
    return response.data
  },

  async create(userData: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    const response = await api.post<ApiResponse<Usuario>>('/api/Usuarios', userData)
    return response.data
  },

  async update(id: number, userData: Partial<Usuario>): Promise<ApiResponse<Usuario>> {
    const response = await api.put<ApiResponse<Usuario>>(`/api/Usuarios/${id}`, userData)
    return response.data
  },

  async delete(id: number): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`/api/Usuarios/${id}`)
    return response.data
  }
}

// Servicios de sucursales (futuros)
export const sucursalService = {
  async getAll(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/api/Sucursales')
    return response.data
  },

  async getById(id: number): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>(`/api/Sucursales/${id}`)
    return response.data
  }
}

// Servicios de roles (futuros)
export const roleService = {
  async getAll(): Promise<ApiResponse> {
    const response = await api.get<ApiResponse>('/api/Roles')
    return response.data
  }
}

// Utilidades para manejo de tokens
export const tokenService = {
  getToken(): string | null {
    return localStorage.getItem('authToken')
  },

  setToken(token: string): void {
    localStorage.setItem('authToken', token)
  },

  removeToken(): void {
    localStorage.removeItem('authToken')
  },

  getUserData(): any | null {
    const data = localStorage.getItem('userData')
    return data ? JSON.parse(data) : null
  },

  setUserData(userData: any): void {
    localStorage.setItem('userData', JSON.stringify(userData))
  },

  removeUserData(): void {
    localStorage.removeItem('userData')
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  logout(): void {
    this.removeToken()
    this.removeUserData()
  }
}

// Validadores comunes
export const validators = {
  required(value: string, fieldName = 'Campo'): string | null {
    return value && value.trim() ? null : `${fieldName} es requerido`
  },

  minLength(value: string, min: number, fieldName = 'Campo'): string | null {
    return value && value.length >= min ? null : `${fieldName} debe tener al menos ${min} caracteres`
  },

  maxLength(value: string, max: number, fieldName = 'Campo'): string | null {
    return value && value.length <= max ? null : `${fieldName} debe tener máximo ${max} caracteres`
  },

  email(value: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !value || emailRegex.test(value) ? null : 'Formato de email inválido'
  },

  password(value: string): string | null {
    if (!value) return 'Contraseña es requerida'
    if (value.length < 8) return 'Debe tener al menos 8 caracteres'
    if (!/[A-Z]/.test(value)) return 'Debe contener al menos una mayúscula'
    if (!/[a-z]/.test(value)) return 'Debe contener al menos una minúscula'
    if (!/\d/.test(value)) return 'Debe contener al menos un número'
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) return 'Debe contener al menos un carácter especial'
    return null
  },

  confirmPassword(password: string, confirmPassword: string): string | null {
    return password === confirmPassword ? null : 'Las contraseñas no coinciden'
  }
}

// Utilidades de formato
export const formatUtils = {
  date(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    }
    return new Date(date).toLocaleDateString('es-ES', defaultOptions)
  },

  datetime(date: Date | string, options: Intl.DateTimeFormatOptions = {}): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    }
    return new Date(date).toLocaleString('es-ES', defaultOptions)
  },

  currency(amount: number, currency = 'MXN'): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  number(number: number, decimals = 0): string {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(number)
  }
}

// Exportar instancia de axios configurada
export default api