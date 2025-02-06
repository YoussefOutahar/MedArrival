import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders } from 'axios';
import { authStorage } from '@/services/LocalStorage/AuthStorage';
import { refreshToken } from '@/services/auth';
import { getFirstRoleFromJwt } from '@/utils/jwt-utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// axiosInstance.interceptors.response.use(
//   (response) => response,
//   async (error: AxiosError) => {
//     const originalRequest = error.config as InternalAxiosRequestConfig;
//     if (!originalRequest) {
//       return Promise.reject(error);
//     }

//     const isRefreshRequest = originalRequest.url?.includes('/refresh-token');
    
//     if (isRefreshRequest && (error.response?.status === 401 || error.response?.status === 403)) {
//       authStorage.clearAuth();
//       window.location.href = '/auth/signin';
//       return Promise.reject(error);
//     }

//     if (!isRefreshRequest && 
//         (error.response?.status === 403 || error.response?.status === 401) && 
//         !originalRequest._retry) {
      
//       originalRequest._retry = true;
//       const currentRefreshToken = authStorage.getRefreshToken();

//       if (!currentRefreshToken) {
//         authStorage.clearAuth();
//         window.location.href = '/auth/signin';
//         return Promise.reject(new Error('No refresh token available'));
//       }

//       try {
//         const newToken = await refreshToken(currentRefreshToken);
//         authStorage.setToken(newToken);
//         authStorage.setRole(getFirstRoleFromJwt(newToken));

//         if (!originalRequest.headers) {
//           originalRequest.headers = new AxiosHeaders();
//         }
//         originalRequest.headers.set('Authorization', `Bearer ${newToken}`);

//         return axiosInstance(originalRequest);
//       } catch (refreshError) {
//         console.error('Token refresh failed:', refreshError);
//         authStorage.clearAuth();
//         window.location.href = '/auth/signin';
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export default axiosInstance;