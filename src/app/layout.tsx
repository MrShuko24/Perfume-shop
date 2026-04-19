import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Aura by Mochi",
    description: "Showroom Nước Hoa Sang Xịn Mịn",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Thêm suppressHydrationWarning vào đây để tắt lỗi Hydration
        <html lang="vi" suppressHydrationWarning>
        <body className="antialiased bg-[#FDFBF7]">
        {children}
        </body>
        </html>
    );
}