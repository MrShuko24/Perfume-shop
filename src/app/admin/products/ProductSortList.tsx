'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';

type Variant = { id: string; volume: number; stock: number };
type Product = {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
    sortOrder: number;
    category: { name: string };
    variants: Variant[];
};

export default function ProductSortList({ products: initial }: { products: Product[] }) {
    const [products, setProducts] = useState(initial);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Filter states
    const [search, setSearch] = useState('');
    const [filterBrand, setFilterBrand] = useState('');
    const [filterVolume, setFilterVolume] = useState('');
    const [filterStock, setFilterStock] = useState('');

    // Dynamic options
    const brandOptions = useMemo(() =>
            [...new Set(products.map(p => p.brand))].sort(),
        [products]
    );
    const volumeOptions = useMemo(() =>
            [...new Set(products.flatMap(p => p.variants.map(v => v.volume)))].sort((a, b) => a - b),
        [products]
    );

    // Filtered list (chỉ dùng để render, không ảnh hưởng drag-drop gốc)
    const filtered = useMemo(() => {
        return products.filter(p => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
            if (filterBrand && p.brand !== filterBrand) return false;
            if (filterVolume && !p.variants.some(v => v.volume === Number(filterVolume))) return false;
            if (filterStock === 'out') {
                if (!p.variants.every(v => v.stock === 0)) return false;
            } else if (filterStock === 'low') {
                if (!p.variants.some(v => v.stock > 0 && v.stock <= 5)) return false;
            } else if (filterStock === 'in') {
                if (!p.variants.some(v => v.stock > 5)) return false;
            }
            return true;
        });
    }, [products, search, filterBrand, filterVolume, filterStock]);

    const isFiltering = search || filterBrand || filterVolume || filterStock;

    // Drag drop (chỉ hoạt động khi không filter)
    const handleDragStart = (i: number) => { if (!isFiltering) setDragIndex(i); };
    const handleDragOver = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (!isFiltering) setOverIndex(i);
    };
    const handleDrop = (e: React.DragEvent, i: number) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex === i || isFiltering) return;
        const next = [...products];
        const [moved] = next.splice(dragIndex, 1);
        next.splice(i, 0, moved);
        setProducts(next);
        setDragIndex(null);
        setOverIndex(null);
        setSaved(false);
    };
    const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

    const handleSave = async () => {
        setSaving(true);
        await fetch('/api/products/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(products.map((p, i) => ({ id: p.id, sortOrder: i }))),
        });
        setSaving(false);
        setSaved(true);
    };

    const renderStockBadge = (stock: number) => {
        if (stock === 0) return <span className="text-red-500 font-medium">{stock}</span>;
        if (stock <= 5) return <span className="text-orange-400 font-medium">{stock}</span>;
        return <span className="text-stone-700">{stock}</span>;
    };

    return (
        <div>
            {/* FILTER BAR */}
            <div className="flex flex-wrap gap-2 mb-4">
                <input
                    type="text"
                    placeholder="🔍 Tìm tên sản phẩm..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400 w-56"
                />
                <select
                    value={filterBrand}
                    onChange={e => setFilterBrand(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                    <option value="">Tất cả thương hiệu</option>
                    {brandOptions.map(b => (
                        <option key={b} value={b}>{b}</option>
                    ))}
                </select>
                <select
                    value={filterVolume}
                    onChange={e => setFilterVolume(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                    <option value="">Tất cả dung tích</option>
                    {volumeOptions.map(v => (
                        <option key={v} value={v}>{v}ml</option>
                    ))}
                </select>
                <select
                    value={filterStock}
                    onChange={e => setFilterStock(e.target.value)}
                    className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                    <option value="">Tất cả tồn kho</option>
                    <option value="in">Còn hàng</option>
                    <option value="low">Sắp hết (≤ 5)</option>
                    <option value="out">Hết hàng</option>
                </select>
                {isFiltering && (
                    <button
                        onClick={() => { setSearch(''); setFilterBrand(''); setFilterVolume(''); setFilterStock(''); }}
                        className="px-3 py-2 text-xs text-stone-400 hover:text-stone-600 border border-stone-200 rounded-lg bg-white transition-colors"
                    >
                        ✕ Xoá filter
                    </button>
                )}
            </div>

            {/* SAVE BAR */}
            <div className="flex justify-between items-center mb-3 h-8">
                <p className="text-xs text-stone-400">
                    {isFiltering
                        ? `Đang lọc: ${filtered.length} / ${products.length} sản phẩm`
                        : `${products.length} sản phẩm`
                    }
                </p>
                <div>
                    {!saved && products !== initial && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? 'Đang lưu...' : '💾 Lưu thứ tự'}
                        </button>
                    )}
                    {saved && <span className="text-sm text-green-500">✓ Đã lưu</span>}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-stone-400 border-b border-stone-100 bg-stone-50">
                        <th className="px-3 py-4 w-8"></th>
                        <th className="px-6 py-4 font-medium">Sản phẩm</th>
                        <th className="px-6 py-4 font-medium">Thương hiệu</th>
                        <th className="px-6 py-4 font-medium">Biến thể</th>
                        <th className="px-6 py-4 font-medium">Tồn kho</th>
                        <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                    {filtered.map((product, index) => {
                        const realIndex = products.findIndex(p => p.id === product.id);
                        return (
                            <tr
                                key={product.id}
                                draggable={!isFiltering}
                                onDragStart={() => handleDragStart(realIndex)}
                                onDragOver={(e) => handleDragOver(e, realIndex)}
                                onDrop={(e) => handleDrop(e, realIndex)}
                                onDragEnd={handleDragEnd}
                                className={`transition-colors
                                    ${dragIndex === realIndex ? 'opacity-40' : ''}
                                    ${overIndex === realIndex && dragIndex !== realIndex ? 'bg-stone-100' : 'hover:bg-stone-50'}
                                    ${isFiltering ? 'cursor-default' : 'cursor-grab'}
                                `}
                            >
                                <td className={`px-3 py-4 ${isFiltering ? 'text-stone-200' : 'text-stone-300 hover:text-stone-500'}`}>⠿</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                            {product.imageUrl
                                                ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">N/A</div>
                                            }
                                        </div>
                                        <p className="font-semibold text-stone-900">{product.name}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-stone-600 text-sm">{product.brand}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1 flex-wrap">
                                        {product.variants.map((v) => (
                                            <span key={v.id} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs">{v.volume}ml</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {product.variants.map((v) => (
                                        <div key={v.id} className="text-xs text-stone-500">
                                            {v.volume}ml: {renderStockBadge(v.stock)}
                                        </div>
                                    ))}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/products/${product.id}/edit`} className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">Sửa</Link>
                                        <DeleteProductButton productId={product.id} productName={product.name} />
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {filtered.length === 0 && (
                    <div className="text-center py-16 text-stone-400">
                        <p className="text-4xl mb-3">{isFiltering ? '🔍' : '🧴'}</p>
                        <p>{isFiltering ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}