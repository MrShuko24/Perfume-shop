'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteProductButton({
                                                productId,
                                                productName,
                                            }: {
    productId: string;
    productName: string;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Xóa sản phẩm "${productName}"? Hành động này không thể hoàn tác.`)) return;

        setLoading(true);
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        setLoading(false);

        if (res.ok) {
            router.refresh();
        } else {
            alert('Xóa thất bại, thử lại sau.');
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
            {loading ? '...' : 'Xóa'}
        </button>
    );
}