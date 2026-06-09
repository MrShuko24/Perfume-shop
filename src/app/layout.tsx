import type { Metadata } from "next";
import "./globals.css";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import CartDrawer from "@/app/components/cart/CartDrawer";
import AuthProvider from "@/app/components/auth/AuthProvider";
import NextTopLoader from 'nextjs-toploader';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakarta = Plus_Jakarta_Sans({
    subsets: ['latin', 'vietnamese'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-jakarta',
});

export const metadata: Metadata = {
    title: "Aura Signature",
    description: "Showroom Nước Hoa Sang Xịn Mịn",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
        <body className={`${plusJakarta.variable} font-sans antialiased bg-[#FDFBF7]`}>
        <AuthProvider>
            <Header />
            <CartDrawer />
            {children}
            <Footer />
        </AuthProvider>
        <NextTopLoader color="#fb7185" height={2} showSpinner={false} />
        </body>
        </html>
    );
}