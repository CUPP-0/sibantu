"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CircleCheck, ScanLine } from "lucide-react";

export default function QrDistributionScanner() {
  const scannerRef = useRef(null);
  const mountedRef = useRef(true);
  const verifyingRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const [verified, setVerified] = useState(null);
  const [completed, setCompleted] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      const scanner = scannerRef.current;
      if (scanner?.isScanning) scanner.stop().catch(() => {});
    };
  }, []);

  async function stopCamera() {
    const scanner = scannerRef.current;
    if (scanner?.isScanning) {
      try {
        await scanner.stop();
      } catch {
        if (mountedRef.current) setError("Kamera tidak dapat dihentikan dengan benar. Tutup izin kamera lalu muat ulang halaman.");
      }
    }
    if (mountedRef.current) setCameraActive(false);
  }

  async function verifyToken(token) {
    if (verifyingRef.current) return;
    verifyingRef.current = true;
    setBusy(true);
    setError("");
    setVerified(null);
    setCompleted(null);
    await stopCamera();
    try {
      const response = await fetch("/api/admin/claims/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "QR tidak dapat diverifikasi.");
      setVerified({ ...result.data, token });
      setManualToken("");
    } catch (cause) {
      setError(cause.message);
    } finally {
      verifyingRef.current = false;
      setBusy(false);
    }
  }

  async function startCamera() {
    setError("");
    setVerified(null);
    setCompleted(null);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("distribution-qr-reader", { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => verifyToken(decodedText),
        () => {},
      );
      if (mountedRef.current) setCameraActive(true);
    } catch (cause) {
      if (mountedRef.current) {
        setCameraActive(false);
        setError(cause?.name === "NotAllowedError"
          ? "Izin kamera ditolak. Aktifkan izin kamera pada browser untuk situs ini."
          : cause?.message || "Kamera tidak tersedia. Periksa izin kamera atau gunakan input QR manual.");
      }
    }
  }

  async function confirmDistribution() {
    if (!verified || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/claims/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verified.token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Penyaluran tidak dapat dikonfirmasi.");
      setCompleted(result.data);
      setVerified(null);
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#111111]">Konfirmasi pengambilan</p><h1 className="mt-2 text-[26px] font-bold tracking-[-0.05em]">Pindai QR profil warga.</h1><p className="mt-2 max-w-[700px] text-[11px] leading-5 text-[#77778a]">Minta warga membuka QR program bantuan di halaman Profil saya. Setelah nama dan program cocok, konfirmasi pengambilan untuk mencatat tanggal dan jam.</p></div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_0.85fr]">
        <section className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-[11px] bg-[#f3f6d8] text-[#111111]"><ScanLine size={17} /></span><div><h2 className="text-[13px] font-bold">Pemindai kamera</h2><p className="mt-1 text-[10px] text-[#9290a0]">Gunakan HTTPS atau localhost dan izinkan akses kamera.</p></div></div>
          <div id="distribution-qr-reader" className="mt-4 min-h-[150px] overflow-hidden rounded-[14px] border border-dashed border-[#d8d3e5] bg-[#f8f8f5] p-2" />
          <div className="mt-3 flex flex-wrap gap-2">
            {!cameraActive ? <button type="button" onClick={startCamera} disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111111] px-4 text-[11px] font-semibold text-white hover:bg-[#000000] disabled:opacity-50"><Camera size={15} /> Aktifkan kamera</button> : <button type="button" onClick={stopCamera} className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#eae8f0] px-4 text-[11px] font-semibold text-[#555366]"><CameraOff size={15} /> Hentikan kamera</button>}
          </div>
          <form onSubmit={(event) => { event.preventDefault(); verifyToken(manualToken); }} className="mt-5 border-t border-[#f0eef4] pt-4">
            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4f4d60]">Input token QR manual jika kamera tidak tersedia<input value={manualToken} onChange={(event) => setManualToken(event.target.value)} maxLength={256} className="form-control mt-1 font-mono text-[11px] font-normal" placeholder="Tempel token dari profil warga" /></label>
            <button disabled={busy || manualToken.trim().length < 64} className="mt-3 h-9 rounded-xl border border-[#eae8f0] px-4 text-[10px] font-semibold text-[#555366] disabled:opacity-50">{busy ? "Memeriksaâ€¦" : "Verifikasi token"}</button>
          </form>
          {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff3f3] p-3 text-[10px] leading-5 text-[#a93434]">{error}</p>}
        </section>
        <section className="rounded-[17px] border border-[#eae8f0] bg-white p-5">
          <h2 className="text-[13px] font-bold">Konfirmasi penerimaan</h2>
          <p className="mt-1 text-[10px] leading-5 text-[#9290a0]">Periksa nama dan program sebelum mencatat bantuan sudah diambil. Konfirmasi QR tidak dapat dilakukan dua kali sebelum admin mereset status.</p>
          {verified && <div className="mt-4 rounded-[14px] bg-[#f8f8f5] p-4">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#9290a0]">Penerima terverifikasi</p>
            <h3 className="mt-2 text-[15px] font-bold">{verified.beneficiaryName}</h3>
            <dl className="mt-3 grid gap-3 text-[10px] sm:grid-cols-2"><div><dt className="text-[#9290a0]">Program</dt><dd className="mt-1 font-semibold">{verified.programName}</dd></div><div><dt className="text-[#9290a0]">Wilayah</dt><dd className="mt-1 font-semibold">{verified.regionName}</dd></div><div><dt className="text-[#9290a0]">Nilai bantuan</dt><dd className="mt-1 font-semibold">{verified.amount === null ? "Sesuai ketentuan" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(verified.amount)}</dd></div></dl>
            <button type="button" onClick={confirmDistribution} disabled={busy} className="mt-4 h-10 w-full rounded-xl bg-[#218755] text-[11px] font-semibold text-white hover:bg-[#176d42] disabled:opacity-50">{busy ? "Menyimpan penyaluranâ€¦" : "Konfirmasi bantuan diterima"}</button>
          </div>}
          {completed && <div role="status" className="mt-4 rounded-[14px] border border-[#bfe7d2] bg-[#eff8f3] p-4"><div className="flex items-center gap-2 text-[12px] font-bold text-[#218755]"><CircleCheck size={17} /> Pengambilan berhasil dicatat</div><p className="mt-2 text-[10px] text-[#456b56]">{completed.beneficiaryName} Â· {completed.programName}</p><p className="mt-2 text-[10px] text-[#456b56]">Waktu: {new Date(completed.claimedAt).toLocaleString("id-ID")}</p><p className="mt-2 break-all font-mono text-[9px] text-[#456b56]">Referensi: {completed.referenceNumber}</p></div>}
          {!verified && !completed && <div className="mt-4 rounded-[14px] border border-dashed border-[#e1deea] p-6 text-center text-[10px] leading-5 text-[#9290a0]">Hasil verifikasi penerima akan tampil di sini setelah QR dipindai.</div>}
          <p className="mt-4 text-[9px] leading-4 text-[#9290a0]">Token QR acak tidak memuat NIK. Verifikasi dibatasi ke wilayah kerja akun admin cabang dan dicatat ke riwayat audit.</p>
        </section>
      </div>
    </div>
  );
}
