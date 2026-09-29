import axiosClient from '../api/axiosClient';

export const progressService = {
    getMyProgress: async () => {
        const response = await axiosClient.get('/progress/my');
        return response.data.data;
    },

    getCourseProgress: async (courseId) => {
        const response = await axiosClient.get(`/progress/course/${courseId}`);
        return response.data.data;
    },
};
