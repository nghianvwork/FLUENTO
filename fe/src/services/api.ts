import axios, { AxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

const refreshApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
const refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token?: string) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
      return;
    }
    resolve(token);
  });
  refreshQueue.length = 0;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('enova_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = (err.config || {}) as AxiosRequestConfig & { _retry?: boolean };
    const status = err.response?.status;
    const isAuthEndpoint = typeof originalConfig.url === 'string'
      && originalConfig.url.includes('/auth/');

    if (status !== 401 || originalConfig._retry || isAuthEndpoint) {
      if (status === 401) {
        localStorage.removeItem('enova_token');
        localStorage.removeItem('enova_refresh_token');
        localStorage.removeItem('enova_user');
        window.location.href = '/login';
      }
      return Promise.reject(err);
    }

    const refreshToken = localStorage.getItem('enova_refresh_token');
    if (!refreshToken) {
      localStorage.removeItem('enova_token');
      localStorage.removeItem('enova_refresh_token');
      localStorage.removeItem('enova_user');
      window.location.href = '/login';
      return Promise.reject(err);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalConfig.headers = originalConfig.headers || {};
            originalConfig.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          reject,
        });
      });
    }

    originalConfig._retry = true;
    isRefreshing = true;

    try {
      const response = await refreshApi.post('/auth/refresh', { refreshToken });
      const nextToken = response.data?.data?.token;
      const nextRefresh = response.data?.data?.refreshToken;

      if (!nextToken || !nextRefresh) {
        throw new Error('Refresh token response invalid');
      }

      localStorage.setItem('enova_token', nextToken);
      localStorage.setItem('enova_refresh_token', nextRefresh);
      api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
      processQueue(null, nextToken);

      originalConfig.headers = originalConfig.headers || {};
      originalConfig.headers.Authorization = `Bearer ${nextToken}`;
      return api(originalConfig);
    } catch (refreshError) {
      processQueue(refreshError);
      localStorage.removeItem('enova_token');
      localStorage.removeItem('enova_refresh_token');
      localStorage.removeItem('enova_user');
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
