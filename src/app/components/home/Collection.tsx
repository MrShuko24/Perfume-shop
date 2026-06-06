import { prisma } from '@/lib/prisma';
import CollectionClient from './CollectionClient';

export const revalidate = 0;

export default async function Collection() {
    const collections = await prisma.collection.findMany({
        where: { isVisible: true },
        orderBy: { sortOrder: 'asc' },
        include: {
            items: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    product: {
                        include: { variants: true }
                    }
                }
            }
        }
    });

    const collectionsWithProducts = collections.map(col => ({
        ...col,
        products: col.items
            .map(item => item.product)
            .filter(Boolean)
    }));

    return (
        <>
            {collectionsWithProducts.map(col => (
                <CollectionClient
                    key={col.id}
                    title={col.name}
                    subtitle={col.subtitle ?? undefined}
                    products={col.products}
                />
            ))}
        </>
    );
}