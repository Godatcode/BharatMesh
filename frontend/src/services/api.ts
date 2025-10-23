/**
 * API Service - HTTP client with offline queue
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { ApiResponse } from '@bharatmesh/shared';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

class ApiService {
  private client: AxiosInstance;
  private offlineQueue: Array<{ config: AxiosRequestConfig; resolve: Function; reject: Function }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // Increased to 30 seconds for Render wake-up time
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor - attach auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Token expired - try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refreshToken
              });

              const { accessToken } = response.data.data;
              localStorage.setItem('accessToken', accessToken);

              // Retry original request
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        // Network error - queue request for retry when online
        if (!error.response && error.message === 'Network Error') {
          return this.queueOfflineRequest(originalRequest);
        }

        return Promise.reject(error);
      }
    );

    // Listen for online event to process queue
    window.addEventListener('online', () => this.processOfflineQueue());
  }

  private queueOfflineRequest(config: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.offlineQueue.push({ config, resolve, reject });
      console.log('📋 Request queued for offline processing');
    });
  }

  private async processOfflineQueue(): Promise<void> {
    console.log(`🔄 Processing ${this.offlineQueue.length} queued requests...`);

    while (this.offlineQueue.length > 0) {
      const { config, resolve, reject } = this.offlineQueue.shift()!;
      try {
        const response = await this.client(config);
        resolve(response);
      } catch (error) {
        reject(error);
      }
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

export const api = new ApiService();

// Specific API endpoints
export const authApi = {
  login: (phone: string, pin: string) => 
    api.post('/auth/login', { phone, pin }),
  
  register: (userData: any) => 
    api.post('/auth/register', userData),
  
  refresh: (refreshToken: string) => 
    api.post('/auth/refresh', { refreshToken }),
  
  getProfile: () => 
    api.get('/auth/me'),
  
  updateProfile: (updates: any) => 
    api.put('/auth/me', updates)
};

export const billingApi = {
  createInvoice: (invoice: any) => 
    api.post('/billing/invoices', invoice),
  
  getInvoices: (params?: any) => 
    api.get('/billing/invoices', { params }),
  
  getInvoice: (id: string) => 
    api.get(`/billing/invoices/${id}`),
  
  getStats: () => 
    api.get('/billing/stats')
};

export const inventoryApi = {
  createProduct: (product: any) => 
    api.post('/inventory/products', product),
  
  getProducts: (params?: any) => 
    api.get('/inventory/products', { params }),
  
  getProduct: (id: string) => 
    api.get(`/inventory/products/${id}`),
  
  updateProduct: (id: string, updates: any) => 
    api.put(`/inventory/products/${id}`, updates),
  
  adjustStock: (id: string, delta: number, reason: string, notes?: string) => 
    api.post(`/inventory/products/${id}/adjust-stock`, { delta, reason, notes }),
  
  getAlerts: () => 
    api.get('/inventory/alerts'),
  
  getStats: () => 
    api.get('/inventory/stats')
};

export const devicesApi = {
  register: (device: any) => 
    api.post('/devices', device),
  
  getDevices: () => 
    api.get('/devices'),
  
  getDevice: (id: string) => 
    api.get(`/devices/${id}`),
  
  updateDevice: (id: string, updates: any) => 
    api.put(`/devices/${id}`, updates),
  
  heartbeat: (id: string, status: any) => 
    api.post(`/devices/${id}/heartbeat`, status),
  
  deactivate: (id: string) => 
    api.delete(`/devices/${id}`)
};

export const ordersApi = {
  createOrder: (order: any) =>
    api.post('/orders', order),

  getOrders: (params?: any) =>
    api.get('/orders', { params }),

  getOrder: (id: string) =>
    api.get(`/orders/${id}`),

  updateOrder: (id: string, order: any) =>
    api.put(`/orders/${id}`, order),

  deleteOrder: (id: string) =>
    api.delete(`/orders/${id}`)
};

export const attendanceApi = {
  getAttendance: (params?: any) =>
    api.get('/attendance', { params }),

  clockIn: (data: any) =>
    api.post('/attendance/clock-in', data),

  clockOut: (data: any) =>
    api.post('/attendance/clock-out', data),

  getStats: (params?: any) =>
    api.get('/attendance/stats', { params })
};

