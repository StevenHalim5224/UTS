import type { Kamar, Keluhan, Penghuni, Tagihan, Transaksi } from "../types";

export interface InitialData {
  kamar: Kamar[];
  penghuni: Penghuni[];
  tagihan: Tagihan[];
  transaksi: Transaksi[];
  keluhan: Keluhan[];
}

const initialData: InitialData = {
    kamar: [
        {id: "k-101", nomor: "101", tipe: "Standar", harga: 1000000, status: "Kosong"},
        {id: "k-102", nomor: "102", tipe: "VIP", harga: 1500000, status: "Terisi"},
        {id: "k-103", nomor: "103", tipe: "Standar", harga: 900000, status: "Kosong"},

    ],

    penghuni: [
        { id: "P-01", nama: "Budi Santoso", username: "08123456789", nomorHp: "08123456789", tanggalMasuk: "2026-10-01", tanggalKeluar: null, kamarId: "k-102", statusAktif: true }
    ],
    tagihan: [
        {id: "T-002", penghuniId: 'P-01', kamarId: 'k-102', periode: '2026-10', tanggalJatuhTempo: '2026-11-01', jumlah: 1500000, status: 'Belum Dibayar'},
        {id: "T-001", penghuniId: 'P-01', kamarId: 'k-102', periode: '2026-09', tanggalJatuhTempo: '2026-10-01', jumlah: 1500000, status: 'Lunas', tanggalBayar: '2026-09-02', metode: 'Transfer Bank'}
    ],
    transaksi: [
        {id: "TR-001", keterangan: "Pembayaran Sewa Sep 2026 - Budi Santoso", jumlah: 1500000, tipe: 'Pemasukan', tanggal: '2026-09-02'}
    ],
    keluhan: [],

}

export default initialData;
