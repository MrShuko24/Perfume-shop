import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import DeleteProductButton from './DeleteProductButton';

export default async function AdminProductsPage() {
    const products = await prisma.product.findMany({
        include: {
            category: true,
            variants: { orderBy: { volume: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Sản phẩm</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                    + Thêm sản phẩm
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="text-left text-stone-400 border-b border-stone-100 bg-stone-50">
                        <th className="px-6 py-4 font-medium">Sản phẩm</th>
                        <th className="px-6 py-4 font-medium">Danh mục</th>
                        <th className="px-6 py-4 font-medium">Biến thể</th>
                        <th className="px-6 py-4 font-medium">Tồn kho</th>
                        <th className="px-6 py-4 font-medium text-right">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                            {/* SẢN PHẨM */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                                                N/A
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-stone-900">{product.name}</p>
                                        <p className="text-stone-400 text-xs">{product.brand}</p>
                                    </div>
                                </div>
                            </td>

                            {/* DANH MỤC */}
                            <td className="px-6 py-4 text-stone-600">{product.category.name}</td>

                            {/* BIẾN THỂ */}
                            <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                    {product.variants.map((v) => (
                                        <span key={v.id} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full text-xs">
                                                {v.volume}ml
                                            </span>
                                    ))}
                                </div>
                            </td>

                            {/* TỒN KHO */}
                            <td className="px-6 py-4">
                                {product.variants.map((v) => (
                                    <div key={v.id} className="text-xs text-stone-500">
                                        {v.volume}ml:{' '}
                                        <span className={v.stock < 5 ? 'text-red-500 font-medium' : 'text-stone-700'}>
                                                {v.stock}
                                            </span>
                                    </div>
                                ))}
                            </td>

                            {/* THAO TÁC */}
                            <td className="px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="px-3 py-1.5 text-xs font-medium border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                                    >
                                        Sửa
                                    </Link>
                                    <DeleteProductButton productId={product.id} productName={product.name} />
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                {products.length === 0 && (
                    <div className="text-center py-16 text-stone-400">
                        <p className="text-4xl mb-3">🧴</p>
                        <p>Chưa có sản phẩm nào</p>
                    </div>
                )}
            </div>
        </div>
    );
}