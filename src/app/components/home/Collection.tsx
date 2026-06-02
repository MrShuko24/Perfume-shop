// src/app/components/home/Collection.tsx
import { prisma } from '@/lib/prisma';
import CollectionClient from './CollectionClient';

export const revalidate = 0;
export default async function Collection() {
    const products = await prisma.product.findMany({
        include: { category: true, variants: true },
        orderBy: { createdAt: 'desc' },
    });

    return <CollectionClient products={products} />;
}