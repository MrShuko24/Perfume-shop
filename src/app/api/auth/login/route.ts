import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        // 1. Kiểm tra xem user có nhập đủ thông tin không
        if (!email || !password) {
            return NextResponse.json({ message: "Vui lòng nhập đầy đủ Email và Mật khẩu!" }, { status: 400 });
        }

        // 2. Tìm User trong Database theo Email
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            return NextResponse.json({ message: "Email này chưa được đăng ký!" }, { status: 404 });
        }

        // 3. So sánh mật khẩu anh nhập vào với mật khẩu đã băm trong DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json({ message: "Mật khẩu sai rồi anh ơi!" }, { status: 401 });
        }

        // 4. Nếu đúng hết, tạo "Vé thông hành" (Token) có hạn 7 ngày
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        // 5. Trả về thông tin (Nhớ giấu password đi)
        const { password: _, ...userInfo } = user;

        return NextResponse.json({
            message: "Đăng nhập thành công!",
            token: token,
            user: userInfo
        }, { status: 200 });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        return NextResponse.json({ message: "Lỗi Server rồi!" }, { status: 500 });
    }
}