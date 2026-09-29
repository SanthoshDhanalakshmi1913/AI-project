import axiosClient from '../api/axiosClient';

export const lessonService = {
    getLessonsByCourse: async (courseId) => {
        const response = await axiosClient.get(`/courses/${courseId}/lessons`);
        return response.data.data || [];
    },

    createLesson: async (courseId, lessonData) => {
        const response = await axiosClient.post(`/courses/${courseId}/lessons`, lessonData);
        return response.data.data;
    },

    updateLesson: async (lessonId, lessonData) => {
        const response = await axiosClient.put(`/lessons/${lessonId}`, lessonData);
        return response.data.data;
    },

    deleteLesson: async (lessonId) => {
        const response = await axiosClient.delete(`/lessons/${lessonId}`);
        return response.data;
    },
};
