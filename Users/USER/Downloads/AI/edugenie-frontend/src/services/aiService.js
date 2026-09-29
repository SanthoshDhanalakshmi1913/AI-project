import axiosClient from '../api/axiosClient';

export const aiService = {
    generateQuiz: async ({ topic, difficulty = 'MEDIUM', numberOfQuestions = 5 }) => {
        const response = await axiosClient.post('/ai/quiz/generate', {
            topic,
            difficulty,
            numberOfQuestions: Number(numberOfQuestions),
        });
        return response.data.data;
    },

    generateStudyNotes: async ({ topic }) => {
        const response = await axiosClient.post('/ai/study-notes', {
            topic,
        });
        return response.data.data;
    },

    askAssistant: async ({ prompt, topic = '', context = '', difficulty = 'INTERMEDIATE', numberOfQuestions = 5, taskType = 'EXPLAIN' }) => {
        const response = await axiosClient.post('/ai/assistant', {
            prompt,
            topic,
            context,
            difficulty,
            numberOfQuestions: Number(numberOfQuestions),
            taskType,
        });
        return response.data.data;
    },
};
