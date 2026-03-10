import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

function FormattedMessage({ content }) {
    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }

        if (line.startsWith('## ') || line.startsWith('# ')) {
            const text = line.replace(/^##?\s/, '');
            elements.push(<div key={i} style={fmt.heading}>{text}</div>);
        } else if (/^\*\*[^*]+\*\*:?$/.test(line.trim())) {
            const text = line.replace(/\*\*/g, '').replace(/:$/, '');
            elements.push(<div key={i} style={fmt.sectionLabel}>{text}</div>);
        } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            const text = line.trim().replace(/^[\*\-•]\s/, '');
            elements.push(
                <div key={i} style={fmt.bullet}>
                    <span style={fmt.bulletDot}>–</span>
                    <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />
                </div>
            );
        } else if (/^\d+\.\s/.test(line.trim())) {
            const num = line.match(/^(\d+)\./)[1];
            const text = line.replace(/^\d+\.\s/, '');
            elements.push(
                <div key={i} style={fmt.numbered}>
                    <span style={fmt.numberedBadge}>{num}</span>
                    <span dangerouslySetInnerHTML={{ __html: renderInline(text) }} />
                </div>
            );
        } else {
            elements.push(
                <p key={i} style={fmt.paragraph}
                    dangerouslySetInnerHTML={{ __html: renderInline(line) }} />
            );
        }
        i++;
    }

    return <div style={fmt.wrapper}>{elements}</div>;
}

function renderInline(text) {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#3730a3;font-weight:600">$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code style="background:#eef2ff;color:#4338ca;padding:1px 5px;border-radius:4px;font-size:12px;font-family:monospace">$1</code>');
}

const fmt = {
    wrapper: { display: 'flex', flexDirection: 'column', gap: '6px' },
    heading: {
        fontSize: '13px', fontWeight: '700', color: '#3730a3',
        borderBottom: '1px solid #e0e7ff', paddingBottom: '4px',
        marginBottom: '2px', letterSpacing: '0.02em'
    },
    sectionLabel: {
        fontSize: '11px', fontWeight: '700', color: '#374151',
        marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em'
    },
    bullet: {
        display: 'flex', gap: '8px', alignItems: 'flex-start',
        fontSize: '13px', color: '#374151', lineHeight: '1.6'
    },
    bulletDot: { color: '#94a3b8', fontSize: '13px', flexShrink: 0, fontWeight: '300' },
    numbered: {
        display: 'flex', gap: '8px', alignItems: 'flex-start',
        fontSize: '13px', color: '#374151', lineHeight: '1.6'
    },
    numberedBadge: {
        minWidth: '18px', height: '18px', borderRadius: '4px',
        background: '#e0e7ff', color: '#3730a3', fontSize: '10px',
        fontWeight: '700', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: '2px'
    },
    paragraph: { fontSize: '13px', color: '#374151', lineHeight: '1.7', margin: 0 }
};

function AQIBadge({ aqi }) {
    const getColor = (v) => {
        if (v <= 50) return { bg: '#dcfce7', text: '#15803d', label: 'Good' };
        if (v <= 100) return { bg: '#fef9c3', text: '#854d0e', label: 'Moderate' };
        if (v <= 150) return { bg: '#ffedd5', text: '#9a3412', label: 'Sensitive' };
        if (v <= 200) return { bg: '#fee2e2', text: '#b91c1c', label: 'Unhealthy' };
        return { bg: '#fce7f3', text: '#9d174d', label: 'Hazardous' };
    };
    const c = getColor(aqi);
    return (
        <span style={{
            background: c.bg, color: c.text, fontSize: '10px', fontWeight: '700',
            padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.03em'
        }}>{c.label} · {aqi}</span>
    );
}

const WindIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 2 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
    </svg>
);
const GlobeIcon = ({ size = 20, stroke = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

export default function Chatbot({ stations }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hi, I\'m your **AirWatch** assistant.\n\nAsk me anything about air quality in Pune — station levels, health tips, or safe activity recommendations.' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(API_KEY);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;
        const userMessage = inputMessage.trim();
        setInputMessage('');
        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const stationsContext = stations.map(s =>
                `${s.name}: AQI ${s.aqi}, PM2.5 ${s.PM25} µg/m³, PM10 ${s.PM10} µg/m³`
            ).join('\n');

            const prompt = `You are AirWatch AI, an air quality assistant for Pune, India. Be concise, helpful, and well-structured. Do not use any emojis.

Use markdown formatting in your responses:
- Use **bold** for important values or terms
- Use bullet points (- ) for lists
- Use numbered lists (1. ) for steps
- Use ## for section headers when needed
- Keep responses focused and under 200 words unless complex

Current live station data:
${stationsContext}

AQI Scale: 0-50 Good | 51-100 Moderate | 101-150 Sensitive Groups | 151-200 Unhealthy | 201+ Hazardous

User: ${userMessage}`;

            const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            setMessages([...newMessages, { role: 'assistant', content: text }]);
        } catch (error) {
            setMessages([...newMessages, {
                role: 'assistant',
                content: '**Error connecting to AI.** Please check your API key or try again in a moment.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    };

    const suggested = [
        "What's the AQI in Pimpri?",
        "Is it safe to jog outside today?",
        "Which area has the best air quality?",
        "What health precautions should I take?"
    ];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
                @keyframes slideIn { from { opacity:0; transform:translateY(16px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                .msg-in { animation: fadeUp 0.22s ease; }
                .chat-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
                .suggest-btn:hover { background: #f5f3ff !important; border-color: #c4b5fd !important; color: #4338ca !important; }
                .suggest-btn:active { transform: scale(0.98); }
                .send-btn:hover:not(:disabled) { background: #4338ca !important; transform: scale(1.05); }
                .send-btn:active:not(:disabled) { transform: scale(0.97); }
                .close-btn:hover { background: rgba(255,255,255,0.2) !important; }
                .fab:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(79,70,229,0.45) !important; }
                .fab:active { transform: translateY(0px); }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
            `}</style>

            {/* FAB — indigo, +5% size */}
            {!isOpen && (
                <button className="fab" onClick={() => setIsOpen(true)} style={{
                    position: 'fixed', bottom: '28px', right: '28px',
                    background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                    color: 'white', border: 'none', borderRadius: '56px',
                    padding: '15.75px 26.25px', /* ~+5% from 15px/25px */
                    display: 'flex', alignItems: 'center', gap: '11px',
                    boxShadow: '0 4px 18px rgba(79,70,229,0.38)', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    zIndex: 1000, transition: 'all 0.25s ease'
                }}>
                    <GlobeIcon size={22} stroke="white" strokeWidth={2} />
                    <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.01em' }}>AirWatch AI</div>
                        <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '400' }}>Ask about air quality</div>
                    </div>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div style={{
                    position: 'fixed', bottom: '28px', right: '28px',
                    width: '400px', height: '620px',
                    background: 'white', borderRadius: '20px',
                    boxShadow: '0 16px 48px rgba(0,0,0,0.11), 0 2px 8px rgba(0,0,0,0.05)',
                    display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden',
                    fontFamily: "'DM Sans', sans-serif",
                    animation: 'slideIn 0.28s cubic-bezier(0.34,1.56,0.64,1)'
                }}>

                    {/* Header */}
                    <div style={{
                        background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 55%, #6366f1 100%)',
                        padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ position:'absolute', right:'-20px', top:'-30px', width:'100px', height:'100px', background:'rgba(255,255,255,0.07)', borderRadius:'50%' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                            <div style={{
                                width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)',
                                borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                            }}>
                                <GlobeIcon size={20} stroke="white" strokeWidth={2} />
                            </div>
                            <div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: 'white', letterSpacing: '0.01em' }}>AirWatch Assistant</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%' }} />
                                    <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: '400' }}>Live · Pune Air Data</span>
                                </div>
                            </div>
                        </div>
                        <button className="close-btn" onClick={() => setIsOpen(false)} style={{
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer',
                            fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s', zIndex: 1
                        }}>✕</button>
                    </div>

                    {/* Station Pills */}
                    {stations?.length > 0 && (
                        <div style={{
                            padding: '9px 16px', background: '#fafafa',
                            borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '6px',
                            overflowX: 'auto', scrollbarWidth: 'none'
                        }}>
                            {stations.slice(0, 4).map((s, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0,
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px',
                                    padding: '4px 10px', fontSize: '11px', fontWeight: '500', color: '#374151'
                                }}>
                                    <span>{s.name?.split(' ')[0]}</span>
                                    <AQIBadge aqi={s.aqi} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Messages */}
                    <div style={{
                        flex: 1, padding: '16px', overflowY: 'auto', display: 'flex',
                        flexDirection: 'column', gap: '10px', background: '#f8fafc',
                        scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent'
                    }}>
                        {messages.map((msg, i) => (
                            <div key={i} className="msg-in" style={{
                                display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '8px', alignItems: 'flex-end'
                            }}>
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: '26px', height: '26px',
                                        background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
                                        borderRadius: '7px', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', flexShrink: 0
                                    }}>
                                        <GlobeIcon size={13} stroke="white" strokeWidth={2.5} />
                                    </div>
                                )}
                                <div style={{
                                    maxWidth: '82%', padding: '10px 14px',
                                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg,#4f46e5,#6366f1)'
                                        : 'white',
                                    color: msg.role === 'user' ? 'white' : '#1e293b',
                                    boxShadow: msg.role === 'user'
                                        ? '0 2px 8px rgba(79,70,229,0.25)'
                                        : '0 1px 4px rgba(0,0,0,0.06)',
                                    border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none'
                                }}>
                                    {msg.role === 'user'
                                        ? <span style={{ fontSize: '13px', lineHeight: '1.6' }}>{msg.content}</span>
                                        : <FormattedMessage content={msg.content} />
                                    }
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="msg-in" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <div style={{
                                    width: '26px', height: '26px', background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
                                    borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <GlobeIcon size={13} stroke="white" strokeWidth={2.5} />
                                </div>
                                <div style={{
                                    padding: '12px 16px', background: 'white', border: '1px solid #e2e8f0',
                                    borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center',
                                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                                }}>
                                    {[0, 0.2, 0.4].map((delay, idx) => (
                                        <div key={idx} style={{
                                            width: '7px', height: '7px', background: '#a5b4fc', borderRadius: '50%',
                                            animation: `pulse 1.2s ease-in-out ${delay}s infinite`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Suggested questions */}
                        {messages.length === 1 && (
                            <div style={{ marginTop: '4px' }}>
                                <div style={{
                                    fontSize: '10px', fontWeight: '700', color: '#94a3b8',
                                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px'
                                }}>Try asking</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    {suggested.map((q, i) => (
                                        <button key={i} className="suggest-btn"
                                            onClick={() => setInputMessage(q)}
                                            style={{
                                                textAlign: 'left', padding: '9px 13px', background: 'white',
                                                border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12.5px',
                                                color: '#4f46e5', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
                                                fontWeight: '500', transition: 'all 0.15s ease'
                                            }}>{q}</button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: '12px 16px', background: 'white',
                        borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'center'
                    }}>
                        <input
                            className="chat-input"
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about air quality..."
                            disabled={isLoading}
                            style={{
                                flex: 1, padding: '11px 16px', border: '1.5px solid #e2e8f0', borderRadius: '24px',
                                fontSize: '13.5px', outline: 'none', fontFamily: "'DM Sans', sans-serif",
                                background: '#f8fafc', color: '#1e293b', transition: 'all 0.2s ease'
                            }}
                        />
                        <button className="send-btn"
                            onClick={sendMessage}
                            disabled={!inputMessage.trim() || isLoading}
                            style={{
                                width: '42px', height: '42px', borderRadius: '50%', border: 'none',
                                background: 'linear-gradient(135deg,#4f46e5,#6366f1)', color: 'white',
                                fontSize: '17px', cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                transition: 'all 0.2s ease', opacity: (!inputMessage.trim() || isLoading) ? 0.45 : 1
                            }}>➤ </button>
                    </div>
                </div>
            )}
        </>
    );
}