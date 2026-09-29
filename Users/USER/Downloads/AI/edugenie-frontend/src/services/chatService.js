import axiosClient from '../api/axiosClient';

export const chatService = {
    askQuestion: async (message) => {
        const response = await axiosClient.post('/chat', { message });
        return response.data.data;
    },

    getChatHistory: async () => {
        const response = await axiosClient.get('/chat/history');
        return response.data.data || [];
    },
};
