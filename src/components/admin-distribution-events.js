"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, Plus, Send } from "lucide-react";

const dateTime = (value) => new Date(value).toLocaleString("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default function AdminDistributionEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/events")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Jadwal bantuan tidak dapat dimuat.");
        if (active) setEvents(result.data);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function createEvent(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setError("");
    setNotice("");
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          description: formData.get("description"),
          location: formData.get("location"),
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Jadwal bantuan tidak dapat dibuat.");
      setEvents((current) => [...current, result.data].sort(
        (left, right) => new Date(left.scheduledAt) - new Date(right.scheduledAt),
      ));
      setNotice("Jadwal berhasil dibuat dan dikirim sebagai notifikasi kepada warga di wilayah cabang Anda.");
      form.reset();
      setScheduledAt("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="h-fit rounded-[17px] border border-[#eae8f0] bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f3f6d8] text-[#111111]"><CalendarDays size={19} /></span>
          <div><h2 className="text-[14px] font-bold">Buat jadwal pengambilan</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Notifikasi hanya diterima akun warga yang terdaftar di wilayah cabang Anda dan wilayah di bawahnya.</p></div>
        </div>
        <form className="mt-5 grid gap-4" onSubmit={createEvent}>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#555366]">
            Nama kegiatan
            <input name="title" required minLength={3} maxLength={160} className="form-control" placeholder="Contoh: Pengambilan bantuan sembako" />
          </label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#555366]">
            Tanggal dan waktu
            <input type="datetime-local" required value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="form-control" />
          </label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#555366]">
            Lokasi pengambilan
            <input name="location" required minLength={3} maxLength={255} className="form-control" placeholder="Nama lokasi dan alamat" />
          </label>
          <label className="grid gap-1.5 text-[10px] font-semibold text-[#555366]">
            Keterangan untuk warga
            <textarea name="description" maxLength={2000} rows={4} className="form-control resize-y" placeholder="Informasi yang perlu disiapkan atau dibawa warga" />
          </label>
          {error && <p role="alert" className="rounded-lg bg-[#fff3f3] p-3 text-[10px] leading-5 text-[#a93434]">{error}</p>}
          {notice && <p role="status" className="rounded-lg bg-[#eff8f3] p-3 text-[10px] leading-5 text-[#218755]">{notice}</p>}
          <button type="submit" disabled={saving || !scheduledAt} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white transition hover:bg-[#000000] disabled:opacity-50">
            {saving ? <Clock3 size={14} className="animate-pulse" /> : <Send size={14} />}
            {saving ? "Menyimpan jadwalâ€¦" : "Buat jadwal & kirim notifikasi"}
          </button>
        </form>
      </section>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#111111]">Informasi warga</p><h2 className="mt-1 text-[17px] font-bold">Jadwal yang sudah dibuat</h2></div>
          <span className="rounded-full bg-[#f3f6d8] px-2.5 py-1 text-[9px] font-semibold text-[#788900]">{events.length} jadwal</span>
        </div>
        {loading && <p className="mt-4 rounded-xl border border-[#eae8f0] bg-white p-5 text-center text-[10px] text-[#77778a]">Memuat jadwalâ€¦</p>}
        {!loading && !events.length && <p className="mt-4 rounded-xl border border-dashed border-[#dcd8e7] bg-white p-6 text-center text-[10px] text-[#77778a]">Belum ada jadwal bantuan untuk wilayah ini.</p>}
        <div className="mt-4 grid gap-3">
          {events.map((item) => (
            <article key={item.id} className="rounded-[15px] border border-[#eae8f0] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-[12px] font-bold text-[#302d45]">{item.title}</p><p className="mt-1 text-[9px] font-medium text-[#111111]">{item.regionName}</p></div>
                <span className="rounded-full bg-[#eff8f3] px-2.5 py-1 text-[9px] font-semibold text-[#218755]">Notifikasi aktif</span>
              </div>
              <div className="mt-3 grid gap-2 text-[10px] text-[#626073] sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><CalendarDays size={13} className="shrink-0 text-[#111111]" />{dateTime(item.scheduledAt)}</p>
                <p className="inline-flex items-center gap-2"><MapPin size={13} className="shrink-0 text-[#111111]" />{item.location}</p>
              </div>
              {item.description && <p className="mt-3 whitespace-pre-wrap border-t border-[#f0eef4] pt-3 text-[10px] leading-5 text-[#77778a]">{item.description}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
