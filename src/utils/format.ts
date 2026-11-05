/** Utilitas tampilan yang dipakai bersama oleh banyak halaman. */

const numberFormatter = new Intl.NumberFormat("id-ID");
const periodeFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});
const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Format angka menjadi "Rp 1.500.000" tanpa membuat formatter baru tiap render. */
export const rupiah = (value: number | null | undefined) =>
  `Rp ${numberFormatter.format(Number(value) || 0)}`;

/** Tanggal hari ini dalam format YYYY-MM-DD (zona waktu lokal). */
export const hariIni = () => {
  const now = new Date();
  const bulan = String(now.getMonth() + 1).padStart(2, "0");
  const tanggal = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${bulan}-${tanggal}`;
};

/** "2026-10" -> "Oktober 2026" */
export const labelPeriode = (periode: string) => {
  const [tahun, bulan] = (periode ?? "").split("-").map(Number);
  if (!tahun || !bulan || bulan < 1 || bulan > 12) return periode || "-";

  const date = new Date(tahun, bulan - 1, 1);
  if (Number.isNaN(date.getTime())) return periode || "-";
  return periodeFormatter.format(date);
};

/** "2026-10-15" -> "15 Okt 2026" (aman untuk data kosong/rusak). */
export const formatTanggal = (iso: string) => {
  const bagian = (iso ?? "").slice(0, 10).split("-").map(Number);
  if (bagian.length !== 3 || bagian.some((n) => Number.isNaN(n))) return "-";

  const [tahun, bulan, tanggal] = bagian;
  const date = new Date(tahun, bulan - 1, tanggal);
  if (Number.isNaN(date.getTime())) return "-";
  return tanggalFormatter.format(date);
};

/** Warna badge sesuai status keluhan. */
export const statusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "badge-danger";
    case "Proses":
      return "badge-warning";
    case "Selesai":
      return "badge-success";
    default:
      return "badge-neutral";
  }
};

/**
  Label + warna tagihan. Status "Terlambat" dihitung otomatis
  dari jatuh tempo yang sudah lewat.
 */
export const statusTagihan = (tagihan: {
  status: string;
  tanggalJatuhTempo: string;
}) => {
  if (tagihan.status === "Lunas") {
    return { label: "Lunas", color: "badge-success" };
  }
  if (tagihan.status === "Menunggu Verifikasi") {
    return {
      label: "Menunggu Verifikasi",
      color: "badge-warning",
    };
  }
  if (tagihan.tanggalJatuhTempo < hariIni()) {
    return { label: "Terlambat", color: "badge-danger" };
  }
  return { label: "Belum Dibayar", color: "badge-neutral" };
};
