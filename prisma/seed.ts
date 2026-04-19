import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

// 1. Khởi tạo Prisma, truyền đúng datasources
// 2. Chốt hạ bằng "as string" để TypeScript im lặng tuyệt đối!
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL as string,
        },
    },
});

async function main() {
    console.log('Đang mở cửa kho... 🚀');

    await prisma.product.deleteMany();
    console.log('Đã dọn dẹp kho bãi, chuẩn bị nhập hàng!');

    const perfumes = [
        {
            name: 'Sauvage',
            brand: 'Dior',
            description: 'Hương gỗ cay nồng, nam tính và cực kỳ lôi cuốn.',
            price: 3500000,
            imageUrl: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
            category: 'Woody',
            stock: 50,
        },
        {
            name: 'Bleu de Chanel',
            brand: 'Chanel',
            description: 'Hương cam chanh và gỗ, thanh lịch, chững chạc và sâu lắng.',
            price: 4200000,
            imageUrl: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
            category: 'Citrus',
            stock: 30,
        },
        {
            name: 'Oud Wood',
            brand: 'Tom Ford',
            description: 'Hương gỗ trầm hương, sang trọng, đẳng cấp và bí ẩn.',
            price: 6800000,
            imageUrl: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=800&q=80',
            category: 'Woody',
            stock: 15,
        },
        {
            name: 'Baccarat Rouge 540',
            brand: 'Maison Francis Kurkdjian',
            description: 'Hương hoa cỏ phương đông, ngọt ngào, vương giả và bám tỏa cực khủng.',
            price: 8500000,
            imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
            category: 'Floral',
            stock: 10,
        }
    ];

    for (const p of perfumes) {
        await prisma.product.create({
            data: p,
        });
    }

    console.log(`Bơm dữ liệu thành công! 🎉 Đã nhập ${perfumes.length} siêu phẩm vào MongoDB.`);
}

main()
    .catch((e) => {
        console.error('Ối dồi ôi lỗi rồi đại vương ơi:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });