import Link from 'next/link';

type Variant = { price: number; discountPercent: number };
type Product = {
    id: string;
    name: string;
    brand: string;
    imageUrl: string | null;
    variants: Variant[];
};

export default function RelatedProducts({ products }: { products: Product[] }) {
    return (
        <div className="max-w-7xl mx-auto px-6">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-stone-900">Bạn có thể thích</h2>
                <p className="text-sm text-stone-400 mt-1">Hương thơm tương tự được khám phá qua cùng olfactory profile</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {products.map((product) => {
                    const v = product.variants[0];
                    const discountedPrice = v && v.discountPercent > 0
                        ? v.price * (1 - v.discountPercent / 100)
                        : null;

                    return (
                        <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="group block"
                        >
                            <div className="bg-stone-50 rounded-xl overflow-hidden aspect-square mb-3 relative">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">{product.brand}</p>
                            <p className="text-sm font-semibold text-stone-800 mt-0.5 group-hover:text-stone-600 transition-colors line-clamp-1">
                                {product.name}
                            </p>
                            {v && (
                                <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-sm font-bold text-stone-900">
                                        {(discountedPrice ?? v.price).toLocaleString('vi-VN')} ₫
                                    </span>
                                    {discountedPrice && (
                                        <span className="text-xs text-stone-400 line-through">
                                            {v.price.toLocaleString('vi-VN')} ₫
                                        </span>
                                    )}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}