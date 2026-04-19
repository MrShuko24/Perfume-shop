import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

// Cân nhắc: Trong dự án thực tế, anh nên export prisma instance từ một file riêng (vd: lib/prisma.ts)
// để tránh lỗi cạn kiệt connection pool do Next.js hot-reload liên tục.
// Tạm thời em giữ nguyên theo yêu cầu của anh.
const prisma = new PrismaClient();

// 1. Định nghĩa khuôn mẫu cho Token (Tuân thủ nguyên tắc NO ANY)
interface CustomJwtPayload extends jwt.JwtPayload {
    userId: string;
    role: string;
}

export async function POST(req: Request) {
    try {
        // 2. Kiểm tra Header Authorization
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized: Không tìm thấy Token xác thực. Vui lòng đăng nhập!' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];

        // 3. Kiểm tra biến môi trường
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // Lỗi hệ thống: Chỉ log ra server để dev biết, không trả chi tiết mã lỗi ra ngoài client
            console.error("Critical Error: JWT_SECRET is not defined in environment variables.");
            return NextResponse.json(
                { message: 'Internal Server Error: Lỗi cấu hình máy chủ.' },
                { status: 500 }
            );
        }

        // 4. Xác thực và ép kiểu chuẩn xác cho Token
        const decoded = jwt.verify(token, secret) as CustomJwtPayload;

        // 5. Kiểm tra phân quyền (Authorization) - CHỈ ADMIN MỚI ĐƯỢC TẠO
        if (decoded.role !== 'ADMIN') {
            return NextResponse.json(
                { message: 'Forbidden: Bạn không có quyền thực hiện hành động này.' },
                { status: 403 }
            );
        }

        // 6. Validation dữ liệu đầu vào
        const body = await req.json();
        const { name } = body;

        // Bổ sung kiểm tra kiểu dữ liệu string và chống nhập chuỗi khoảng trắng
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return NextResponse.json(
                { message: 'Bad Request: Tên danh mục không hợp lệ hoặc bị để trống.' },
                { status: 400 }
            );
        }

        // 7. Thực thi lưu vào Database
        const newCategory = await prisma.category.create({
            data: {
                name: name.trim(), // Xóa khoảng trắng thừa ở hai đầu
            },
        });

        return NextResponse.json(
            { message: 'Tạo danh mục thành công.', data: newCategory },
            { status: 201 }
        );

    } catch (error) {
        // 8. Xử lý lỗi phân tầng khoa học
        console.error('API Error [POST /api/categories]:', error);

        if (error instanceof TokenExpiredError) {
            return NextResponse.json(
                { message: 'Unauthorized: Token đã hết hạn. Vui lòng đăng nhập lại.' },
                { status: 401 }
            );
        }

        if (error instanceof JsonWebTokenError) {
            return NextResponse.json(
                { message: 'Unauthorized: Token không hợp lệ.' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            { message: 'Internal Server Error: Đã xảy ra lỗi trong quá trình xử lý.' },
            { status: 500 }
        );
    }
}