import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import Button from '../Button';
import { PlayCircleIcon, BookIcon, UserIcon } from '../Icons';
import './ContinueLearningCard.css';

const ContinueLearningCard = ({
    course,
    progressPercentage = 50,
    currentLessonTitle = 'Next Lesson',
    onResume,
    className = '',
}) => {
    const navigate = useNavigate();

    if (!course) return null;

    const handleResume = () => {
        if (onResume) {
            onResume(course);
        } else {
            navigate(`/courses/${course.id}`);
        }
    };

    return (
        <div className={`continue-learning-card ${className}`}>
            <div className="continue-card-badge-row">
                <span className="course-cat-tag">{course.category || 'General'}</span>
                <span className="course-level-tag">{course.level || 'Intermediate'}</span>
            </div>

            <h3 className="continue-course-title">{course.title}</h3>
            <p className="continue-course-desc">{course.description}</p>

            <div className="continue-lesson-pointer">
                <BookIcon size={16} className="lesson-pointer-icon" />
                <span>Up next: <strong>{currentLessonTitle}</strong></span>
            </div>

            <div className="continue-progress-section">
                <ProgressBar
                    value={progressPercentage}
                    label="Course Progress"
                    size="sm"
                    color="primary"
                />
            </div>

            <div className="continue-card-footer">
                <div className="continue-instructor-meta">
                    <UserIcon size={14} />
                    <span>{course.instructorName || 'Lead Instructor'}</span>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    icon={PlayCircleIcon}
                    onClick={handleResume}
                >
                    Resume Learning
                </Button>
            </div>
        </div>
    );
};

export default ContinueLearningCard;
