import api from './api';

export const getSummary = (params) => api.get('/reports/summary', { params });
export const getByCategory = (params) => api.get('/reports/by-category', { params });
export const getByTime = (params) => api.get('/reports/by-time', { params });
