/**
 * Satu daftar tipe kamar untuk form, data awal, dan label.
 * Tambah tipe baru di sini supaya halaman admin tidak menawarkan istilah berbeda.
 */
export const TIPE_KAMAR = [
  "Standar",
  "AC",
  "AC + KM Dalam",
  "VIP",
] as const;

export type TipeKamar = (typeof TIPE_KAMAR)[number];
