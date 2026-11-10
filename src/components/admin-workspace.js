import Link from "next/link";
import { ArrowLeft, BarChart3, Building2, CalendarDays, ClipboardList, History, MessageSquareWarning, QrCode, ShieldCheck, Users } from "lucide-react";

const linksByRole = {
  super_admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: ClipboardList },
    { href: "/admin/cabang", label: "Admin cabang", icon: Building2 },
    { href: "/admin/progres", label: "Progres penyaluran", icon: BarChart3 },
    { href: "/admin/pengaduan", label: "Pengaduan", icon: MessageSquareWarning },
  ],
  admin_daerah: [
    { href: "/admin/dashboard", label: "Dashboard", icon: ClipboardList },
    { href: "/admin/penerima", label: "Akun warga", icon: Users },
    { href: "/admin/verifikasi-qr", label: "Verifikasi QR", icon: QrCode },
    { href: "/admin/riwayat", label: "Riwayat pengambilan", icon: History },
    { href: "/admin/event", label: "Jadwal bantuan", icon: CalendarDays },
  ],
};

export default function AdminWorkspace({ user, title, children }) {
  const links = linksByRole[user.role] || linksByRole.super_admin;
  return (
    <main className="min-h-screen bg-[#f8f8f5]">
      <aside className="fixed inset-y-0 left-0 hidden w-[235px] border-r border-[#eae8f0] bg-white p-5 lg:block">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#111111] text-white"><ShieldCheck size={19} /></span>
          <span className="text-[15px] font-bold tracking-[-0.04em]">si<span className="text-[#111111]">bantu</span></span>
        </Link>
        <p className="mt-10 px-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#a09eaa]">Menu pengelola</p>
        <nav className="mt-3 grid gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-3 text-[11px] font-semibold text-[#626073] transition hover:bg-[#f3f6d8] hover:text-[#788900]">
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <Link href="/admin/dashboard" className="mt-8 inline-flex items-center gap-2 px-2 text-[10px] font-semibold text-[#77778a] hover:text-[#111111]"><ArrowLeft size={13} /> Kembali ke ringkasan</Link>
      </aside>
      <div className="lg:pl-[235px]">
        <header className="sticky top-0 z-10 border-b border-[#eae8f0] bg-white/95 px-5 backdrop-blur sm:px-8">
          <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9997a4]">{user.role === "super_admin" ? "Super Admin" : "Admin cabang"}</p><p className="mt-1 text-[13px] font-bold">{title}</p></div>
            <div className="text-right"><p className="text-[11px] font-semibold">{user.name}</p><p className="mt-0.5 text-[9px] text-[#9290a0]">{user.regionName || (user.role === "super_admin" ? "Nasional" : "Wilayah belum diatur")}</p></div>
          </div>
          <nav className="mx-auto flex max-w-[1180px] gap-2 overflow-x-auto pb-3 lg:hidden">
            {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#eae8f0] px-3 py-2 text-[10px] font-semibold text-[#626073]"><Icon size={13} />{label}</Link>)}
          </nav>
        </header>
        <div className="mx-auto max-w-[1180px] px-5 py-7 sm:px-8">{children}</div>
      </div>
    </main>
  );
}
