# SmartKos Admin — versi tanpa backend

Tampilan admin mengikuti SmartKos Business: sidebar putih, aksen hijau, latar sage, kartu statistik, tabel dan form yang konsisten. Ikon memakai Lucide SVG. Tombol **Logout** memiliki label teks pada desktop maupun layar kecil.

## Menjalankan

Gunakan Node.js 22.12+ atau versi lebih baru yang didukung Vite.

```bash
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite. Akun awal untuk penyimpanan browser yang masih baru:

- Username: `Admin`
- Password: `Admin`

## Fitur

Ringkasan operasional, tambah/edit kamar, penghuni dan checkout, transaksi pemasukan/pengeluaran, serta laporan keluhan. Saldo bersih hijau, pemasukan biru, pengeluaran merah.

Data menggunakan localStorage (`smartkos_data`, `users`, `currentUser`) di browser yang dipakai. Versi ini tidak memerlukan MySQL, Express, atau file .env. Akun dan data lokal bukan sistem akses server untuk pelanggan nyata. Proyek backend SmartKos Business merupakan proyek terpisah.

## Pemeriksaan dan build

```bash
npm run lint
npm run build
npm run preview
```

Folder dist disertakan untuk menyesuaikan struktur repositori sebelumnya. Login dan data operasional tetap memakai implementasi lokal yang sudah ada; perubahan desain tidak menghapus data browser.
