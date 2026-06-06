import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { name, subtitle, isVisible, items } = await req.json();

    await prisma.collection.update({
        where: { id },
        data: { name, subtitle, isVisible }
    });

    // Xóa items cũ, tạo lại
    await prisma.collectionItem.deleteMany({ where: { collectionId: id } });
    await prisma.collectionItem.createMany({
        data: items.map((item: { productId: string }, i: number) => ({
            collectionId: id,
            productId: item.productId,
            sortOrder: i
        }))
    });

    revalidatePath('/');
    return NextResponse.json({ message: 'OK' });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const collection = await prisma.collection.findUnique({
        where: { id },
        include: {
            items: {
                orderBy: { sortOrder: 'asc' },
            }
        }
    });
    if (!collection) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(collection);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.collection.delete({ where: { id } });
    revalidatePath('/');
    return NextResponse.json({ message: 'OK' });
}