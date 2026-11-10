"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Building2, CircleCheck, Clock3, Search, TriangleAlert, Users, Wallet, X } from "lucide-react";
import MonthlyDistributionChart from "@/components/monthly-distribution-chart";

const currency = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
}).format(value || 0);

const statuses = {
  berhasil: "Sudah disalurkan",
  menunggu: "Menunggu penyaluran",
  dijadwalkan: "Dijadwalkan",
  gagal: "Gagal",
  ditunda: "Ditunda",
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-[14px] border border-[#eae8f0] bg-white p-4">
      <div className="flex items-center justify-between"><p className="text-[10px] font-semibold text-[#77778a]">{label}</p><Icon size={15} className="text-[#111111]" /></div>
      <p className="mt-3 text-[19px] font-bold tracking-[-0.04em]">{value}</p>
    </div>
  );
}

export default function BranchProgress() {
  const [branches, setBranches] = useState([]);
  const [queryText, setQueryText] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");
  const [monthlyPreviewOpen, setMonthlyPreviewOpen] = useState(false);

  useEffect(() => {
    async function loadBranches() {
      try {
        const response = await fetch("/api/admin/branches");
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Daftar cabang gagal dimuat.");
        setBranches(result.data);
      } catch (cause) {
        setError(cause.message);
      } finally {
        setLoadingBranches(false);
      }
    }
    loadBranches();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    async function loadProgress() {
      setLoadingDetail(true);
      setError("");
      setDetail(null);
      try {
        const response = await fetch(`/api/admin/branches/${selectedId}/progress`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Progres cabang gagal dimuat.");
        if (active) setDetail(result.data);
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoadingDetail(false);
      }
    }
    loadProgress();
    return () => { active = false; };
  }, [selectedId]);

  const filteredBranches = useMemo(() => {
    const normalized = queryText.trim().toLocaleLowerCase("id-ID");
    if (!normalized) return branches;
    return branches.filter((branch) =>
      `${branch.regionName} ${branch.adminName} ${branch.email}`.toLocaleLowerCase("id-ID").includes(normalized),
    );
  }, [branches, queryText]);

  const totalRecipients = detail?.programs.reduce((sum, program) => sum + program.recipientCount, 0) || 0;
  const totalDistributed = detail?.programs.reduce((sum, program) => sum + program.distributedCount, 0) || 0;
  const totalAmount = detail?.programs.reduce((sum, program) => sum + program.distributedAmount, 0) || 0;
  const progressPercent = totalRecipients ? Math.round((totalDistributed / totalRecipients) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Pemantauan nasional</p>
        <h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Progres penyaluran per cabang.</h1>
        <p className="mt-2 max-w-[700px] text-[11px] leading-5 text-[#77778a]">Cari cabang untuk melihat penerima terdaftar, progres setiap program, nilai tersalurkan, dan status proses penyaluran.</p>
      </div>

      <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
        <div className="border-b border-[#f0eef4] p-5">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><Building2 size={17} /></span><div><h2 className="text-[13px] font-bold">Cari admin cabang</h2><p className="mt-1 text-[10px] text-[#9290a0]">Pilih cabang untuk membuka rincian progres.</p></div></div>
          <label className="relative mt-4 block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9290a0]" />
            <input value={queryText} onChange={(event) => setQueryText(event.target.value)} className="form-control pl-9 text-[11px]" placeholder="Cari nama wilayah, admin, atau email" aria-label="Cari cabang" />
          </label>
        </div>
        {loadingBranches && <p className="p-6 text-center text-[11px] text-[#77778a]">Memuat daftar cabangâ€¦</p>}
        {!loadingBranches && !filteredBranches.length && <p className="p-7 text-center text-[11px] text-[#77778a]">{branches.length ? "Tidak ada cabang yang cocok dengan pencarian." : "Belum ada akun admin cabang."}</p>}
        {filteredBranches.length > 0 && <div className="overflow-x-auto">
          <table className="w-full min-w-[690px] text-left text-[10px]">
            <thead className="bg-[#f8f8f5] text-[#9290a0]"><tr><th className="px-4 py-3 font-semibold">Cabang / admin</th><th className="px-4 py-3 font-semibold">Penerima</th><th className="px-4 py-3 font-semibold">Sudah disalurkan</th><th className="px-4 py-3 font-semibold">Nilai tersalurkan</th><th className="px-4 py-3 font-semibold">Progres</th></tr></thead>
            <tbody>{filteredBranches.map((branch) => {
              const percent = branch.programEnrollments ? Math.round((branch.distributions / branch.programEnrollments) * 100) : 0;
              const isSelected = String(branch.adminId) === selectedId;
              return <tr key={branch.adminId} className={`border-t border-[#f0eef4] ${isSelected ? "bg-[#f8fbe8]" : ""}`}>
                <td className="px-4 py-2.5"><button type="button" onClick={() => setSelectedId(String(branch.adminId))} className="text-left"><span className="font-semibold text-[#424052]">{branch.regionName}</span><span className="mt-1 block text-[9px] text-[#9290a0]">{branch.adminName} Â· {branch.email}</span></button></td>
                <td className="px-4 py-2.5">{branch.beneficiaries} <span className="text-[8px] text-[#9290a0]">({branch.programEnrollments} program)</span></td><td className="px-4 py-2.5">{branch.distributions} / {branch.programEnrollments}</td><td className="px-4 py-2.5"><button type="button" title={`Lihat statistik penyaluran bulanan untuk ${branch.regionName}`} onClick={() => { setSelectedId(String(branch.adminId)); setMonthlyPreviewOpen(true); }} className="font-semibold text-[#424052] underline decoration-dotted underline-offset-2 hover:text-[#111111]">{currency(branch.distributedAmount)}</button></td>
                <td className="px-4 py-2.5"><button type="button" onClick={() => setSelectedId(String(branch.adminId))} className="w-24 text-left"><span className="block text-[9px] font-semibold">{percent}% Â· Lihat</span><span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#eeeaf8]"><span className="block h-full rounded-full bg-[#111111]" style={{ width: `${percent}%` }} /></span></button></td>
              </tr>;
            })}</tbody>
          </table>
        </div>}
      </section>

      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}

      {selectedId && <section className="mt-5">
        {loadingDetail && <p className="rounded-xl border border-[#eae8f0] bg-white p-6 text-center text-[11px] text-[#77778a]">Memuat rincian progres cabangâ€¦</p>}
        {!loadingDetail && detail && <>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Rincian cabang</p><h2 className="mt-1 text-[20px] font-bold tracking-[-0.04em]">{detail.branch.regionName}</h2><p className="mt-1 text-[10px] text-[#77778a]">{detail.branch.adminName} Â· {detail.branch.email}</p></div><span className={`rounded-full px-3 py-1 text-[9px] font-semibold ${detail.branch.isActive ? "bg-[#eff8f3] text-[#218755]" : "bg-[#fff3f3] text-[#a93434]"}`}>{detail.branch.isActive ? "Admin aktif" : "Admin nonaktif"}</span></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Penerima program" value={totalRecipients} icon={Users} />
            <StatCard label="Sudah disalurkan" value={`${totalDistributed} (${progressPercent}%)`} icon={CircleCheck} />
            <StatCard label="Menunggu proses" value={detail.programs.reduce((sum, program) => sum + program.pendingCount, 0)} icon={Clock3} />
            <StatCard label="Nilai tersalurkan" value={currency(totalAmount)} icon={Wallet} />
          </div>

          <div className="mt-5">
            <MonthlyDistributionChart
              data={detail.monthlyDistributions}
              title="Nilai penyaluran per bulan"
              description={`Total nominal penyaluran berhasil di wilayah ${detail.branch.regionName}.`}
            />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
            <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
              <div className="flex items-center gap-3 border-b border-[#f0eef4] px-5 py-4"><BarChart3 size={16} className="text-[#111111]" /><div><h3 className="text-[12px] font-bold">Progres per program</h3><p className="mt-1 text-[9px] text-[#9290a0]">Jumlah penerima dan nilai penyaluran berhasil.</p></div></div>
              {!detail.programs.length && <p className="p-6 text-center text-[10px] text-[#77778a]">Belum ada penerima terdaftar.</p>}
              {detail.programs.map((program) => {
                const percent = program.recipientCount ? Math.round((program.distributedCount / program.recipientCount) * 100) : 0;
                return <div key={program.programId} className="border-b border-[#f0eef4] p-4 last:border-b-0"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold">{program.programName}</p><p className="mt-1 text-[9px] text-[#9290a0]">{program.programStatus}</p></div><span className="text-[10px] font-bold text-[#788900]">{percent}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eeeaf8]"><span className="block h-full rounded-full bg-[#111111]" style={{ width: `${percent}%` }} /></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-[9px] text-[#77778a]"><span>{program.distributedCount}/{program.recipientCount} tersalurkan Â· {program.pendingCount} menunggu</span><span>{currency(program.distributedAmount)}</span></div>{program.issueCount > 0 && <p className="mt-2 inline-flex items-center gap-1 text-[9px] text-[#a56817]"><TriangleAlert size={11} />{program.issueCount} perlu ditindaklanjuti</p>}</div>;
              })}
            </section>

            <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
              <div className="border-b border-[#f0eef4] px-5 py-4"><h3 className="text-[12px] font-bold">Rincian proses penyaluran</h3><p className="mt-1 text-[9px] text-[#9290a0]">Maksimal 100 data terbaru. NIK dan alamat tidak ditampilkan.</p></div>
              {!detail.processes.length && <p className="p-6 text-center text-[10px] text-[#77778a]">Belum ada proses penyaluran di cabang ini.</p>}
              {detail.processes.length > 0 && <div className="max-h-[480px] overflow-auto">
                <table className="w-full min-w-[570px] text-left text-[9px]"><thead className="sticky top-0 bg-[#f8f8f5] text-[#9290a0]"><tr><th className="px-4 py-3 font-semibold">Penerima</th><th className="px-4 py-3 font-semibold">Program</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Nilai</th></tr></thead><tbody>{detail.processes.map((process, index) => <tr key={`${process.referenceNumber || process.beneficiaryName}-${process.programName}-${index}`} className="border-t border-[#f0eef4]"><td className="px-4 py-3"><p className="font-semibold text-[#424052]">{process.beneficiaryName}</p><p className="mt-1 text-[8px] text-[#9290a0]">{process.regionName}{process.referenceNumber ? ` Â· ${process.referenceNumber}` : ""}</p></td><td className="px-4 py-3">{process.programName}</td><td className="px-4 py-3">{statuses[process.distributionStatus] || process.distributionStatus}</td><td className="px-4 py-3 font-semibold">{currency(process.amount)}</td></tr>)}</tbody></table>
              </div>}
            </section>
          </div>
        </>}
      </section>}

      {monthlyPreviewOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171421]/50 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setMonthlyPreviewOpen(false); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="monthly-preview-title" className="w-full max-w-[760px] rounded-[18px] bg-[#f8f8f5] p-4 shadow-2xl sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#111111]">Pratinjau statistik</p>
              <h2 id="monthly-preview-title" className="mt-1 text-[17px] font-bold">{detail?.branch.regionName || "Nilai tersalurkan"}</h2>
            </div>
            <button type="button" onClick={() => setMonthlyPreviewOpen(false)} aria-label="Tutup pratinjau statistik" className="rounded-lg p-2 text-[#77778a] hover:bg-white"><X size={17} /></button>
          </div>
          {loadingDetail && <p className="rounded-xl border border-[#eae8f0] bg-white p-8 text-center text-[11px] text-[#77778a]">Memuat statistik bulananâ€¦</p>}
          {!loadingDetail && detail && <MonthlyDistributionChart data={detail.monthlyDistributions} title="Jumlah penyaluran per bulan" description="Nominal penyaluran berhasil dalam 12 bulan terakhir." />}
          {!loadingDetail && !detail && <p role="alert" className="rounded-xl border border-[#f1d8d8] bg-white p-5 text-[10px] text-[#a93434]">{error || "Statistik bulanan tidak dapat dimuat."}</p>}
        </section>
      </div>}
    </div>
  );
}
