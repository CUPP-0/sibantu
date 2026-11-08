"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, CircleCheck, UserPlus } from "lucide-react";

function currency(value) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value || 0);
}

export default function BranchManagement() {
  const [regions, setRegions] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadBranches() {
    const [branchResponse, regionResponse] = await Promise.all([
      fetch("/api/admin/branches"),
      fetch("/api/admin/regions"),
    ]);
    const [branchResult, regionResult] = await Promise.all([branchResponse.json(), regionResponse.json()]);
    if (!branchResponse.ok) throw new Error(branchResult.error || "Daftar admin cabang tidak dapat dimuat.");
    if (!regionResponse.ok) throw new Error(regionResult.error || "Daftar wilayah tidak dapat dimuat.");
    setBranches(branchResult.data);
    setRegions(regionResult.data);
  }

  useEffect(() => {
    Promise.resolve().then(() => loadBranches())
      .catch((cause) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setNotice("");
    const fields = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          password: fields.get("password"),
          regionId: fields.get("regionId"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Akun admin cabang gagal dibuat.");
      setNotice(`Akun admin untuk ${result.data.regionName} berhasil dibuat.`);
      form.reset();
      await loadBranches();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d4aff]">Akses cabang</p><h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Kelola admin cabang.</h1><p className="mt-2 max-w-[650px] text-[11px] leading-5 text-[#77778a]">Buat satu akun admin aktif untuk setiap wilayah cabang. Admin cabang hanya dapat mengelola penerima dan verifikasi penyaluran di wilayah tugasnya.</p></div>
      <div className="grid items-start gap-5 xl:grid-cols-[0.82fr_1.18fr]">
        <form onSubmit={submit} className="grid gap-4 rounded-[17px] border border-[#eae8f0] bg-white p-5">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f0ff] text-[#6d4aff]"><UserPlus size={17} /></span><div><h2 className="text-[13px] font-bold">Buat akun admin</h2><p className="mt-1 text-[10px] text-[#9290a0]">Kredensial awal diberikan secara langsung.</p></div></div>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Nama admin<input name="name" required minLength={2} maxLength={120} className="form-control text-[11px] font-normal" placeholder="Nama admin cabang" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Email<input name="email" type="email" required maxLength={190} className="form-control text-[11px] font-normal" placeholder="admin.cabang@email.id" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Kata sandi awal<input name="password" type="password" required minLength={12} maxLength={128} className="form-control text-[11px] font-normal" placeholder="Minimal 12 karakter" /></label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Wilayah cabang<select name="regionId" required defaultValue="" className="form-control text-[11px] font-normal"><option value="" disabled>Pilih wilayah kerja</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name} — {region.level}</option>)}</select></label>
          {error && <p role="alert" className="rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}
          {notice && <p role="status" className="inline-flex items-center gap-2 rounded-xl bg-[#eff8f3] p-3 text-[10px] text-[#218755]"><CircleCheck size={14} />{notice}</p>}
          <button disabled={saving || !regions.length} className="h-10 rounded-xl bg-[#6d4aff] text-[11px] font-semibold text-white hover:bg-[#5035c9] disabled:opacity-50">{saving ? "Membuat akun…" : "Buat akun admin cabang"}</button>
        </form>

        <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
          <div className="flex items-center gap-3 border-b border-[#f0eef4] px-5 py-4"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f1f5ff] text-[#4c68c8]"><Building2 size={17} /></span><div><h2 className="text-[13px] font-bold">Cabang dan proses penyaluran</h2><p className="mt-1 text-[10px] text-[#9290a0]">Ringkasan seluruh wilayah cabang.</p></div></div>
          {loading && <p className="p-6 text-center text-[11px] text-[#77778a]">Memuat daftar cabang…</p>}
          {!loading && !error && !branches.length && <p className="p-7 text-center text-[11px] text-[#77778a]">Belum ada admin cabang. Buat akun untuk mulai memantau penyaluran.</p>}
          {!loading && branches.length > 0 && <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-[10px]"><thead className="bg-[#faf9fc] text-[#9290a0]"><tr><th className="px-4 py-3 font-semibold">Cabang / admin</th><th className="px-4 py-3 font-semibold">Penerima</th><th className="px-4 py-3 font-semibold">Penyaluran</th><th className="px-4 py-3 font-semibold">Tersalurkan</th><th className="px-4 py-3 font-semibold">Menunggu</th><th className="px-4 py-3 font-semibold">Detail</th></tr></thead><tbody>{branches.map((branch) => <tr key={branch.adminId} className="border-t border-[#f0eef4]"><td className="px-4 py-3"><p className="font-semibold text-[#424052]">{branch.regionName}</p><p className="mt-1 text-[9px] text-[#9290a0]">{branch.adminName} · {branch.email}</p><span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold ${branch.isActive ? "bg-[#eff8f3] text-[#218755]" : "bg-[#fff3f3] text-[#a93434]"}`}>{branch.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="px-4 py-3">{branch.beneficiaries}</td><td className="px-4 py-3">{branch.distributions}</td><td className="px-4 py-3 font-semibold">{currency(branch.distributedAmount)}</td><td className="px-4 py-3">{branch.pendingDistributions}</td><td className="px-4 py-3"><Link href="/admin/progres" className="font-semibold text-[#6d4aff] hover:underline">Lihat progres</Link></td></tr>)}</tbody></table></div>}
        </section>
      </div>
      <p className="mt-5 rounded-[13px] border border-[#e8e3fb] bg-[#f7f5ff] p-4 text-[10px] leading-5 text-[#625b7c]">Super admin dapat memantau total proses per cabang, tetapi data pribadi penerima tidak ditampilkan dalam ringkasan nasional.</p>
    </div>
  );
}
