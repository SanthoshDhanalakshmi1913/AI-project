import axiosClient from '../api/axiosClient';
import { storage } from '../utils/storage';

export const authService = {
    login: async (email, password) => {
        const response = await axiosClient.post('/auth/login', { email, password });
        const { data } = response.data;
        if (data?.token) {
            storage.setToken(data.token);
            storage.setUser(data.user);
        }
        return data;
    },

    register: async (name, email, password, role = 'STUDENT') => {
        const response = await axiosClient.post('/auth/register', { name, email, password, role });
        const { data } = response.data;
        if (data?.token) {
            storage.setToken(data.token);
            storage.setUser(data.user);
        }
        return data;
    },

    getCurrentUser: async () => {
        const response = await axiosClient.get('/auth/me');
        const user = response.data.data;
        if (user) {
            storage.setUser(user);
        }
        return user;
    },

    logout: () => {
        storage.clearAuth();
    },
};
