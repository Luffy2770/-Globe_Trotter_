import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (payload: any) => api.post('/auth/register', payload),
  demoLogin: () => api.post('/auth/demo-login'),
  getMe: () => api.get('/auth/me'),
};

export const profileApi = {
  getProfilePage: () => api.get('/profile'),
  updateProfile: (payload: any) => api.put('/profile', payload),
};

export const dashboardApi = {
  getSummary: () => api.get('/dashboard/summary'),
};

export const citiesApi = {
  search: (params?: any) => api.get('/cities', { params }),
};

export const activitiesApi = {
  getSuggestions: (params?: any) => api.get('/activities/suggestions', { params }),
  searchCatalog: (params?: any) => api.get('/catalog/search', { params }),
};

export const tripsApi = {
  getTripsListing: (params?: any) => api.get('/trips-listing', { params }),
  createTrip: (payload: any) => api.post('/trips', payload),
  updateTrip: (tripId: number, payload: any) => api.put(`/trips/${tripId}`, payload),
  deleteTrip: (tripId: number) => api.delete(`/trips/${tripId}`),
  getOverview: (tripId: number) => api.get(`/trips-listing/${tripId}/overview`),
};

export const itineraryApi = {
  getStops: (tripId: number) => api.get(`/trips/${tripId}/stops`),
  addStop: (tripId: number, payload: any) => api.post(`/trips/${tripId}/stops`, payload),
  updateStop: (tripId: number, stopId: number, payload: any) => api.put(`/trips/${tripId}/stops/${stopId}`, payload),
  deleteStop: (tripId: number, stopId: number) => api.delete(`/trips/${tripId}/stops/${stopId}`),
  assignActivity: (tripId: number, stopId: number, payload: any) => api.post(`/trips/${tripId}/stops/${stopId}/activities`, payload),
  removeActivity: (tripId: number, stopId: number, activityItemId: number) => api.delete(`/trips/${tripId}/stops/${stopId}/activities/${activityItemId}`),
  getBudget: (tripId: number) => api.get(`/trips/${tripId}/budget`),
};
