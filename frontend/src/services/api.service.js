import axios from 'axios';
import { store } from '../store/index';
import { logout } from '../store/authSlice';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isUnauthorized = error.response?.status === 401;
        const isLoginRequest = error.config?.url?.includes('/auth/login');

        if (isUnauthorized && !isLoginRequest && localStorage.getItem('token')) {
            store.dispatch(logout());
        }

        return Promise.reject(error);
    }
);

export default api;
