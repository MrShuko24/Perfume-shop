'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart } from 'lucide-react';

type Variant = { id: string; volume: number; price: number; discountPercent: number; stock: number };
type Product = {
    id: string; name: string; brand: string; imageUrl: string | null;
    images: string[]; category: { name: string }; variants: Variant[];
};

export default function ProductCard({ product }: { product: Product }) {
    const [hovered, setHovered] = useState(false);
    const [wished, setWished] = useState(false);

    const allDiscounted = product.variants.map(v => v.price * (1 - v.discountPercent / 100));
    const allOriginal = product.variants.map(v => v.price);
    const minSale = Math.min(...allDiscounted);
    const maxSale = Math.max(...allDiscounted);
    const minOri = Math.min(...allOriginal);
    const topVariant = product.variants[0];
    const isMulti = product.variants.length > 1;
    const hasDiscount = product.variants.some(v => v.discountPercent > 0);

    const fmt = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    const displayImage = hovered && product.images?.[1]
        ? product.images[1]
        : (product.imageUrl || 'https://via.placeholder.com/400x500');

    return (
        <Link href={`/product/${product.id}`} className="group flex flex-col">
            <div
                className="relative aspect-[4/5] bg-stone-100 rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.12)] mb-3"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out"
                />

                {/* Wishlist */}
                <button
                    onClick={e => { e.preventDefault(); setWished(w => !w); }}
                    className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Heart className={`w-4 h-4 transition-colors ${wished ? 'fill-rose-500 text-rose-500' : 'text-stone-400'}`} />
                </button>

                {/* Discount badge */}
                {hasDiscount && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 bg-rose-500 text-white text-xs font-bold rounded-full">
                        -{topVariant.discountPercent}%
                    </span>
                )}

                {/* Gradient CTA */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                    <span className="text-white text-xs uppercase tracking-widest font-medium">
                        Xem chi tiết
                    </span>
                </div>
            </div>

            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{product.brand}</p>
            <h4 className="text-sm font-serif text-stone-900 group-hover:text-rose-500 transition-colors leading-snug mb-1">
                {product.name}
            </h4>

            <div className="mt-1 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-stone-900 text-sm">
                        {isMulti ? `${fmt(minSale)} – ${fmt(maxSale)}` : fmt(minSale)}
                    </span>
                    {hasDiscount && !isMulti && (
                        <span className="text-xs text-stone-400 line-through">
                            {fmt(minOri)}
                        </span>
                    )}
                </div>
                <p className="text-xs text-stone-400">
                    {isMulti
                        ? `${product.variants[0].volume}ml – ${product.variants[product.variants.length - 1].volume}ml`
                        : `${topVariant?.volume}ml`}
                </p>
            </div>
        </Link>
    );
}