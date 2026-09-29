import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { storage } from '../utils/storage';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Request interceptor: attach JWT token if available
axiosClient.interceptors.request.use(
    (config) => {
        const token = storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: extract data, handle 401/errors
axiosClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized
            if (error.response.status === 401) {
                storage.clearAuth();
                // If not already on auth pages, we can dispatch an event or let auth context catch it
                if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
                }
            }

            const errorMsg =
                error.response.data?.message ||
                error.response.data?.error ||
                (typeof error.response.data === 'string' ? error.response.data : 'Request failed');

            return Promise.reject(new Error(errorMsg));
        } else if (error.request) {
            return Promise.reject(new Error('Network error: Unable to connect to server. Please check your backend connection.'));
        } else {
            return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
        }
    }
);

export default axiosClient;
