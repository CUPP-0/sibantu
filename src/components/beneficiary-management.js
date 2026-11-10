"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight, CircleCheck, Plus, RotateCcw, UserPlus, Users, X } from "lucide-react";

export default function BeneficiaryManagement({ selectedProgramId = null }) {
  const [regionName, setRegionName] = useState("");
  const [programs, setPrograms] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [notice, setNotice] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [savingAmountId, setSavingAmountId] = useState(null);

  async function loadData() {
    const responses = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/public/programs"),
      fetch("/api/admin/beneficiaries"),
    ]);
    const results = await Promise.all(responses.map((response) => response.json()));
    const failed = responses.findIndex((response) => !response.ok);
    if (failed >= 0) throw new Error(results[failed].error || "Data cabang belum dapat dimuat.");
    if (!results[0].data.user?.regionName) throw new Error("Wilayah kerja akun cabang belum diatur.");
    setRegionName(results[0].data.user.regionName);
    setPrograms(results[1].data.filter((program) => program.status === "aktif"));
    setBeneficiaries(results[2].data);
  }

  useEffect(() => {
    Promise.resolve().then(() => loadData()).catch((cause) => setError(cause.message)).finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setCreated(null);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/beneficiaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Akun warga gagal dibuat.");
      setCreated(result.data);
      form.reset();
      setCreateModalOpen(false);
      await loadData();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveAmount(event, programEnrollmentId) {
    event.preventDefault();
    const form = event.currentTarget;
    const amount = new FormData(form).get("amount");
    setSavingAmountId(programEnrollmentId);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/beneficiaries/${programEnrollmentId}/amount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Nominal bantuan gagal diperbarui.");
      setNotice("Nominal bantuan penerima berhasil diperbarui.");
      await loadData();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSavingAmountId(null);
    }
  }

  async function resetClaims() {
    if (!window.confirm("Reset status pengambilan semua warga di wilayah cabang ini? Riwayat pengambilan akan tetap tersimpan.")) return;
    setResetting(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/claims/reset", { method: "POST" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Status pengambilan gagal direset.");
      setNotice(`${result.data.resetCount} pengambilan direset. Riwayat tetap tersimpan.`);
      await loadData();
    } catch (cause) {
      setError(cause.message);
    } finally {
      setResetting(false);
    }
  }

  const selectedProgram = programs.find((program) => String(program.id) === String(selectedProgramId));
  const isProgramDetail = Boolean(selectedProgramId);
  const selectedBeneficiaries = beneficiaries.filter(
    (person) => String(person.programId) === String(selectedProgramId),
  );
  const recipientCountByProgram = beneficiaries.reduce((counts, person) => {
    const key = String(person.programId);
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map());

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          {selectedProgram && <Link href="/admin/penerima" className="mb-3 inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#77778a] hover:text-[#111111]"><ArrowLeft size={13} /> Semua program</Link>}
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Data cabang</p>
          <h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">{selectedProgram?.name || (isProgramDetail ? "Program bantuan" : "Akun warga dan penerima.")}</h1>
          <p className="mt-2 max-w-[700px] text-[11px] leading-5 text-[#77778a]">
            {selectedProgram
              ? `Daftar penerima program ${selectedProgram.name} di wilayah ${regionName || "cabang Anda"}.`
              : isProgramDetail
                ? `Tabel penerima di wilayah ${regionName || "cabang Anda"}.`
                : `Pilih program bantuan untuk melihat tabel penerimanya di wilayah ${regionName || "cabang Anda"}.`}
          </p>
        </div>
        <button type="button" onClick={() => { setError(""); setCreateModalOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white hover:bg-[#000000]"><Plus size={15} /> Buat penerima</button>
      </div>
      {createModalOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#171421]/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setCreateModalOpen(false); }}>
        <form onSubmit={submit} className="my-auto grid w-full max-w-[620px] gap-3.5 rounded-[17px] border border-[#eae8f0] bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><UserPlus size={17} /></span><div><h2 className="text-[13px] font-bold">Daftarkan penerima baru</h2><p className="mt-1 text-[10px] text-[#9290a0]">Wilayah otomatis: {regionName || "memuatâ€¦"}</p></div></div><button type="button" onClick={() => setCreateModalOpen(false)} disabled={saving} className="rounded-lg p-2 text-[#77778a] hover:bg-[#f5f3f8]" aria-label="Tutup form"><X size={17} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Nama lengkap<input name="name" required minLength={2} maxLength={150} className="form-control text-[11px] font-normal" /></label><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Email akun warga<input name="email" type="email" required maxLength={190} className="form-control text-[11px] font-normal" /></label></div>
          <label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Kata sandi untuk login warga<input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="form-control text-[11px] font-normal" placeholder="Minimal 8 karakter" /><span className="font-normal text-[#9290a0]">Buat dan sampaikan kata sandi ini kepada warga dengan aman.</span></label>
          <label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">NIK (16 angka)<input name="nik" inputMode="numeric" pattern="[0-9]{16}" minLength={16} maxLength={16} required className="form-control text-[11px] font-normal" /></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Jenis kelamin<select name="gender" required defaultValue="" className="form-control text-[11px] font-normal"><option value="" disabled>Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Tanggal lahir<input name="birthDate" type="date" required className="form-control text-[11px] font-normal" /></label></div>
          <label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Alamat<input name="address" required minLength={5} maxLength={2000} className="form-control text-[11px] font-normal" /></label>
          <label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Nomor telepon (opsional)<input name="phone" type="tel" maxLength={30} className="form-control text-[11px] font-normal" /></label>
          <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Wilayah akun warga<input value={regionName || "Memuat wilayah cabangâ€¦"} readOnly className="form-control text-[11px] font-normal" aria-label="Wilayah akun warga otomatis" /></label><label className="grid gap-1 text-[10px] font-semibold text-[#4f4d60]">Program bantuan<select name="programId" required defaultValue={selectedProgramId || ""} className="form-control text-[11px] font-normal"><option value="" disabled>Pilih program</option>{programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label></div>
          {error && <p role="alert" className="rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setCreateModalOpen(false)} disabled={saving} className="h-10 rounded-xl border border-[#eae8f0] px-4 text-[11px] font-semibold text-[#555366] disabled:opacity-50">Batal</button><button disabled={saving || !regionName || !programs.length} className="h-10 rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white hover:bg-[#000000] disabled:opacity-50">{saving ? "Membuat akun wargaâ€¦" : "Buat penerima"}</button></div>
        </form>
      </div>}

      {error && !createModalOpen && <p role="alert" className="mb-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}
      <div className="grid gap-4">
          {created && <section className="rounded-[17px] border border-[#bfe7d2] bg-white p-5">
            <div className="flex items-center gap-2 text-[12px] font-bold text-[#218755]"><CircleCheck size={17} /> Akun penerima berhasil dibuat</div>
            <p className="mt-2 text-[10px] text-[#77778a]">{created.beneficiary.name} Â· {created.beneficiary.email} Â· {created.beneficiary.programName}</p>
            <div className="mt-4 rounded-xl bg-[#f8f8f5] p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-[#9290a0]">Akses portal warga</p><p className="mt-2 text-[11px] font-semibold">{created.beneficiary.email}</p><p className="mt-2 text-[9px] leading-4 text-[#77778a]">Berikan kata sandi yang dibuat saat pendaftaran kepada warga. QR pengambilan bantuan tersedia setelah warga masuk ke halaman profil.</p></div>
            </section>}
            {!isProgramDetail && <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0eef4] px-5 py-4">
                <div><h2 className="text-[13px] font-bold">Program bantuan</h2><p className="mt-1 text-[10px] text-[#9290a0]">Pilih program untuk membuka tabel penerima.</p></div>
                <div className="flex flex-wrap gap-2"><Link href="/admin/riwayat" className="inline-flex h-9 items-center rounded-lg border border-[#eae8f0] px-3 text-[10px] font-semibold text-[#555366] hover:text-[#111111]">Riwayat pengambilan</Link><button type="button" onClick={resetClaims} disabled={resetting || !beneficiaries.some((person) => person.claimStatus === "sudah_diambil")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#f1d8d8] px-3 text-[10px] font-semibold text-[#a93434] disabled:opacity-50"><RotateCcw size={13} />{resetting ? "Meresetâ€¦" : "Reset semua status"}</button></div>
              </div>
              {notice && <p role="status" className="m-4 rounded-xl bg-[#eff8f3] p-3 text-[10px] text-[#218755]">{notice}</p>}
              {loading && <p className="p-6 text-center text-[11px] text-[#77778a]">Memuat daftar programâ€¦</p>}
              {!loading && !programs.length && <p className="p-7 text-center text-[11px] text-[#77778a]">Belum ada program bantuan aktif.</p>}
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {programs.map((program) => {
                  const recipientCount = recipientCountByProgram.get(String(program.id)) || 0;
                  return (
                    <Link key={program.id} href={`/admin/penerima/${program.id}`} className="group flex items-center justify-between gap-4 rounded-xl border border-[#eae8f0] p-4 transition hover:border-[#cfc5ff] hover:bg-[#fbfaff]">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f6d8] text-[#111111]"><Users size={17} /></span>
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-bold text-[#424052]">{program.name}</span>
                          <span className="mt-1 block text-[10px] text-[#9290a0]">{recipientCount} penerima</span>
                        </span>
                      </span>
                      <ChevronRight size={17} className="shrink-0 text-[#9290a0] transition group-hover:translate-x-0.5 group-hover:text-[#111111]" />
                    </Link>
                  );
                })}
              </div>
            </section>}
            {isProgramDetail && !selectedProgram && !loading && <section className="rounded-[17px] border border-[#eae8f0] bg-white p-7 text-center text-[11px] text-[#77778a]">Program bantuan tidak aktif atau tidak ditemukan.</section>}
            {isProgramDetail && selectedProgram && <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0eef4] px-5 py-4">
                <div><h2 className="text-[13px] font-bold">Status pengambilan warga</h2><p className="mt-1 text-[10px] text-[#9290a0]">Daftar penerima {selectedProgram.name} di wilayah {regionName || "cabang ini"}.</p></div>
                <div className="flex flex-wrap gap-2"><Link href="/admin/riwayat" className="inline-flex h-9 items-center rounded-lg border border-[#eae8f0] px-3 text-[10px] font-semibold text-[#555366] hover:text-[#111111]">Riwayat pengambilan</Link><button type="button" onClick={resetClaims} disabled={resetting || !beneficiaries.some((person) => person.claimStatus === "sudah_diambil")} className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#f1d8d8] px-3 text-[10px] font-semibold text-[#a93434] disabled:opacity-50"><RotateCcw size={13} />{resetting ? "Meresetâ€¦" : "Reset semua status"}</button></div>
              </div>
              {notice && <p role="status" className="m-4 rounded-xl bg-[#eff8f3] p-3 text-[10px] text-[#218755]">{notice}</p>}
              <div className="flex items-center gap-3 border-b border-[#f0eef4] px-5 py-4"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><CircleCheck size={17} /></span><div><h2 className="text-[13px] font-bold">Penerima di wilayah tugas</h2><p className="mt-1 text-[10px] text-[#9290a0]">NIK dan alamat lengkap tidak ditampilkan pada daftar.</p></div></div>
              {loading && <p className="p-6 text-center text-[11px] text-[#77778a]">Memuat daftar penerimaâ€¦</p>}
              {!loading && !selectedBeneficiaries.length && <p className="p-7 text-center text-[11px] text-[#77778a]">Belum ada penerima untuk program ini.</p>}
              {!!selectedBeneficiaries.length && <div className="overflow-x-auto"><table className="w-full min-w-[740px] text-left text-[10px]"><thead className="text-[#9290a0]"><tr><th className="px-4 py-2.5 font-semibold">Penerima</th><th className="px-4 py-2.5 font-semibold">Wilayah</th><th className="px-4 py-2.5 font-semibold">Nominal bantuan (Rp)</th><th className="px-4 py-2.5 font-semibold">Status pengambilan</th><th className="px-4 py-2.5 font-semibold">Tanggal/jam diambil</th></tr></thead><tbody>{selectedBeneficiaries.map((person) => <tr key={person.beneficiaryProgramId} className="border-t border-[#f0eef4]"><td className="px-4 py-3"><p className="font-semibold text-[#424052]">{person.name}</p><p className="mt-1 text-[9px] text-[#9290a0]">{person.email}</p></td><td className="px-4 py-3">{person.regionName}</td><td className="px-4 py-3"><form onSubmit={(event) => saveAmount(event, person.beneficiaryProgramId)} className="flex items-center gap-2"><input name="amount" type="number" required min="0" max="9999999999999.99" step="0.01" defaultValue={person.assistanceAmount ?? ""} aria-label={`Nominal bantuan untuk ${person.name} - ${selectedProgram.name}`} className="form-control h-8 w-32 text-[10px]" /><button type="submit" disabled={savingAmountId === person.beneficiaryProgramId} className="h-8 rounded-lg border border-[#eae8f0] px-2 text-[9px] font-semibold text-[#788900] hover:bg-[#f8fbe8] disabled:opacity-50">{savingAmountId === person.beneficiaryProgramId ? "Simpanâ€¦" : "Simpan"}</button></form></td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${person.claimStatus === "sudah_diambil" ? "bg-[#eff8f3] text-[#218755]" : "bg-[#fff5e9] text-[#a56817]"}`}>{person.claimStatus === "sudah_diambil" ? "Sudah mengambil" : "Belum mengambil"}</span></td><td className="px-4 py-3">{person.claimedAt ? new Date(person.claimedAt).toLocaleString("id-ID") : "â€”"}</td></tr>)}</tbody></table></div>}
            </section>}
        </div>
    </div>
  );
}
