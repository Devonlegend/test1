import api from './axiosInstance'

export const getSchemes = (params = {}) => api.get('/schemes/', { params })

export const createScheme = (body) => api.post('/schemes/', body)

export const publishScheme = (id) => api.post(`/schemes/${id}/publish/`)

export const closeScheme = (id) => api.post(`/schemes/${id}/close/`)

export const getScheme = (id) => api.get(`/schemes/${id}/`)

export const updateScheme = (id, body) => api.patch(`/schemes/${id}/`, body)

export const reopenScheme = (id) => api.post(`/schemes/${id}/reopen/`)

export const getSchemeFields = (id) => api.get(`/schemes/${id}/fields/`)

export const getCycles = (params = {}) =>
  api.get('/schemes/cycles/', { params })

export const createCycle = (body) => api.post('/schemes/cycles/', body)

export const activateCycle = (id) =>
  api.post(`/schemes/cycles/${id}/activate/`)

export const updateCycle = (id, body) =>
  api.patch(`/schemes/cycles/${id}/`, body)

export const deleteCycle = (id) => api.delete(`/schemes/cycles/${id}/`)

export const getProviders = (params = {}) =>
  api.get('/schemes/providers/', { params })

export const createProvider = (body) => api.post('/schemes/providers/', body)

export const updateProvider = (id, body) =>
  api.patch(`/schemes/providers/${id}/`, body)

export const deleteProvider = (id) => api.delete(`/schemes/providers/${id}/`)
