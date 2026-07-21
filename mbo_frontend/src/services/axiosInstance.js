import axios from 'axios'

/**
 * Vite SPA build of the RMHCDT portal.
 * In dev, vite.config.js proxies `/api` → http://localhost:8000 so cookies
 * flow through automatically (same-origin). In production, set
 * VITE_API_BASE_URL to the canonical backend URL.
 */
const isProd = import.meta.env.PROD
const apiBaseURL = isProd
  ? (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000')
  : '/api'

const api = axios.create({
  baseURL: apiBaseURL,
  withCredentials: true, // send httpOnly auth cookies (Django session/JWT)
  headers: { 'Content-Type': 'application/json' },
})

// Paths relative to baseURL ("/api") — must match error.config.url.
const PUBLIC_AUTH_PATHS = [
  '/auth/login/',
  '/auth/register/',
  '/auth/otp/send/',
  '/auth/otp/resend/',
  '/auth/otp/verify/',
  '/auth/password/reset/request/',
  '/auth/password/reset/verify/',
  '/auth/password/reset/confirm/',
]

function isPublicAuthRequest(url) {
  return PUBLIC_AUTH_PATHS.some((path) => url === path || url.startsWith(path))
}

// ── TOKEN REFRESH INTERCEPTOR ──────────────────────────────────────────
// When any request comes back with 401 (token expired), this interceptor:
// 1. Calls /auth/token/refresh/ to get a new access token (sets new cookie)
// 2. Retries the original request automatically
// 3. If refresh also fails (refresh token expired) → sends user to login
let isRefreshing = false
let failedQueue = []

function processQueue(error) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      error.response?.status !== 401 ||
      originalRequest._isRetry ||
      isPublicAuthRequest(originalRequest.url) ||
      originalRequest.url === '/auth/token/refresh/' ||
      originalRequest.url === '/auth/me/'
    ) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err))
    }

    originalRequest._isRetry = true
    isRefreshing = true

    try {
      await api.post('/auth/token/refresh/')
      processQueue(null)
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError)
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
