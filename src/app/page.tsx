"use client"; // Dòng này cực kỳ quan trọng trong Next.js để báo cho nó biết đây là giao diện tương tác (có useState, useEffect)

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { ShoppingBag, Sparkles, MessageCircle, X, Send, User, Bot, Menu, ChevronRight } from 'lucide-react';

// --- MOCK DATA ---
const PRODUCTS = [
    {
        id: 1,
        name: "Midnight Rose",
        notes: "Hồng nhung, Trầm hương, Xạ hương",
        price: "2.500.000đ",
        image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
        tag: "Bán chạy"
    },
    {
        id: 2,
        name: "Ocean Breeze",
        notes: "Hương biển, Cam Bergamot, Hoa Nhài",
        price: "1.800.000đ",
        image: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&w=600&q=80",
        tag: "Tươi mát"
    },
    {
        id: 3,
        name: "Vanilla Sky",
        notes: "Vani Madagascar, Hổ phách, Gỗ đàn hương",
        price: "2.200.000đ",
        image: "https://images.unsplash.com/photo-1615397323862-231a47738f71?auto=format&fit=crop&w=600&q=80",
        tag: "Ngọt ngào"
    },
    {
        id: 4,
        name: "Mystic Wood",
        notes: "Gỗ tuyết tùng, Cỏ hương bài, Tiêu đen",
        price: "2.800.000đ",
        image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80",
        tag: "Nam tính"
    }
];

// --- API HELPER FOR GEMINI ---
const fetchWithRetry = async (url: string, options: RequestInit, retries = 5, initialDelay = 1000) => {
    let delay = initialDelay;
    for (let i = 0; i < retries; i++) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return await res.json();
        } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
};

export default function Home() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Xin chào! Tôi là chuyên gia mùi hương của Aura. Tôi có thể giúp bạn tìm kiếm hương nước hoa hoàn hảo nào cho ngày hôm nay?' }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e?: FormEvent) => {
        e?.preventDefault();
        if (!inputMessage.trim()) return;

        const userMsg = { role: 'user', text: inputMessage };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputMessage('');
        setIsTyping(true);

        try {
            // API Key của anh dán vào giữa cặp ngoặc kép ở dưới nhé
            const apiKey = "AIzaSyBu3eUVCiqMQgf0jeqlbtW-aRS143kb5p4";
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

            const payload = {
                contents: newMessages.map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                })),
                systemInstruction: {
                    parts: [{
                        text: `Bạn là một chuyên gia tư vấn nước hoa cao cấp, tinh tế và lịch sự tại cửa hàng 'Aura by Mochi'. 
            Cửa hàng hiện có các sản phẩm sau: 
            1. Midnight Rose (Hồng nhung, Trầm hương - 2.500.000đ)
            2. Ocean Breeze (Hương biển, Cam Bergamot - 1.800.000đ)
            3. Vanilla Sky (Vani, Hổ phách - 2.200.000đ)
            4. Mystic Wood (Gỗ tuyết tùng, Tiêu đen - 2.800.000đ)
            Hãy hỏi sở thích của khách hàng, lắng nghe và đưa ra một vài gợi ý chân thành, súc tích từ danh sách trên. Giữ giọng điệu thanh lịch, lãng mạn.`
                    }]
                }
            };

            const data = await fetchWithRetry(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi quý khách, hệ thống tư vấn của chúng tôi đang quá tải. Quý khách vui lòng thử lại sau nhé.";

            setMessages(prev => [...prev, { role: 'model', text: replyText }]);

        } catch (error) {
            console.error("Chat API Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Đã có lỗi kết nối xảy ra. Bạn thông cảm đợi một lát rồi thử lại nhé 🌿" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-rose-200">
            {/* Navigation */}
            <nav className="fixed w-full z-40 top-0 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-4">
                            <button className="p-2 -ml-2 hover:bg-stone-100 rounded-full md:hidden">
                                <Menu className="w-5 h-5" />
                            </button>
                            <span className="font-serif text-2xl font-bold tracking-widest text-stone-900">
                AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">by Mochi</span>
              </span>
                        </div>

                        <div className="hidden md:flex items-center space-x-8 text-sm uppercase tracking-widest font-medium text-stone-500">
                            <a href="#" className="text-stone-900 hover:text-rose-500 transition-colors">Trang chủ</a>
                            <a href="#collection" className="hover:text-rose-500 transition-colors">Bộ sưu tập</a>
                            <a href="#about" className="hover:text-rose-500 transition-colors">Về chúng tôi</a>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-stone-100 rounded-full relative transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-400 rounded-full"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/80 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1616949755610-8c9bac08c7bb?auto=format&fit=crop&w=1600&q=80"
                        alt="Hero Perfume"
                        className="w-full h-full object-cover object-right-top opacity-60"
                    />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl">
                        <h2 className="text-xs uppercase tracking-[0.3em] text-rose-500 font-bold mb-4">Nghệ thuật lưu hương</h2>
                        <h1 className="text-5xl lg:text-7xl font-serif text-stone-900 leading-tight mb-8">
                            Bản giao hưởng <br/>
                            <span className="italic text-stone-600">của khứu giác.</span>
                        </h1>
                        <p className="text-lg text-stone-600 mb-10 max-w-lg leading-relaxed">
                            Khám phá bộ sưu tập nước hoa độc bản, được chế tác từ những nguyên liệu quý hiếm nhất, giúp bạn lưu giữ từng khoảnh khắc đáng nhớ.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-4 bg-stone-900 text-white text-sm uppercase tracking-widest hover:bg-stone-800 transition-all rounded-sm flex items-center gap-2">
                                Khám phá ngay <ChevronRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="px-8 py-4 bg-white border border-stone-200 text-stone-900 text-sm uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all rounded-sm flex items-center gap-2 group"
                            >
                                <Sparkles className="w-4 h-4 text-rose-400 group-hover:animate-pulse" /> Tư vấn AI
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Collection */}
            <section id="collection" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-serif text-stone-900 mb-4">Bộ Sưu Tập Nổi Bật</h2>
                        <div className="w-12 h-[1px] bg-rose-300"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                        {PRODUCTS.map((product) => (
                            <div key={product.id} className="group cursor-pointer">
                                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-4 rounded-sm">
                                    {product.tag && (
                                        <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] uppercase tracking-wider z-10">
                      {product.tag}
                    </span>
                                    )}
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=Aura+Perfume' }}
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button className="translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-stone-900 px-6 py-3 text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white rounded-sm">
                                            Thêm vào giỏ
                                        </button>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <h3 className="font-serif text-lg text-stone-900 mb-1">{product.name}</h3>
                                    <p className="text-xs text-stone-500 mb-2 truncate px-2">{product.notes}</p>
                                    <p className="text-sm font-medium text-stone-900">{product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-stone-900 text-stone-400 py-16 text-center border-t border-stone-800">
                <div className="max-w-7xl mx-auto px-4">
          <span className="font-serif text-2xl font-bold tracking-widest text-white mb-6 block">
            AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic">by Mochi</span>
          </span>
                    <p className="text-sm tracking-widest uppercase mb-8">Nghệ thuật chế tác hương thơm tinh tế.</p>
                    <p className="text-xs text-stone-600">© 2026 Aura by Mochi. Crafted with ♥ by Siro & Mochi.</p>
                </div>
            </footer>

            {/* AI Chatbot Widget */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                {/* Chat Window */}
                {isChatOpen && (
                    <div className="w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl shadow-rose-900/10 border border-stone-100 flex flex-col mb-4 overflow-hidden transform transition-all origin-bottom-right">
                        {/* Chat Header */}
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

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-rose-100 flex-shrink-0 flex items-center justify-center mt-1">
                                            <Bot className="w-4 h-4 text-rose-600" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user'
                                                ? 'bg-stone-900 text-white rounded-tr-sm'
                                                : 'bg-white border border-stone-100 text-stone-700 shadow-sm rounded-tl-sm'
                                        }`}
                                    >
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
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-stone-100">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    placeholder="Miêu tả sở thích của bạn..."
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

                {/* Floating Toggle Button */}
                <button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
                        isChatOpen ? 'bg-stone-200 text-stone-800 scale-90' : 'bg-stone-900 text-white hover:bg-rose-500 hover:scale-105 shadow-rose-900/20'
                    }`}
                >
                    {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
                </button>
            </div>
        </div>
    );
}