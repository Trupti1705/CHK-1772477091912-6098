import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function Chatbot({ stations }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: '👋 Hi! I\'m your AirWatch assistant. Ask me about air quality in Pune!'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // ✅ IMPORTANT: Replace 'YOUR_API_KEY_HERE' with your actual Gemini API key
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
    console.log('🔑 API Key loaded:', API_KEY ? '✅ Key exists' : '❌ Key missing');// 👈 PUT YOUR API KEY HERE
    // ✅ ADD THIS TEMPORARY DEBUGGING CODE
    useEffect(() => {
        const listModels = async () => {
            try {
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
                );
                const data = await response.json();
                console.log('📋 Available models:', data.models?.map(m => m.name));
            } catch (error) {
                console.error('Error listing models:', error);
            }
        };

        if (API_KEY) {
            listModels();
        }
    }, []);
    const genAI = new GoogleGenerativeAI(API_KEY);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message to Gemini AI
    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Add user message to chat
        const newMessages = [
            ...messages,
            { role: 'user', content: userMessage }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Prepare context with real-time station data
            const stationsContext = stations.map(station => 
                `${station.name}: AQI ${station.aqi}, PM2.5 ${station.PM25} µg/m³, PM10 ${station.PM10} µg/m³`
            ).join('\n');

            const prompt = `You are an air quality assistant for AirWatch, a real-time air monitoring system in Pune, India.

Current live data from monitoring stations:
${stationsContext}

AQI Categories:
- 0-50: Good (Green)
- 51-100: Moderate (Yellow)
- 101-150: Unhealthy for Sensitive Groups (Orange)
- 151-200: Unhealthy (Red)
- 201+: Very Unhealthy (Dark Red)

User question: ${userMessage}

Provide helpful, accurate, and concise advice. If asked about specific stations, use the live data above. Give health recommendations based on current AQI levels.`;

            // Call Gemini API
            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Add AI response to chat
            setMessages([
                ...newMessages,
                { role: 'assistant', content: text }
            ]);
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            setMessages([
                ...newMessages,
                { 
                    role: 'assistant', 
                    content: '❌ Sorry, I encountered an error. Please check your API key or try again.' 
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Suggested questions
    const suggestedQuestions = [
        "What's the current AQI in Pimpri?",
        "Should I go jogging today?",
        "Which area has the best air quality?",
        "What health precautions should I take?"
    ];

    const handleSuggestedQuestion = (question) => {
        setInputMessage(question);
    };

    return (
        <>
            {/* Floating Chat Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    style={styles.floatingButton}
                >
                    <span style={styles.chatIcon}>💬</span>
                    <div style={styles.buttonText}>
                        <div style={styles.buttonTitle}>Ask About</div>
                        <div style={styles.buttonSubtitle}>Air Quality</div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={styles.chatWindow}>
                    {/* Header */}
                    <div style={styles.chatHeader}>
                        <div style={styles.headerContent}>
                            <span style={styles.headerIcon}>🤖</span>
                            <div>
                                <div style={styles.headerTitle}>AirWatch Assistant</div>
                                <div style={styles.headerSubtitle}>Powered by AI</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={styles.closeButton}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={styles.messagesArea}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={
                                    msg.role === 'user'
                                        ? styles.userMessage
                                        : styles.assistantMessage
                                }
                            >
                                <div style={styles.messageContent}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isLoading && (
                            <div style={styles.assistantMessage}>
                                <div style={styles.messageContent}>
                                    <span style={styles.loadingDots}>●●●</span>
                                    Thinking...
                                </div>
                            </div>
                        )}

                        {/* Suggested questions (show only if chat is new) */}
                        {messages.length === 1 && (
                            <div style={styles.suggestedSection}>
                                <div style={styles.suggestedTitle}>Try asking:</div>
                                {suggestedQuestions.map((question, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSuggestedQuestion(question)}
                                        style={styles.suggestedButton}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={styles.inputArea}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about air quality..."
                            style={styles.input}
                            disabled={isLoading}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            style={{
                                ...styles.sendButton,
                                opacity: (!inputMessage.trim() || isLoading) ? 0.5 : 1,
                                cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = {
    // Floating button (bottom-right corner)
    floatingButton: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: '600',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        ':hover': {
            transform: 'scale(1.05)'
        }
    },
    chatIcon: {
        fontSize: '24px'
    },
    buttonText: {
        textAlign: 'left'
    },
    buttonTitle: {
        fontSize: '14px',
        fontWeight: '600'
    },
    buttonSubtitle: {
        fontSize: '11px',
        opacity: 0.9
    },
    // Chat window
    chatWindow: {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        width: '400px',
        height: '600px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        overflow: 'hidden'
    },
    // Header
    chatHeader: {
        backgroundColor: '#3b82f6',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerContent: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    headerIcon: {
        fontSize: '24px'
    },
    headerTitle: {
        fontSize: '16px',
        fontWeight: '600'
    },
    headerSubtitle: {
        fontSize: '11px',
        opacity: 0.9
    },
    closeButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        padding: '0',
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        transition: 'background-color 0.2s'
    },
    // Messages area
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    userMessage: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    assistantMessage: {
        display: 'flex',
        justifyContent: 'flex-start'
    },
    messageContent: {
        padding: '12px 16px',
        borderRadius: '12px',
        maxWidth: '80%',
        fontSize: '14px',
        lineHeight: '1.5',
        wordWrap: 'break-word'
    },
    
    loadingDots: {
        marginRight: '8px',
        animation: 'pulse 1.5s infinite'
    },
    // Suggested questions
    suggestedSection: {
        marginTop: '12px'
    },
    suggestedTitle: {
        fontSize: '12px',
        color: '#64748b',
        marginBottom: '8px',
        fontWeight: '600'
    },
    suggestedButton: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '10px 12px',
        marginBottom: '6px',
        backgroundColor: 'white',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#3b82f6',
        cursor: 'pointer',
        transition: 'all 0.2s'
    },
    // Input area
    inputArea: {
        padding: '16px 20px',
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        gap: '8px'
    },
    input: {
        flex: 1,
        padding: '12px 16px',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s'
    },
    sendButton: {
        backgroundColor: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        fontSize: '18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s'
    }
};

// Add dynamic styles for user/assistant messages
styles.userMessage = {
    ...styles.userMessage,
    '& > div': {
        backgroundColor: '#3b82f6',
        color: 'white'
    }
};

styles.assistantMessage = {
    ...styles.assistantMessage,
    '& > div': {
        backgroundColor: 'white',
        color: '#1e293b',
        border: '1px solid #e2e8f0'
    }
};

export default Chatbot;