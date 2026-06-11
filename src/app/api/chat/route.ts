import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest) {
    const { messages, products, sessionId, isWelcome } = await req.json();

    // Chỉ lưu welcome message, không gọi AI
    if (isWelcome) {
        if (sessionId) {
            try {
                await prisma.message.create({
                    data: { chatSessionId: sessionId, role: 'model', text: messages[0].text }
                });
            } catch (e) {
                console.error('Welcome save error:', e);
            }
        }
        return NextResponse.json({ text: messages[0].text });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing API key' }, { status: 500 });

    // Lấy thông tin user để inject vào context AI
    let userContext = '';

    try {
        const session = await Promise.race([
            auth(),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
        ]);

        if (session?.user?.id) {
            const user = await prisma.user.findUnique({
                where: { id: session.user.id },
                include: {
                    orders: {
                        where: { status: { not: 'CANCELLED' } },
                        include: {
                            orderItems: {
                                include: {
                                    variant: {
                                        include: { product: true }
                                    }
                                }
                            }
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 10
                    }
                }
            });

            if (user) {
                const purchasedProducts = user.orders.flatMap(o =>
                    o.orderItems.map(i => ({
                        name: i.variant.product.name,
                        brand: i.variant.product.brand,
                        scentGroup: i.variant.product.scentGroup,
                        topNotes: i.variant.product.topNotes,
                        gender: i.variant.product.gender,
                        volume: i.variant.volume
                    }))
                );

                if (purchasedProducts.length > 0) {
                    const brandCounts: Record<string, number> = {};
                    const scentGroups: string[] = [];
                    const allNotes: string[] = [];

                    purchasedProducts.forEach(p => {
                        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
                        if (p.scentGroup) scentGroups.push(p.scentGroup);
                        allNotes.push(...p.topNotes);
                    });

                    const favBrand = Object.entries(brandCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

                    userContext = `
Thông tin khách hàng:
- Tên: ${user.name ?? 'Khách'}
- Đã mua: ${purchasedProducts.map(p => `${p.name} (${p.brand}, ${p.volume}ml)`).join(', ')}
- Brand yêu thích: ${favBrand ?? 'chưa rõ'}
- Nhóm hương đã mua: ${[...new Set(scentGroups)].join(', ') || 'chưa rõ'}
- Nốt hương thường gặp: ${[...new Set(allNotes)].slice(0, 8).join(', ') || 'chưa rõ'}

Dựa vào lịch sử này, hãy tư vấn phù hợp với gu của khách. Nếu khách hỏi chung chung, hãy gợi ý dựa trên sở thích đã biết.`;
                } else {
                    userContext = `Khách hàng: ${user.name ?? 'Khách'} (chưa có lịch sử mua hàng).`;
                }
            }
        }
    } catch {
        /* skip user context nếu auth bị lỗi */
    }

    // Lưu tin nhắn user vào DB
    const userMessage = messages[messages.length - 1];
    if (sessionId && userMessage?.role === 'user') {
        await prisma.message.create({
            data: {
                chatSessionId: sessionId,
                role: 'user',
                text: userMessage.text
            }
        });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
        contents: messages.map((msg: { role: string; text: string }) => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
        })),
        systemInstruction: {
            parts: [{
                text: `Bạn là nhân viên tư vấn nước hoa tại AURA Signature. Trả lời ngắn gọn, tự nhiên như nhắn tin — tối đa 2-3 câu. Không dùng markdown, không gạch đầu dòng, không hoa mỹ. Không tự giới thiệu dài dòng.

                ${userContext}
                
                Sản phẩm hiện có:
                ${products || 'Đang tải...'}
                
                Quy tắc:
                - Mỗi lần chỉ hỏi 1 câu
                - Chỉ gợi ý sản phẩm có trong danh sách trên, kèm giá
                - Xưng "mình", gọi khách là "bạn"
                - Nếu biết lịch sử mua hàng, hãy dùng để hiểu gu của khách nhưng KHÔNG đề cập trực tiếp lịch sử đó trừ khi khách hỏi
                - Chỉ tư vấn sản phẩm khi khách hỏi hoặc có nhu cầu rõ ràng, không tự ý gợi ý ngay từ đầu
                - Nếu hỏi ngoài chủ đề nước hoa, nhẹ nhàng đưa về chủ đề chính`
            }]
        }
    };

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Hệ thống đang bận, bạn thử lại nhé!';

    // Lưu tin nhắn AI vào DB
    if (sessionId) {
        await prisma.message.create({
            data: {
                chatSessionId: sessionId,
                role: 'model',
                text
            }
        });
    }

    return NextResponse.json({ text });
}