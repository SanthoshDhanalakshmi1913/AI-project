import axiosClient from '../api/axiosClient';

export const courseService = {
    getAllCourses: async () => {
        const response = await axiosClient.get('/courses');
        return response.data.data || [];
    },

    getCourseById: async (id) => {
        const response = await axiosClient.get(`/courses/${id}`);
        return response.data.data;
    },

    createCourse: async (courseData) => {
        const response = await axiosClient.post('/courses', courseData);
        return response.data.data;
    },

    updateCourse: async (id, courseData) => {
        const response = await axiosClient.put(`/courses/${id}`, courseData);
        return response.data.data;
    },

    deleteCourse: async (id) => {
        const response = await axiosClient.delete(`/courses/${id}`);
        return response.data;
    },
};
