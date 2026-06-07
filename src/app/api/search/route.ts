import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const q = new URL(req.url).searchParams.get('q')?.trim();
    if (!q || q.length < 2) return NextResponse.json([]);

    const products = await prisma.product.findMany({
        where: {
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { brand: { contains: q, mode: 'insensitive' } },
            ],
        },
        select: {
            id: true, name: true, brand: true, imageUrl: true,
            variants: {
                select: { price: true, discountPercent: true, volume: true },
                orderBy: { volume: 'asc' },
            },
        },
        take: 8,
    });

    return NextResponse.json(products);
}