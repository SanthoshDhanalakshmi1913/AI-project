import axiosClient from '../api/axiosClient';

export const quizService = {
    getAllQuizzes: async () => {
        const response = await axiosClient.get('/quizzes');
        return response.data.data || [];
    },

    getQuizById: async (id) => {
        const response = await axiosClient.get(`/quizzes/${id}`);
        return response.data.data;
    },

    getQuestionsByQuiz: async (quizId) => {
        const response = await axiosClient.get(`/quizzes/${quizId}/questions`);
        return response.data.data || [];
    },

    submitQuiz: async (quizId, answers) => {
        // answers array of { questionId, selectedAnswer }
        const response = await axiosClient.post(`/quizzes/${quizId}/attempt`, { answers });
        return response.data.data;
    },

    getMyAttempts: async () => {
        const response = await axiosClient.get('/quiz-attempts/my');
        return response.data.data || [];
    },

    getAttemptById: async (attemptId) => {
        const response = await axiosClient.get(`/quiz-attempts/${attemptId}`);
        return response.data.data;
    },

    createQuiz: async (quizData) => {
        const response = await axiosClient.post('/quizzes', quizData);
        return response.data.data;
    },

    createQuestion: async (quizId, questionData) => {
        const response = await axiosClient.post(`/quizzes/${quizId}/questions`, questionData);
        return response.data.data;
    },
};
