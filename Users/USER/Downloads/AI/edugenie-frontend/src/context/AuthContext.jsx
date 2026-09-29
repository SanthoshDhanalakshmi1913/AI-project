import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { ROLES, normalizeRole } from '../utils/constants';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => storage.getUser());
    const [token, setToken] = useState(() => storage.getToken());
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        authService.logout();
        storage.clearAuth();
        setUser(null);
        setToken(null);
    }, []);

    // Initial auth check and session validation on mount
    useEffect(() => {
        let isMounted = true;

        const verifyAuth = async () => {
            const savedToken = storage.getToken();
            if (savedToken) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    if (isMounted) {
                        setUser(currentUser);
                    }
                } catch (error) {
                    console.warn('Session verification failed, logging out', error);
                    if (isMounted) {
                        logout();
                    }
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        };

        verifyAuth();

        const handleUnauthorized = () => {
            logout();
        };

        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => {
            isMounted = false;
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
        };
    }, [logout]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            if (data?.token) {
                setToken(data.token);
                setUser(data.user);
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const register = async (name, email, password, role = ROLES.STUDENT) => {
        setLoading(true);
        try {
            const data = await authService.register(name, email, password, role);
            if (data?.token) {
                setToken(data.token);
                setUser(data.user);
            }
            return data;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = (updatedUserData) => {
        setUser((prev) => {
            const updated = { ...prev, ...updatedUserData };
            storage.setUser(updated);
            return updated;
        });
    };

    // Role helpers
    const currentRole = useMemo(() => {
        return normalizeRole(user?.role);
    }, [user?.role]);

    const isStudent = currentRole === ROLES.STUDENT;
    const isInstructor = currentRole === ROLES.INSTRUCTOR;
    const isAdmin = currentRole === ROLES.ADMIN;

    const hasRole = useCallback(
        (allowedRoles = []) => {
            if (!allowedRoles || allowedRoles.length === 0) return true;
            const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));
            return normalizedAllowed.includes(currentRole);
        },
        [currentRole]
    );

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        role: currentRole,
        isStudent,
        isInstructor,
        isAdmin,
        hasRole,
        loading,
        login,
        register,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
