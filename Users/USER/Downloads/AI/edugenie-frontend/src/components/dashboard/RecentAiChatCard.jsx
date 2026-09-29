import React from 'react';
import { formatRelativeTime } from '../../utils/formatters';
import { BotIcon, SparklesIcon, ChevronRightIcon } from '../Icons';
import './RecentAiChatCard.css';

const RecentAiChatCard = ({
    chat,
    onClick,
    className = '',
}) => {
    if (!chat) return null;

    return (
        <div className={`recent-ai-chat-item ${className}`} onClick={onClick}>
            <div className="chat-icon-indicator">
                <BotIcon size={18} />
            </div>

            <div className="chat-content-preview">
                <div className="chat-q-row">
                    <h4 className="chat-q-text">{chat.question}</h4>
                    {chat.createdAt && (
                        <span className="chat-time-text">{formatRelativeTime(chat.createdAt)}</span>
                    )}
                </div>
                {chat.answer && (
                    <p className="chat-ans-text">{chat.answer}</p>
                )}
            </div>

            <div className="chat-arrow-col">
                <ChevronRightIcon size={16} />
            </div>
        </div>
    );
};

export default RecentAiChatCard;
