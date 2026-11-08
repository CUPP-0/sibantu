"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, HeartHandshake, MapPinned, Users, WalletCards } from "lucide-react";

const cards = [
  { key: "beneficiaries", label: "Penerima terdata", Icon: Users, suffix: "" },
  { key: "activePrograms", label: "Program aktif", Icon: HeartHandshake, suffix: "" },
  { key: "distributed", label: "Bantuan tersalurkan", Icon: WalletCards, suffix: "" },
  { key: "regions", label: "Wilayah terjangkau", Icon: MapPinned, suffix: "" },
];

function formatValue(value, key) {
  if (typeof value !== "number") return "—";
  if (key === "distributed") return new Intl.NumberFormat("id-ID").format(value);
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function PublicMetrics() {
  const [stats, setStats] = useState(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    fetch("/api/public/statistics")
      .then(async (response) => {
        if (!response.ok) throw new Error("Statistik belum tersedia.");
        const result = await response.json();
        setStats(result.data);
      })
      .catch(() => setAvailable(false));
  }, []);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#898799]">Dampak yang terukur</p>
          <p className="mt-1 text-[13px] text-[#77778a]">Angka agregat dari data penyaluran.</p>
        </div>
        <ArrowUpRight size={18} className="text-[#6d4aff]" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(({ key, label, Icon }) => (
          <div key={key} className="rounded-[14px] border border-[#efedf4] bg-white p-3.5">
            <span className="flex size-8 items-center justify-center rounded-[10px] bg-[#f3f0ff] text-[#6d4aff]"><Icon size={16} /></span>
            <p className="mt-3 text-[19px] font-bold tracking-[-0.04em] text-[#242336]">{stats ? formatValue(stats[key], key) : "—"}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-[#828092]">{label}</p>
          </div>
        ))}
      </div>
      {!available && <p className="mt-3 text-[10px] leading-4 text-[#898799]">Statistik akan tampil setelah koneksi MySQL tersedia.</p>}
      {stats?.updatedAt && <p className="mt-3 text-[10px] text-[#898799]">Diperbarui {new Date(stats.updatedAt).toLocaleDateString("id-ID")}</p>}
    </div>
  );
}
