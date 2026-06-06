import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
    const collections = await prisma.collection.findMany({
        orderBy: { sortOrder: 'asc' },
        include: {
            items: {
                orderBy: { sortOrder: 'asc' },
                include: {
                    product: { include: { variants: true } }
                }
            }
        }
    });
    return NextResponse.json(collections);
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, subtitle } = await req.json();
    const collection = await prisma.collection.create({
        data: { name, subtitle }
    });
    revalidatePath('/');
    return NextResponse.json(collection, { status: 201 });
}