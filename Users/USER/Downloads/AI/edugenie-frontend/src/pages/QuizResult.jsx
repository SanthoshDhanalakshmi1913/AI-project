import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizService } from '../services/quizService';
import QuizResultView from '../components/QuizResultView';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ChevronLeftIcon } from '../components/Icons';
import './Quiz.css';

const QuizResult = () => {
    const { quizId, attemptId } = useParams();
    const navigate = useNavigate();

    const [attempt, setAttempt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAttemptData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await quizService.getAttemptById(attemptId);
            setAttempt(data);
        } catch (err) {
            setError(err.message || 'Failed to load quiz results');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttemptData();
    }, [attemptId]);

    if (loading) {
        return <LoadingSpinner text="Analyzing your assessment performance..." />;
    }

    if (error || !attempt) {
        return (
            <div className="quiz-results-page">
                <ErrorMessage message={error || 'Quiz result not found'} onRetry={loadAttemptData} />
                <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    return (
        <div className="quiz-results-page">
            <div className="back-nav">
                <Link to="/quizzes" className="section-view-all">
                    <ChevronLeftIcon size={16} /> Back to All Quizzes
                </Link>
            </div>

            <QuizResultView
                attempt={attempt}
                onRetake={() => navigate(`/quizzes/${quizId}`)}
                onBackToList={() => navigate('/quizzes')}
                onViewProgress={() => navigate('/progress')}
            />
        </div>
    );
};

export default QuizResult;
