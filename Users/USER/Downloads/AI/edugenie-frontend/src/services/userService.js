import axiosClient from '../api/axiosClient';

export const userService = {
    getAllUsers: async () => {
        const response = await axiosClient.get('/users');
        return response.data.data || [];
    },

    getUserById: async (id) => {
        const response = await axiosClient.get(`/users/${id}`);
        return response.data.data;
    },

    createUser: async (userData) => {
        const response = await axiosClient.post('/users', userData);
        return response.data.data;
    },

    updateUser: async (id, userData) => {
        const response = await axiosClient.put(`/users/${id}`, userData);
        return response.data.data;
    },

    deleteUser: async (id) => {
        const response = await axiosClient.delete(`/users/${id}`);
        return response.data;
    },

    getAdminStats: async () => {
        const response = await axiosClient.get('/admin/stats');
        return response.data.data;
    },
};
