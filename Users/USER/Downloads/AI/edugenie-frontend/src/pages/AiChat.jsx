import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import { chatService } from '../services/chatService';
import { ChatSidebar, ChatWindow } from '../components/chat';
import './AiTools.css';

const AiChat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConversationId, setActiveConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputPrompt, setInputPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Fetch conversation history on component mount
    const loadChatHistory = useCallback(async () => {
        setHistoryLoading(true);
        try {
            const history = await chatService.getChatHistory();
            if (history && history.length > 0) {
                setConversations(history);
            } else {
                setConversations([]);
            }
        } catch (err) {
            console.warn('Could not load chat history', err);
            setConversations([]);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        loadChatHistory();
    }, [loadChatHistory]);

    // Send a message to /api/chat
    const handleSendMessage = async (customMessage = '') => {
        const msgText = (customMessage || inputPrompt).trim();
        if (!msgText || loading) return;

        const timestamp = new Date().toISOString();
        const userMsg = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: msgText,
            timestamp,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputPrompt('');
        setLoading(true);
        setError(null);

        try {
            // POST /api/chat with { message: msgText }
            const data = await chatService.askQuestion(msgText);
            const aiAnswer = data?.answer || (typeof data === 'string' ? data : 'I have analyzed your question.');

            const aiMsg = {
                id: `ai-${Date.now()}`,
                sender: 'ai',
                text: aiAnswer,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, aiMsg]);

            // Update conversations list with new interaction
            const newConvItem = {
                conversationId: activeConversationId || Date.now(),
                question: msgText,
                answer: aiAnswer,
                createdAt: timestamp,
            };

            setConversations((prev) => {
                const filtered = prev.filter((c) => (c.conversationId || c.id) !== activeConversationId);
                return [newConvItem, ...filtered];
            });
        } catch (err) {
            const errorMsg = err.message || 'Failed to get response from EduGenie AI';
            setError(errorMsg);

            const errorAiMsg = {
                id: `err-${Date.now()}`,
                sender: 'ai',
                text: `⚠️ Error generating AI response: ${errorMsg}. Please ensure your backend is active.`,
                isError: true,
                failedPrompt: msgText,
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, errorAiMsg]);
        } finally {
            setLoading(false);
        }
    };

    // Start a fresh conversation
    const handleNewChat = () => {
        setActiveConversationId(null);
        setMessages([]);
        setError(null);
        setInputPrompt('');
    };

    // Switch to a previous conversation from history
    const handleSelectConversation = (conv) => {
        const convId = conv.conversationId || conv.id;
        setActiveConversationId(convId);
        setError(null);

        const loadedMessages = [];
        if (conv.question) {
            loadedMessages.push({
                id: `user-${convId}`,
                sender: 'user',
                text: conv.question,
                timestamp: conv.createdAt,
            });
        }
        if (conv.answer) {
            loadedMessages.push({
                id: `ai-${convId}`,
                sender: 'ai',
                text: conv.answer,
                timestamp: conv.createdAt,
            });
        }

        setMessages(loadedMessages);
    };

    // Clear current active chat view
    const handleClearChat = () => {
        setMessages([]);
        setError(null);
        setActiveConversationId(null);
    };

    // Retry a failed message
    const handleRetry = (failedMessage) => {
        const promptToRetry = failedMessage?.failedPrompt || inputPrompt;
        if (promptToRetry) {
            handleSendMessage(promptToRetry);
        }
    };

    // Delete a conversation from the sidebar list
    const handleDeleteConversation = (id) => {
        setConversations((prev) => prev.filter((c) => (c.conversationId || c.id) !== id));
        if (activeConversationId === id) {
            handleNewChat();
        }
    };

    return (
        <div className="ai-chat-page-root">
            <div className="ai-chat-layout-wrapper">
                <ChatSidebar
                    conversations={conversations}
                    activeId={activeConversationId}
                    onSelectConversation={handleSelectConversation}
                    onNewChat={handleNewChat}
                    onDeleteConversation={handleDeleteConversation}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    loading={historyLoading}
                />

                <ChatWindow
                    messages={messages}
                    loading={loading}
                    error={error}
                    onClearChat={handleClearChat}
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                    onSendMessage={() => handleSendMessage()}
                    onSelectSuggestion={(suggestion) => handleSendMessage(suggestion)}
                    onRetry={handleRetry}
                    inputPrompt={inputPrompt}
                    setInputPrompt={setInputPrompt}
                    user={user}
                />
            </div>
        </div>
    );
};

export default AiChat;
