
## Cara menjalankan

Pastikan Node.js versi 22.12 atau lebih baru sudah terpasang. Dari folder
proyek, jalankan:

```bash
npm i
npm run dev
```



Akun

- **Admin:** username `Admin`, password `Admin`.
- **Penghuni:** pilih **Daftar Akun Baru** pada halaman login.

Data contoh berisi penghuni Budi Santoso di kamar 102. Untuk menghubungkan akun
penghuni ke data tersebut, ajukan penautan memakai nomor HP yang terdaftar,
`08123456789`. Admin perlu menyetujui permintaan di menu **Data penghuni**.

## Fitur admin

- **Ringkasan:** melihat jumlah kamar terisi, penghuni aktif, laporan terbuka,
  dan saldo bersih.
- **Manajemen kamar:** menambah, mengubah, dan menghapus kamar. Nomor kamar
  harus unik; kamar yang masih dihuni tidak bisa dihapus.
- **Data penghuni:** menambah dan mengubah data penghuni, mengatur kamar,
  melakukan checkout, serta menghapus data penghuni yang sudah keluar.
- **Penautan akun:** memeriksa dan menyetujui atau menolak permintaan penghuni
  untuk menghubungkan akun ke data kamar.
- **Keuangan:** mencatat pemasukan atau pengeluaran, membuat tagihan untuk
  penghuni aktif pada bulan berjalan, dan memverifikasi konfirmasi pembayaran.
  Data transaksi dan tagihan bisa dicari serta difilter berdasarkan periode.
- **Laporan penghuni:** melihat laporan keluhan, memperbarui status dari
  `Pending` ke `Proses` lalu `Selesai`, atau menghapus laporan.

## Fitur penghuni

- **Dashboard:** melihat kamar dan status penghuni, tagihan yang belum dibayar,
  serta laporan yang belum selesai.
- **Tagihan saya:** memeriksa jumlah dan jatuh tempo tagihan, lalu mengirim
  konfirmasi pembayaran dengan memilih metode pembayaran.
- **Lapor keluhan:** mengirim dan melihat laporan untuk kamar yang terhubung,
  serta membatalkan laporan.
- **Profil saya:** melihat status penautan kamar, mengajukan atau membatalkan
  permintaan penautan, dan mengganti password akun.

## Catatan

Data disimpan di `localStorage` browser, bukan di server. Menghapus data
atau memakai browser lain tidak akan membawa data yang sama. Password  juga
disimpan di browser