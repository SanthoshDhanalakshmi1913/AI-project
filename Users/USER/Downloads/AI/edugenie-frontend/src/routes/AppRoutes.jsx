import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';
import AuthLayout from '../layouts/AuthLayout';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import StudentDashboard from '../pages/StudentDashboard';
import CourseList from '../pages/CourseList';
import CourseDetails from '../pages/CourseDetails';
import LessonDetails from '../pages/LessonDetails';
import InstructorLessons from '../pages/InstructorLessons';
import QuizList from '../pages/QuizList';
import QuizPage from '../pages/QuizPage';
import QuizResult from '../pages/QuizResult';
import AiChat from '../pages/AiChat';
import AiQuizGenerator from '../pages/AiQuizGenerator';
import AiStudyNotes from '../pages/AiStudyNotes';
import ProgressDashboard from '../pages/ProgressDashboard';
import Profile from '../pages/Profile';

// Admin Pages
import AdminDashboard from '../pages/AdminDashboard';
import UserManagement from '../pages/UserManagement';
import CourseManagement from '../pages/CourseManagement';
import QuizManagement from '../pages/QuizManagement';

// Dynamic role-based route resolvers
const DashboardResolver = () => {
    const { isAdmin } = useAuth();
    if (isAdmin) return <AdminDashboard />;
    return <StudentDashboard />;
};

const CoursesResolver = () => {
    const { isAdmin } = useAuth();
    if (isAdmin) return <CourseManagement />;
    return <CourseList />;
};

const QuizzesResolver = () => {
    const { isAdmin } = useAuth();
    if (isAdmin) return <QuizManagement />;
    return <QuizList />;
};

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected Dashboard Routes (Shared / Multi-Role) */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardResolver />} />
                <Route path="/courses" element={<CoursesResolver />} />
                <Route path="/courses/:id" element={<CourseDetails />} />
                <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonDetails />} />
                <Route path="/quizzes" element={<QuizzesResolver />} />
                <Route path="/quizzes/:id" element={<QuizPage />} />
                <Route path="/quizzes/:quizId/results/:attemptId" element={<QuizResult />} />
                <Route path="/profile" element={<Profile />} />

                {/* Student / Instructor / Admin Common AI Routes */}
                <Route
                    path="/progress"
                    element={
                        <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                            <ProgressDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ai-chat"
                    element={
                        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                            <AiChat />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ai-quiz"
                    element={
                        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                            <AiQuizGenerator />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ai-notes"
                    element={
                        <ProtectedRoute allowedRoles={['STUDENT', 'INSTRUCTOR', 'ADMIN']}>
                            <AiStudyNotes />
                        </ProtectedRoute>
                    }
                />

                {/* Instructor Specific Route */}
                <Route
                    path="/lessons"
                    element={
                        <ProtectedRoute allowedRoles={['INSTRUCTOR', 'ADMIN']}>
                            <InstructorLessons />
                        </ProtectedRoute>
                    }
                />

                {/* Admin Management Routes */}
                <Route
                    path="/users"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <UserManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/courses"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <CourseManagement />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/quizzes"
                    element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <QuizManagement />
                        </ProtectedRoute>
                    }
                />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
};

export default AppRoutes;
