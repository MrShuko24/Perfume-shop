import { prisma } from '@/lib/prisma';
import ShopClient from './ShopClient';

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const [categories, brandsRaw, volumesRaw] = await Promise.all([
        prisma.category.findMany({ select: { id: true, name: true } }),
        prisma.product.findMany({ distinct: ['brand'], select: { brand: true } }),
        prisma.productVariant.findMany({ distinct: ['volume'], select: { volume: true }, orderBy: { volume: 'asc' } }),
    ]);

    return (
        <ShopClient
            categories={categories}
            brands={brandsRaw.map((b) => b.brand)}
            volumes={volumesRaw.map((v) => v.volume)}
        />
    );
}