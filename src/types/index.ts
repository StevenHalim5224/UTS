export type StatusKamar = 'Kosong' | 'Terisi';
export type TipeTransaksi = 'Pemasukan' | 'Pengeluaran';
export type PrioritasKeluhan = 'Rendah' | 'Sedang' | 'Tinggi';
export type StatusKeluhan = 'Pending' | 'Proses' | 'Selesai';

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
  nomorHp: string;
  tanggalMasuk: string;
  tanggalKeluar: string | null;
  kamarId: string;
  statusAktif: boolean;
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
  deskripsi: string;
  status: StatusKeluhan;
  tanggal: string;
}