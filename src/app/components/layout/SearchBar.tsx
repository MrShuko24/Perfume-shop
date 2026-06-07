'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

type Variant = { price: number; discountPercent: number; volume: number };
type Result = { id: string; name: string; brand: string; imageUrl: string | null; variants: Variant[] };

function priceRange(variants: Variant[]) {
    const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' đ';
    const sales = variants.map(v => v.price * (1 - v.discountPercent / 100));
    const min = Math.min(...sales);
    const max = Math.max(...sales);
    if (variants.length === 1) return fmt(min);
    return `${fmt(min)} – ${fmt(max)}`;
}

export default function SearchBar() {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounce fetch
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (q.trim().length < 2) {
            timerRef.current = setTimeout(() => {
                setResults([]);
                setOpen(false);
            }, 0);
            return;
        }

        timerRef.current = setTimeout(async () => {
            setLoading(true);
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
            const data = await res.json();
            setResults(data);
            setOpen(true);
            setLoading(false);
        }, 300);
    }, [q]);

    // Click outside đóng dropdown
    useEffect(() => {
        function handle(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!q.trim()) return;
        setOpen(false);
        router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
    }

    function clear() { setQ(''); setResults([]); setOpen(false); }

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSubmit} className="relative flex items-center w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <input
                    value={q}
                    onChange={e => setQ(e.target.value)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder="Tìm kiếm nước hoa, thương hiệu bạn muốn..."
                    className="w-full pl-10 pr-8 py-2.5 rounded-full border border-stone-200 bg-white/70 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:border-rose-300 focus:bg-white transition-all"
                />
                {q && (
                    <button type="button" onClick={clear} className="absolute right-3 text-stone-400 hover:text-stone-600">
                        <X size={14} />
                    </button>
                )}
            </form>

            {/* Dropdown */}
            {open && (
                <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50">
                    {loading ? (
                        <div className="p-4 text-sm text-stone-400 text-center">Đang tìm...</div>
                    ) : results.length === 0 ? (
                        <div className="p-4 text-sm text-stone-400 text-center">Không tìm thấy kết quả</div>
                    ) : (
                        <>
                            <ul className="max-h-96 overflow-y-auto divide-y divide-stone-50">
                                {results.map(r => (
                                    <li key={r.id}>
                                        <Link
                                            href={`/product/${r.id}`}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-stone-50 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden shrink-0">
                                                <img
                                                    src={r.imageUrl || 'https://via.placeholder.com/48'}
                                                    alt={r.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-stone-400 uppercase tracking-wide">{r.brand}</p>
                                                <p className="text-sm font-medium text-stone-800 truncate">{r.name}</p>
                                                <p className="text-xs text-stone-500 mt-0.5">{priceRange(r.variants)}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t border-stone-100">
                                <button
                                    onClick={handleSubmit as never}
                                    className="w-full py-3 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors"
                                >
                                    Hiển thị tất cả kết quả cho &ldquo;{q}&rdquo;
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}