'use client';

import { ShoppingBag, LogOut, User, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cartStore';
import Link from 'next/link';

export default function Header() {
    const { data: session } = useSession();
    const { openCart, clearCart } = useCartStore();
    const cartCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0));

    return (
        <nav className="relative w-full z-40 top-0 transition-all duration-300 bg-[#FDFBF7] shadow-[0_4px_24px_rgba(0,0,0,0.08)] border-b border-stone-200/40">

            {/* ── TẦNG 1: Logo · Search · Icons ── */}
            <div className="w-full px-6 lg:px-12">
                <div className="flex items-center justify-between h-16 gap-6">

                    {/* LOGO */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <Link href="/" className="font-serif text-2xl font-bold tracking-widest text-stone-900 hover:opacity-80 transition-opacity">
                            AURA <span className="text-rose-400 font-sans text-sm tracking-normal italic font-medium">Signature</span>
                        </Link>
                        <a href="https://www.facebook.com/profile.php?id=61590466721737" target="_blank" rel="noopener noreferrer"
                           className="ml-3 p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-[#1877F2]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="https://www.instagram.com/aura.perfume24" target="_blank" rel="noopener noreferrer"
                           className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-[#E1306C]">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                        </a>
                        <a href="https://www.tiktok.com/@aura_signature24" target="_blank" rel="noopener noreferrer"
                           className="p-1.5 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-900">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/></svg>
                        </a>
                    </div>

                    {/* SEARCH BAR — giữa */}
                    <div className="absolute left-1/2 -translate-x-1/2 w-full max-w-md">
                        <SearchBar />
                    </div>

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
                            { label: 'Trang chủ', href: '/' },
                            { label: 'Cửa hàng', href: '/shop' },
                            { label: 'Hàng mới về', href: '/shop' },
                            { label: 'Nước hoa nam', href: '/shop?category=Nước Hoa Nam' },
                            { label: 'Nước hoa nữ', href: '/shop?category=Nước Hoa Nữ' },
                            { label: 'Nước hoa Unisex', href: '/shop?category=Nước Hoa Unisex' },
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