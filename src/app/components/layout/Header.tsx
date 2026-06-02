'use client';

import { ShoppingBag, LogOut, User, Heart, Search } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const { data: session } = useSession();
    const { openCart, clearCart } = useCartStore();
    const cartCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));
    const [searchValue, setSearchValue] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchValue.trim()) return;
        // Scroll to collection và focus search
        document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>('input[placeholder="Tìm kiếm sản phẩm..."]');
            if (input) {
                input.value = searchValue;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.focus();
            }
        }, 600);
    };

    return (
        <nav className={`relative w-full z-40 top-0 transition-all duration-300 ${scrolled ? 'bg-[#FDFBF7]/95 backdrop-blur-md shadow-sm' : 'bg-[#FDFBF7]/80 backdrop-blur-md'} border-b border-stone-200/50`}>

            {/* ── TẦNG 1: Logo · Search · Icons ── */}
            <div className="w-full px-6 lg:px-12">
                <div className="flex items-center justify-between h-16 gap-6">

                    {/* LOGO */}
                    <Link href="/" className="flex-shrink-0 font-serif text-2xl font-bold tracking-widest text-stone-900 hover:opacity-80 transition-opacity">
                        AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic font-medium">Signature</span>
                    </Link>

                    {/* SEARCH BAR — giữa */}
                    <form onSubmit={handleSearch} className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                            <input
                                ref={searchRef}
                                type="text"
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                placeholder="Tìm kiếm nước hoa, thương hiệu bạn muốn..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 bg-white/70 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
                            />
                        </div>
                    </form>

                    {/* RIGHT ICONS */}
                    <div className="flex items-center gap-1 flex-shrink-0">

                        {/* WISHLIST */}
                        <button
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-rose-400"
                            title="Wishlist"
                        >
                            <Heart className="w-5 h-5" />
                        </button>

                        {/* GIỎ HÀNG */}
                        <button
                            onClick={openCart}
                            className="p-2 hover:bg-stone-100 rounded-full relative transition-colors text-stone-500 hover:text-stone-900"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* AUTH */}
                        {session ? (
                            <div className="flex items-center gap-1 ml-1">
                                <Link
                                    href="/profile"
                                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-stone-600 hover:text-rose-500 hover:bg-stone-100 transition-colors"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="font-medium">{session.user?.name ?? session.user?.email}</span>
                                </Link>

                                {session.user?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="text-xs font-medium text-rose-400 hover:text-rose-500 border border-rose-200 px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                )}

                                <button
                                    onClick={() => { clearCart(); signOut({ callbackUrl: '/' }); }}
                                    className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-red-400"
                                    title="Đăng xuất"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="ml-1 text-sm font-medium text-stone-600 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-stone-100"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ── TẦNG 2: Navigation Links ── */}
            <div className="hidden md:block">
                <div className="w-full px-6 lg:px-12">
                    <div className="flex items-center justify-center h-12 gap-8">
                        {[
                            { label: 'Hot Deals', href: '/' },
                            { label: 'Thương hiệu', href: '/' },
                            { label: 'Hàng mới về', href: '/shop' },
                            { label: 'Nước hoa nam', href: '/#collection' },
                            { label: 'Nước hoa nữ', href: '/#collection' },
                            { label: 'Bộ sưu tập', href: '/#collection' },
                            { label: 'Gift Sets', href: '/shop?category=gift' },
                            { label: 'Tư vấn AI', href: '#', isAI: true },
                        ].map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                onClick={item.isAI ? (e) => {
                                    e.preventDefault();
                                    document.querySelector<HTMLButtonElement>('[data-chat-toggle]')?.click();
                                } : undefined}
                                className={`text-[12px] uppercase tracking-widest font-medium transition-colors whitespace-nowrap
                                    ${item.isAI
                                    ? 'text-rose-400 hover:text-rose-600 flex items-center gap-1'
                                    : 'text-stone-500 hover:text-stone-900'
                                }`}
                            >
                                {item.isAI && <span className="text-[10px]">✦</span>}
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

        </nav>
    );
}