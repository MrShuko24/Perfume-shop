import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
// Import file prisma anh vừa tạo ở bước trước (nhớ check lại đường dẫn nếu anh báo lỗi đỏ nhé)
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        // Lấy dữ liệu người dùng gửi lên từ giao diện
        const body = await req.json();
        const { name, email, password } = body;

        // 1. Kiểm tra xem có nhập thiếu không
        if (!email || !password) {
            return NextResponse.json({ message: "Thiếu email hoặc mật khẩu kìa anh ơi!" }, { status: 400 });
        }

        // 2. Kiểm tra xem Email này đã có ai dùng chưa
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return NextResponse.json({ message: "Email này đã được đăng ký rồi!" }, { status: 409 });
        }

        // 3. Băm mật khẩu (Hash) với độ khó là 10
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Lưu User mới vào MongoDB
        const newUser = await prisma.user.create({
            data: {
                name: name || "Khách hàng mới", // Nếu không nhập tên thì để mặc định
                email,
                password: hashedPassword,
            }
        });

        // 5. Trả về kết quả (Nhớ xóa password trước khi trả về để bảo mật)
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            message: "Đăng ký thành công mỹ mãn!",
            user: userWithoutPassword
        }, { status: 201 });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);
        return NextResponse.json({ message: "Lỗi Server rồi anh ơi!" }, { status: 500 });
    }
}