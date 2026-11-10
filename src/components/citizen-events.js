"use client";

import { useEffect, useState } from "react";
import { BellRing, CalendarDays, MapPin } from "lucide-react";

const dateTime = (value) => new Date(value).toLocaleString("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export default function CitizenEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/citizen/events")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Notifikasi jadwal bantuan tidak dapat dimuat.");
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

  return (
    <section className="mt-7 rounded-[17px] border border-[#eae8f0] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-[#f3f6d8] text-[#111111]"><BellRing size={18} /></span>
        <div><h2 className="text-[14px] font-bold">Notifikasi jadwal bantuan</h2><p className="mt-1 text-[10px] leading-5 text-[#77778a]">Pengumuman pengambilan bantuan dari admin cabang untuk wilayah Anda.</p></div>
      </div>
      {loading && <p className="mt-4 rounded-xl bg-[#f8f8f5] p-4 text-[10px] text-[#77778a]">Memuat notifikasiâ€¦</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] leading-5 text-[#a93434]">{error}</p>}
      {!loading && !error && !events.length && <p className="mt-4 rounded-xl bg-[#f8f8f5] p-4 text-[10px] leading-5 text-[#77778a]">Belum ada jadwal pengambilan bantuan untuk wilayah Anda.</p>}
      {!error && events.length > 0 && (
        <div className="mt-4 grid gap-3">
          {events.map((item) => (
            <article key={item.id} className="rounded-xl border border-[#eeeaf7] bg-[#fdfcff] p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-[12px] font-bold text-[#302d45]">{item.title}</h3>
                <span className="rounded-full bg-[#f3f6d8] px-2.5 py-1 text-[9px] font-semibold text-[#788900]">{item.regionName}</span>
              </div>
              <div className="mt-3 grid gap-2 text-[10px] text-[#626073] sm:grid-cols-2">
                <p className="inline-flex items-center gap-2"><CalendarDays size={13} className="shrink-0 text-[#111111]" />{dateTime(item.scheduledAt)}</p>
                <p className="inline-flex items-center gap-2"><MapPin size={13} className="shrink-0 text-[#111111]" />{item.location}</p>
              </div>
              {item.description && <p className="mt-3 whitespace-pre-wrap border-t border-[#f0eef4] pt-3 text-[10px] leading-5 text-[#77778a]">{item.description}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
