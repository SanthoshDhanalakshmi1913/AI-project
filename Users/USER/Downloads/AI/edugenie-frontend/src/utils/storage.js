import { STORAGE_KEYS } from './constants';

export const storage = {
    getToken: () => {
        try {
            return localStorage.getItem(STORAGE_KEYS.TOKEN);
        } catch (e) {
            console.error('Failed to get token from storage', e);
            return null;
        }
    },
    setToken: (token) => {
        try {
            if (token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, token);
            } else {
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
            }
        } catch (e) {
            console.error('Failed to save token to storage', e);
        }
    },
    getUser: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to get user from storage', e);
            return null;
        }
    },
    setUser: (user) => {
        try {
            if (user) {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            } else {
                localStorage.removeItem(STORAGE_KEYS.USER);
            }
        } catch (e) {
            console.error('Failed to save user to storage', e);
        }
    },
    clearAuth: () => {
        try {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
        } catch (e) {
            console.error('Failed to clear auth storage', e);
        }
    },
    getTheme: () => {
        try {
            return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
        } catch (e) {
            return 'light';
        }
    },
    setTheme: (theme) => {
        try {
            localStorage.setItem(STORAGE_KEYS.THEME, theme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    },
};
