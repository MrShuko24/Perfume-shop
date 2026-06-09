import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import VariantSelector from './VariantSelector';
import ImageGallery from './ImageGallery';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import Breadcrumb from '@/app/components/layout/Breadcrumb';

export default async function ProductDetailPage({
                                                    params,
                                                }: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            variants: { orderBy: { volume: 'asc' } },
            category: true,
            reviews: { orderBy: { createdAt: 'desc' } },
        },
    });

    if (!product) notFound();

    const related = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
        },
        include: { variants: { orderBy: { price: 'asc' }, take: 1 } },
        take: 4,
    });

    const avgRating = product.reviews.length
        ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        : null;

    return (
        <div className="min-h-screen bg-white">
            {/* BREADCRUMB */}
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <Breadcrumb
                    items={[
                        { label: 'Trang chủ', href: '/' },
                        { label: 'Cửa hàng', href: '/shop' },
                        { label: product.name },
                    ]}
                />
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                    {/* LEFT — Image Gallery */}
                    <ImageGallery
                        imageUrl={product.imageUrl}
                        images={product.images ?? []}
                        name={product.name}
                    />

                    {/* RIGHT — Product Info */}
                    <div className="lg:sticky lg:top-8">
                        {/* Brand + Name */}
                        <p className="text-xs tracking-[0.2em] uppercase text-stone-400 font-medium mb-2">
                            {product.brand}
                        </p>
                        <h1 className="text-4xl font-bold text-stone-900 leading-tight mb-4">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-5">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => {
                                    const filled = avgRating ? i <= Math.round(avgRating) : i <= 4;
                                    return (
                                        <svg key={i} className={`w-4 h-4 fill-current ${filled ? 'text-amber-400' : 'text-stone-200'}`} viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                        </svg>
                                    );
                                })}
                            </div>
                            <span className="text-sm text-stone-500">
                                {product.reviews.length > 0
                                    ? `${avgRating?.toFixed(1)} (${product.reviews.length} đánh giá)`
                                    : 'Chưa có đánh giá'}
                            </span>
                        </div>

                        {/* Short description */}
                        <p className="text-stone-600 text-base leading-relaxed mb-6 border-b border-stone-100 pb-6">
                            {product.description ?? 'Hương thơm quyến rũ, tinh tế và đầy cá tính.'}
                        </p>

                        {/* Meta info */}
                        {(product.concentration || product.origin || product.gender || product.longevity) && (
                            <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-stone-50 rounded-xl">
                                {product.concentration && (
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wider">Nồng độ</p>
                                        <p className="text-sm font-semibold text-stone-700 mt-0.5">{product.concentration}</p>
                                    </div>
                                )}
                                {product.origin && (
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wider">Xuất xứ</p>
                                        <p className="text-sm font-semibold text-stone-700 mt-0.5">{product.origin}</p>
                                    </div>
                                )}
                                {product.gender && (
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wider">Giới tính</p>
                                        <p className="text-sm font-semibold text-stone-700 mt-0.5">{product.gender}</p>
                                    </div>
                                )}
                                {product.longevity && (
                                    <div>
                                        <p className="text-xs text-stone-400 uppercase tracking-wider">Lưu hương</p>
                                        <p className="text-sm font-semibold text-stone-700 mt-0.5">{product.longevity}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variant Selector */}
                        <VariantSelector
                            variants={product.variants}
                            productId={product.id}
                            productName={product.name}
                            brand={product.brand}
                            imageUrl={product.imageUrl}
                        />

                        {/* Trust badges */}
                        <div className="mt-8 flex items-center gap-6 pt-6 border-t border-stone-100">
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                                Miễn phí vận chuyển
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-500">
                                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                Đổi trả 30 ngày
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CHI TIẾT SẢN PHẨM */}
            {(product.origin || product.releaseYear || product.concentration || product.scentGroup || product.perfumer || product.style?.length || product.occasion?.length) && (
                <div className="max-w-7xl mx-auto px-6 py-12 border-t border-stone-100">
                    <h2 className="text-2xl font-bold text-stone-900 mb-6">Chi tiết về sản phẩm</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 max-w-3xl">
                        {[
                            { label: 'Phân loại', value: 'Nước hoa' },
                            { label: 'Xuất xứ', value: product.origin },
                            { label: 'Năm phát hành', value: product.releaseYear?.toString() },
                            { label: 'Nồng độ', value: product.concentration },
                            { label: 'Nhóm hương', value: product.scentGroup },
                            { label: 'Nhà chế tác', value: product.perfumer },
                            { label: 'Phong cách', value: product.style?.join(', ') },
                            { label: 'Dịp sử dụng', value: product.occasion?.join(', ') },
                        ].filter(row => row.value).map(({ label, value }) => (
                            <div key={label} className="flex gap-4 py-3 border-b border-stone-100">
                                <span className="w-36 flex-shrink-0 text-sm font-semibold text-stone-700">{label}:</span>
                                <span className="text-sm text-stone-500">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Long description */}
                    {product.longDesc && (
                        <div className="mt-8 max-w-3xl prose prose-stone prose-sm">
                            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line">{product.longDesc}</p>
                        </div>
                    )}
                </div>
            )}

            {/* TABS SECTION */}
            <div className="max-w-7xl mx-auto px-6 pb-16">
                <ProductTabs product={product} reviews={product.reviews} />
            </div>

            {/* RELATED PRODUCTS */}
            {related.length > 0 && (
                <div className="border-t border-stone-100 py-16">
                    <RelatedProducts products={related} />
                </div>
            )}
        </div>
    );
}