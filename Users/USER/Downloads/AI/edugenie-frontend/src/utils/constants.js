export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api';

export const STORAGE_KEYS = {
    TOKEN: 'edugenie_jwt_token',
    USER: 'edugenie_user_data',
    THEME: 'edugenie_theme',
};

export const ROLES = {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    ADMIN: 'ADMIN',
};

export const normalizeRole = (role) => {
    if (!role) return ROLES.STUDENT;
    const clean = String(role).toUpperCase().replace('ROLE_', '');
    return clean;
};

export const DIFFICULTY_LEVELS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
];

export const AI_TASK_TYPES = {
    EXPLAIN: 'EXPLAIN',
    EXAMPLES: 'EXAMPLES',
    SIMPLIFY: 'SIMPLIFY',
    QUIZ: 'QUIZ',
    STUDY_NOTES: 'STUDY_NOTES',
    INTERVIEW_QUESTIONS: 'INTERVIEW_QUESTIONS',
    SUMMARIZE: 'SUMMARIZE',
    FOLLOW_UP: 'FOLLOW_UP',
};
