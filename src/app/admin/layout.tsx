import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
                                              children,
                                          }: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) redirect('/login');
    if (session.user.role !== 'ADMIN') redirect('/');

    return (
        <div className="min-h-screen bg-stone-50">
            {/* SIDEBAR */}
            <aside className="fixed top-0 left-0 h-full w-64 bg-stone-900 text-white flex flex-col z-50">
                <div className="px-6 py-8 border-b border-stone-700">
                    <h1 className="font-serif text-xl font-bold tracking-widest">AURA</h1>
                    <p className="text-rose-400 text-xs italic mt-1">Admin Dashboard</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1">
                    <a
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white transition-colors text-sm font-medium"
                    >
                        📊 Tổng quan
                    </a>
                    <a
                        href="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white transition-colors text-sm font-medium"
                    >
                        🧴 Sản phẩm
                    </a>
                    <a
                        href="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white transition-colors text-sm font-medium"
                    >
                        📦 Đơn hàng
                    </a>
                </nav>

                <div className="px-4 py-6 border-t border-stone-700">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-400 hover:bg-stone-800 hover:text-white transition-colors text-sm"
                    >
                        ← Về trang chủ
                    </Link>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}