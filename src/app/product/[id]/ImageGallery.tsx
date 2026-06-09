'use client';

import { useState } from 'react';

type Props = {
    imageUrl: string | null;
    images: string[];
    name: string;
};

export default function ImageGallery({ imageUrl, images, name }: Props) {
    const allImages = images?.length ? images : (imageUrl ? [imageUrl] : []);
    const [current, setCurrent] = useState(allImages[0] ?? '');

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-stone-50 rounded-2xl overflow-hidden aspect-[4/5] flex items-center justify-center group">
                {current ? (
                    <img
                        src={current}
                        alt={name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-stone-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span className="text-sm">Chưa có ảnh sản phẩm</span>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="flex gap-2">
                    {allImages.map((url, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrent(url)}
                            className={`relative w-[72px] h-[72px] rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all duration-200
                                ${current === url
                                ? 'border-stone-900 shadow-md'
                                : 'border-stone-100 hover:border-stone-300 opacity-70 hover:opacity-100'
                            }`}
                        >
                            <img src={url} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}