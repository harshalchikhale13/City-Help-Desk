import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import '../styles/AIChatbot.css'; // We will create this CSS file next

export default function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'ai', text: 'Hi! I am the Campus AI Assistant. How can I help you today?' },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await aiAPI.chat({ message: userMsg.text });
            const aiMsg = { sender: 'ai', text: res.data.data.response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`chatbot-container ${isOpen ? 'open' : 'closed'}`}>
            {!isOpen && (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    🤖 Need Help?
                </button>
            )}

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>🤖 Campus Assistant</h3>
                        <button onClick={() => setIsOpen(false)}>✕</button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.sender}`}>
                                <div className="message-bubble">{msg.text}</div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message ai">
                                <div className="message-bubble typing">...</div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSend} className="chatbot-input">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your question..."
                            autoFocus
                        />
                        <button type="submit" disabled={loading || !input.trim()}>
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
