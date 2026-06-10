// import { Facebook, Instagram } from 'lucide-react';
//
// const TikTokIcon = () => (
//     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//         <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.78a4.85 4.85 0 01-1.01-.09z"/>
//     </svg>
// );
//
// const SOCIALS = [
//     {
//         icon: <Facebook className="w-5 h-5" />,
//         label: 'Facebook',
//         sub: 'Theo dõi trang',
//         href: 'https://www.facebook.com/profile.php?id=61590466721737',
//         color: 'hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5',
//     },
//     {
//         icon: <Instagram className="w-5 h-5" />,
//         label: 'Instagram',
//         sub: 'Khám phá hình ảnh',
//         href: 'https://www.instagram.com',
//         color: 'hover:text-[#E1306C] hover:border-[#E1306C]/30 hover:bg-[#E1306C]/5',
//     },
//     {
//         icon: <TikTokIcon />,
//         label: 'TikTok',
//         sub: 'Xem video review',
//         href: 'https://www.tiktok.com',
//         color: 'hover:text-stone-900 hover:border-stone-400/30 hover:bg-stone-100',
//     },
// ];
//
// export default function SocialBanner() {
//     return (
//         <section className="py-14 bg-[#FDFBF7] border-y border-stone-200/60">
//             <div className="max-w-4xl mx-auto px-6 text-center">
//                 <p className="text-xs uppercase tracking-[0.3em] text-rose-400 font-bold mb-2">Kết nối với chúng tôi</p>
//                 <h2 className="font-serif text-2xl text-stone-900 mb-2">Theo dõi AURA Signature</h2>
//                 <p className="text-sm text-stone-400 mb-10">Cập nhật bộ sưu tập mới, tips dùng nước hoa và ưu đãi độc quyền.</p>
//                 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
//                     {SOCIALS.map((s) => (
//                         <a  // ✅ Đã thêm
//                             key={s.label}
//                             href={s.href}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className={`flex items-center gap-3 px-8 py-4 rounded-xl border border-stone-200 text-stone-500 transition-all duration-200 w-full sm:w-auto ${s.color}`}
//                         >
//                             {s.icon}
//                             <div className="text-left">
//                                 <div className="text-sm font-semibold">{s.label}</div>
//                                 <div className="text-xs opacity-70">{s.sub}</div>
//                             </div>
//                         </a>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     );
// }