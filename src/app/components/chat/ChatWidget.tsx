"use client";
import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot } from 'lucide-react';

interface Message {
    role: string;
    text: string;
}

interface ChatWidgetProps {
    isChatOpen: boolean;
    setIsChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const WELCOME_MESSAGE: Message = {
    role: 'model',
    text: 'Chào bạn! Bạn đang tìm nước hoa cho dịp nào vậy? 😊'
};

const SESSION_KEY = 'aura_chat_session_id';

export default function ChatWidget({ isChatOpen, setIsChatOpen }: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [products, setProducts] = useState<string>('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const sessionInitialized = useRef(false);
    const shouldScrollToBottom = useRef(false);

    // Scroll xuống cuối khi chat mở ra (sau khi load history)
    useEffect(() => {
        if (isChatOpen && !isLoadingHistory) {
            setTimeout(() => {
                const container = messagesContainerRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    setShowScrollBtn(false);
                }
            }, 80);
        }
    }, [isChatOpen, isLoadingHistory]);

    // Scroll xuống khi có tin mới — chỉ nếu đang ở gần cuối
    useEffect(() => {
        if (isLoadingHistory || !isChatOpen) return;
        if (shouldScrollToBottom.current) {
            shouldScrollToBottom.current = false;
            setTimeout(() => {
                const container = messagesContainerRef.current;
                if (container) {
                    container.scrollTop = container.scrollHeight;
                    setShowScrollBtn(false);
                }
            }, 50);
            return;
        }
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
        if (isNearBottom) {
            container.scrollTop = container.scrollHeight;
            setShowScrollBtn(false);
        } else {
            setShowScrollBtn(true);
        }
    }, [messages, isTyping]);

    // Load sản phẩm
    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                const list = data.map((p: {
                    name: string;
                    brand: string;
                    description: string;
                    variants: { volume: number; price: number; discountPercent: number }[]
                }) => {
                    const v = p.variants[0];
                    const price = v ? (v.discountPercent > 0
                        ? v.price * (1 - v.discountPercent / 100)
                        : v.price) : 0;
                    return `- ${p.name} (${p.brand}): ${p.description ?? ''} | ${v?.volume}ml - ${price.toLocaleString('vi-VN')}₫`;
                }).join('\n');
                setProducts(list);
            })
            .catch(() => setProducts(''));
    }, []);

    // Khởi tạo session
    useEffect(() => {
        if (sessionInitialized.current) return;
        sessionInitialized.current = true;

        const initSession = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await fetch('/api/chat/session', { method: 'POST' });
                const data = await res.json();
                const newSessionId = data.sessionId;
                localStorage.setItem(SESSION_KEY, newSessionId);
                setSessionId(newSessionId);

                const histRes = await fetch(`/api/chat/session?sessionId=${newSessionId}`);
                const histData = await histRes.json();

                if (histData.messages && histData.messages.length > 0) {
                    setMessages(histData.messages);
                } else {
                    await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            messages: [WELCOME_MESSAGE],
                            products: '',
                            sessionId: newSessionId,
                            isWelcome: true
                        })
                    });
                }
            } catch {
                // fallback: hiển thị welcome message bình thường
            }
            setIsLoadingHistory(false);
        };

        initSession();
    }, []);

    const scrollToBottom = () => {
        const container = messagesContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight;
            setShowScrollBtn(false);
        }
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container) return;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;
        setShowScrollBtn(!isNearBottom);
    };

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg: Message = { role: 'user', text: inputMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputMessage('');
        setIsTyping(true);
        shouldScrollToBottom.current = true;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: newMessages, products, sessionId })
            });
            const data = await res.json();
            shouldScrollToBottom.current = true;
            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch {
            setMessages(prev => [...prev, { role: 'model', text: 'Lỗi kết nối, bạn thử lại sau nhé 🌿' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isChatOpen && (
                <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-rose-900/10 border border-stone-100 flex flex-col mb-4 overflow-hidden">
                    {/* HEADER */}
                    <div className="bg-[#FDFBF7] p-4 border-b border-stone-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center relative">
                                <Sparkles className="w-5 h-5 text-rose-500" />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <h3 className="font-bold text-stone-800 text-sm">Aura AI Advisor</h3>
                                <p className="text-xs text-rose-500 font-medium">Đang trực tuyến</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsChatOpen(false)}
                            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* MESSAGES */}
                    <div className="relative flex-1 overflow-hidden">
                        <div
                            ref={messagesContainerRef}
                            onScroll={handleScroll}
                            className="h-full overflow-y-auto p-4 space-y-4 bg-stone-50/50"
                        >
                            {isLoadingHistory ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                        <div className="w-2 h-2 bg-rose-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                                                    <Bot className="w-4 h-4 text-rose-600" />
                                                </div>
                                            )}
                                            <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-stone-900 text-white rounded-tr-sm' : 'bg-white border border-stone-100 text-stone-700 shadow-sm rounded-tl-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex gap-3 justify-start">
                                            <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                                                <Bot className="w-4 h-4 text-rose-600" />
                                            </div>
                                            <div className="bg-white border border-stone-100 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Nút nhảy xuống */}
                        {showScrollBtn && !isLoadingHistory && (
                            <button
                                onClick={scrollToBottom}
                                className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-stone-900 text-white w-7 h-7 rounded-full shadow-lg flex items-center justify-center hover:bg-rose-500 transition-colors z-10"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* INPUT */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhắn tin với Aura AI..."
                                className="w-full bg-stone-100 text-sm text-stone-800 rounded-full pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="absolute right-2 p-2 bg-stone-900 text-white rounded-full hover:bg-rose-500 disabled:bg-stone-300 disabled:text-stone-500 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isChatOpen ? 'bg-stone-200 text-stone-800 scale-90' : 'bg-stone-900 text-white hover:bg-rose-500 hover:scale-105'}`}
            >
                {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </button>
        </div>
    );
}