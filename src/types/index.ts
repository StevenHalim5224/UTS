export type StatusKamar = "Kosong" | "Terisi";
export type TipeTransaksi = "Pemasukan" | "Pengeluaran";
export type PrioritasKeluhan = "Rendah" | "Sedang" | "Tinggi";
export type StatusKeluhan = "Pending" | "Proses" | "Selesai";
export type RoleUser = "admin" | "penghuni";
export type StatusTagihan = "Belum Dibayar" | "Menunggu Verifikasi" | "Lunas";
export type StatusKlaim = "Menunggu" | "Disetujui" | "Ditolak";

export interface Kamar {
  id: string;
  nomor: string;
  tipe: string;
  harga: number;
  status: StatusKamar;
}

export interface Penghuni {
  id: string;
  nama: string;
  /** Username akun login milik penghuni (opsional untuk data lama). */
  username?: string;
  nomorHp: string;
  tanggalMasuk: string;
  tanggalKeluar: string | null;
  kamarId: string;
  statusAktif: boolean;
}

/** Permintaan penautan nomor HP ke data penghuni; harus disetujui admin. */
export interface KlaimKamar {
  nomorHp: string;
  status: StatusKlaim;
  /** Format YYYY-MM-DD */
  diajukanPada: string;
  /** Format YYYY-MM-DD */
  diputuskanPada?: string;
  catatan?: string;
}

export interface User {
  id: string;
  nama: string;
  username: string;
  password: string;
  role: RoleUser;
  /** Menghubungkan akun login dengan data penghuni (kamar & tagihan). */
  penghuniId?: string;
  klaim?: KlaimKamar;
}

export interface Tagihan {
  id: string;
  penghuniId: string;
  kamarId: string;
  /** Format YYYY-MM */
  periode: string;
  tanggalJatuhTempo: string;
  jumlah: number;
  status: StatusTagihan;
  tanggalBayar?: string | null;
  metode?: string;
  catatan?: string;
}

export interface Transaksi {
  id: string;
  keterangan: string;
  jumlah: number;
  tipe: TipeTransaksi;
  tanggal: string;
}

export interface Keluhan {
  id: string;
  kamarId: string;
  kategori: string;
  deskripsi: string;
  status: StatusKeluhan;
  tanggal: string;
}
