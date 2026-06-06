'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCollectionPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return;
        setLoading(true);
        const res = await fetch('/api/collections', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subtitle }),
        });
        const data = await res.json();
        setLoading(false);
        router.push(`/admin/collections/${data.id}/edit`);
    };

    return (
        <div className="max-w-lg">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Tạo kệ mới</h1>
                <button onClick={() => router.back()} className="px-4 py-2 text-sm text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                    ← Quay lại
                </button>
            </div>
            <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Tên kệ *</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                           placeholder="VD: Hàng mới về, Deal hot..."
                           className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Subtitle</label>
                    <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                           placeholder="VD: Những Mùi Hương Kinh Điển"
                           className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors" />
                </div>
                <button onClick={handleSubmit} disabled={loading || !name.trim()}
                        className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50">
                    {loading ? 'Đang tạo...' : 'Tạo & thêm sản phẩm →'}
                </button>
            </div>
        </div>
    );
}