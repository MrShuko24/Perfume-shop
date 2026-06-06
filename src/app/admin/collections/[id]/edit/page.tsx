'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

type Product = {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
};

type CollectionItem = {
    productId: string;
    product: Product;
};

export default function CollectionEditPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [items, setItems] = useState<CollectionItem[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([
            fetch(`/api/collections/${id}`).then(r => r.json()),
            fetch('/api/products').then(r => r.json()),
        ]).then(([col, products]) => {
            setName(col.name);
            setSubtitle(col.subtitle ?? '');
            setIsVisible(col.isVisible);
            setItems(col.items.map((item: CollectionItem & { productId: string }) => ({
                productId: item.productId,
                product: products.find((p: Product) => p.id === item.productId),
            })).filter((item: CollectionItem) => item.product));
            setAllProducts(products);
            setFetching(false);
        });
    }, [id]);

    const addProduct = (product: Product) => {
        if (items.find(i => i.productId === product.id)) return;
        setItems([...items, { productId: product.id, product }]);
        setSearch('');
    };

    const removeItem = (productId: string) => setItems(items.filter(i => i.productId !== productId));

    const handleDragStart = (i: number) => setDragIndex(i);
    const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setOverIndex(i); };
    const handleDrop = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === i) return;
        const next = [...items];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(i, 0, moved);
        setItems(next);
        setDragIndex(null);
        setOverIndex(null);
    };

    const handleSave = async () => {
        setLoading(true);
        await fetch(`/api/collections/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, subtitle, isVisible, items }),
        });
        setLoading(false);
        router.push('/admin/collections');
        router.refresh();
    };

    const filteredProducts = allProducts.filter(p =>
        !items.find(i => i.productId === p.id) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase()))
    );

    if (fetching) return <div className="text-stone-400 text-sm">Đang tải...</div>;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Chỉnh sửa kệ</h1>
                <button onClick={() => router.back()} className="px-4 py-2 text-sm text-red-400 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                    ← Quay lại
                </button>
            </div>

            <div className="space-y-6">
                {/* THÔNG TIN KỆ */}
                <div className="bg-white rounded-2xl border border-stone-100 p-6 space-y-4">
                    <h2 className="font-semibold text-stone-900">Thông tin</h2>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Tên kệ *</label>
                        <input value={name} onChange={e => setName(e.target.value)}
                               className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Subtitle</label>
                        <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                               placeholder="VD: Những Mùi Hương Kinh Điển"
                               className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors" />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div onClick={() => setIsVisible(!isVisible)}
                             className={`w-10 h-6 rounded-full transition-colors ${isVisible ? 'bg-green-400' : 'bg-stone-200'} relative`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${isVisible ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="text-sm text-stone-700">Hiển thị trên trang chủ</span>
                    </label>
                </div>

                {/* SẢN PHẨM TRONG KỆ */}
                <div className="bg-white rounded-2xl border border-stone-100 p-6">
                    <h2 className="font-semibold text-stone-900 mb-4">Sản phẩm ({items.length})</h2>

                    {/* SEARCH ADD */}
                    <div className="relative mb-4">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Tìm sản phẩm để thêm..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 transition-colors text-sm"
                        />
                        {search && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-100 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                {filteredProducts.map(p => (
                                    <button key={p.id} onClick={() => addProduct(p)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 transition-colors text-left">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                            {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-stone-900">{p.name}</p>
                                            <p className="text-xs text-stone-400">{p.brand}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DANH SÁCH KÉO THẢ */}
                    <div className="space-y-2">
                        {items.map((item, i) => (
                            <div key={item.productId} draggable
                                 onDragStart={() => handleDragStart(i)}
                                 onDragOver={e => handleDragOver(e, i)}
                                 onDrop={e => handleDrop(e, i)}
                                 onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
                                 className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab
                                    ${dragIndex === i ? 'opacity-40' : ''}
                                    ${overIndex === i && dragIndex !== i ? 'border-stone-400 bg-stone-50' : 'border-stone-100'}
                                `}
                            >
                                <span className="text-stone-300 text-lg">⠿</span>
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                    {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-stone-900">{item.product?.name}</p>
                                    <p className="text-xs text-stone-400">{item.product?.brand}</p>
                                </div>
                                <button onClick={() => removeItem(item.productId)}
                                        className="text-stone-300 hover:text-red-400 transition-colors px-2">✕</button>
                            </div>
                        ))}
                        {items.length === 0 && (
                            <p className="text-center text-stone-400 text-sm py-8">Chưa có sản phẩm nào, tìm và thêm ở trên!</p>
                        )}
                    </div>
                </div>

                <button onClick={handleSave} disabled={loading}
                        className="w-full bg-stone-900 text-white font-semibold py-4 rounded-xl hover:bg-stone-700 transition-colors disabled:opacity-50">
                    {loading ? 'Đang lưu...' : 'Lưu kệ sản phẩm'}
                </button>
            </div>
        </div>
    );
}