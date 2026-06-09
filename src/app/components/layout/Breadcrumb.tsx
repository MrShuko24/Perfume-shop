import Link from 'next/link';

type BreadcrumbItem = {
    label: string;
    href?: string;
};

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
    return (
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 font-medium">
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-stone-300">›</span>}
                    {item.href ? (
                        <Link href={item.href} className="hover:text-stone-600 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-stone-600">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}