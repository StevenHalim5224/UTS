import type { Kamar } from "../types";
import { TIPE_KAMAR } from "../constants/kamar";

/** Buang semua karakter selain angka dari nomor HP. */
export const hanyaAngka = (value: string) => value.replace(/\D/g, "");

/** Pesan kesalahan nomor HP, atau null kalau valid. */
export const validasiNomorHp = (value: string): string | null => {
  const hp = hanyaAngka(value);
  if (hp.length < 10 || hp.length > 13) {
    return "Nomor HP harus 10 sampai 13 digit angka.";
  }
  return null;
};

interface DataKamar {
  nomor: string;
  tipe: string;
  harga: number;
}

/** Validasi kamar baru/edit: nomor unik, tipe dikenal, harga masuk akal. */
export const validasiKamar = (
  data: DataKamar,
  daftarKamar: Kamar[],
  idKamar?: string,
): string | null => {
  const nomor = data.nomor.trim();
  if (!nomor) return "Nomor kamar wajib diisi.";

  const nomorDipakai = daftarKamar.some(
    (k) => k.id !== idKamar && k.nomor.toLowerCase() === nomor.toLowerCase(),
  );
  if (nomorDipakai) return `Kamar ${nomor} sudah ada. Gunakan nomor lain.`;

  const tipe = data.tipe.trim();
  if (!tipe) return "Tipe kamar wajib dipilih.";

  const tipeDikenal = TIPE_KAMAR.some((tipeKamar) => tipeKamar === tipe);
  const mempertahankanTipeLama =
    idKamar !== undefined &&
    daftarKamar.some((k) => k.id === idKamar && k.tipe.trim() === tipe);
  if (!tipeDikenal && !mempertahankanTipeLama) {
    return "Tipe kamar tidak dikenal. Pilih tipe yang tersedia.";
  }

  if (!Number.isFinite(data.harga) || data.harga <= 0) {
    return "Harga sewa harus lebih dari 0.";
  }

  return null;
};
