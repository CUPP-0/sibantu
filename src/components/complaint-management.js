"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquareWarning, Search } from "lucide-react";

const statusLabels = {
  diterima: "Diterima",
  ditinjau: "Ditinjau",
  investigasi: "Investigasi",
  menunggu_informasi: "Menunggu informasi",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

const statusStyles = {
  diterima: "bg-[#f1f5ff] text-[#4c68c8]",
  ditinjau: "bg-[#f3f6d8] text-[#788900]",
  investigasi: "bg-[#fff5e9] text-[#a56817]",
  menunggu_informasi: "bg-[#fff5e9] text-[#a56817]",
  selesai: "bg-[#eff8f3] text-[#218755]",
  ditolak: "bg-[#fff3f3] text-[#a93434]",
};

function formatDate(value) {
  return new Date(value).toLocaleString("id-ID");
}

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [queryText, setQueryText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadComplaints() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(page) });
      if (status) params.set("status", status);
      if (queryText) params.set("q", queryText);
      try {
        const response = await fetch(`/api/admin/complaints?${params}`);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Daftar pengaduan gagal dimuat.");
        if (active) {
          setComplaints(result.data.complaints);
          setPagination(result.data.pagination);
        }
      } catch (cause) {
        if (active) setError(cause.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadComplaints();
    return () => { active = false; };
  }, [page, queryText, status]);

  function submitSearch(event) {
    event.preventDefault();
    setPage(1);
    setQueryText(search.trim());
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Pengawasan nasional</p>
        <h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Daftar pengaduan.</h1>
        <p className="mt-2 max-w-[700px] text-[11px] leading-5 text-[#77778a]">Lihat laporan masyarakat dari seluruh wilayah. Data kontak dan identitas pelapor tidak ditampilkan di daftar ini.</p>
      </div>

      <section className="overflow-hidden rounded-[17px] border border-[#eae8f0] bg-white">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#f0eef4] p-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><MessageSquareWarning size={17} /></span>
            <div><h2 className="text-[13px] font-bold">Seluruh pengaduan</h2><p className="mt-1 text-[10px] text-[#9290a0]">{pagination.total} laporan</p></div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <form onSubmit={submitSearch} className="flex min-w-0 gap-2">
              <label className="relative min-w-0 flex-1 sm:w-[260px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9290a0]" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} className="form-control h-9 pl-9 text-[10px]" placeholder="Cari tiket, wilayah, atau isi laporan" aria-label="Cari pengaduan" />
              </label>
              <button className="h-9 rounded-lg border border-[#eae8f0] px-3 text-[10px] font-semibold text-[#555366] hover:text-[#111111]">Cari</button>
            </form>
            <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="form-control h-9 w-full text-[10px] sm:w-[180px]" aria-label="Filter status pengaduan">
              <option value="">Semua status</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {error && <p role="alert" className="m-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] text-[#a93434]">{error}</p>}
        {loading && <p className="p-8 text-center text-[11px] text-[#77778a]">Memuat daftar pengaduanâ€¦</p>}
        {!loading && !error && !complaints.length && <p className="p-8 text-center text-[11px] text-[#77778a]">Tidak ada pengaduan yang cocok.</p>}
        {!loading && !!complaints.length && <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-[10px]">
            <thead className="bg-[#f8f8f5] text-[#9290a0]"><tr><th className="px-4 py-3 font-semibold">Nomor tiket</th><th className="px-4 py-3 font-semibold">Wilayah</th><th className="px-4 py-3 font-semibold">Kategori & laporan</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 font-semibold">Tanggal masuk</th></tr></thead>
            <tbody>{complaints.map((complaint) => <tr key={complaint.id} className="border-t border-[#f0eef4] align-top">
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#4f3fb2]">{complaint.ticketNumber}</td>
              <td className="px-4 py-3">{complaint.regionName}</td>
              <td className="max-w-[520px] px-4 py-3"><p className="font-semibold text-[#424052]">{complaint.category}</p><p className="mt-1 whitespace-pre-wrap break-words leading-5 text-[#77778a]">{complaint.description}</p></td>
              <td className="whitespace-nowrap px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${statusStyles[complaint.status] || "bg-[#f3f6d8] text-[#788900]"}`}>{statusLabels[complaint.status] || complaint.status}</span></td>
              <td className="whitespace-nowrap px-4 py-3 text-[#77778a]">{formatDate(complaint.createdAt)}</td>
            </tr>)}</tbody>
          </table>
        </div>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0eef4] px-5 py-3">
          <p className="text-[9px] text-[#9290a0]">Halaman {pagination.page} dari {pagination.totalPages} Â· 25 laporan per halaman</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#eae8f0] px-2.5 text-[9px] font-semibold text-[#555366] disabled:opacity-40"><ChevronLeft size={13} /> Sebelumnya</button>
            <button type="button" onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))} disabled={page >= pagination.totalPages || loading} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#eae8f0] px-2.5 text-[9px] font-semibold text-[#555366] disabled:opacity-40">Berikutnya <ChevronRight size={13} /></button>
          </div>
        </div>
      </section>
    </div>
  );
}
