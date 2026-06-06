import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminCollectionsPage() {
    const collections = await prisma.collection.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { items: true }
    });

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-stone-900">Kệ sản phẩm</h1>
                <Link
                    href="/admin/collections/new"
                    className="bg-stone-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                    + Thêm kệ mới
                </Link>
            </div>

            <div className="space-y-3">
                {collections.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-stone-100 p-16 text-center text-stone-400">
                        <p className="text-4xl mb-3">🗂️</p>
                        <p>Chưa có kệ nào, tạo kệ đầu tiên đi!</p>
                    </div>
                ) : (
                    collections.map((col) => (
                        <div key={col.id} className="bg-white rounded-2xl border border-stone-100 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-10 rounded-full ${col.isVisible ? 'bg-green-400' : 'bg-stone-200'}`} />
                                <div>
                                    <p className="font-semibold text-stone-900">{col.name}</p>
                                    {col.subtitle && <p className="text-xs text-stone-400 mt-0.5">{col.subtitle}</p>}
                                    <p className="text-xs text-stone-400 mt-0.5">{col.items.length} sản phẩm</p>
                                </div>
                            </div>
                            <Link
                                href={`/admin/collections/${col.id}/edit`}
                                className="px-4 py-2 text-sm border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                            >
                                Chỉnh sửa
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}