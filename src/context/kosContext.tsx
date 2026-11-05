import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import initialData from "../data/dummyData";
import type {
  Kamar,
  Keluhan,
  KlaimKamar,
  Penghuni,
  StatusKeluhan,
  Tagihan,
  Transaksi,
  User,
} from "../types";
import { hariIni, labelPeriode } from "../utils/format";
import { hanyaAngka, validasiKamar, validasiNomorHp } from "../utils/validasi";

interface KosData {
  kamar: Kamar[];
  penghuni: Penghuni[];
  tagihan: Tagihan[];
  transaksi: Transaksi[];
  keluhan: Keluhan[];
}

interface HasilAksi {
  success: boolean;
  message: string;
}

export interface InputPenghuni {
  nama: string;
  nomorHp: string;
  kamarId: string;
  tanggalMasuk?: string;
}

export interface InputKamar {
  nomor: string;
  tipe: string;
  harga: number;
}

/** Baris panel persetujuan klaim di halaman Data Penghuni. */
export interface PermintaanKlaim {
  userId: string;
  nama: string;
  username: string;
  nomorHp: string;
  diajukanPada: string;
  penghuniNama: string | null;
  nomorKamar: string | null;
  statusPenghuni: "Aktif" | "Tidak aktif" | "Tidak ditemukan";
  sudahDipakai: boolean;
}

interface kosContextType {
  kamar: Kamar[];
  penghuni: Penghuni[];
  tagihan: Tagihan[];
  transaksi: Transaksi[];
  keluhan: Keluhan[];
  currentUser: User | null;
  permintaanKlaim: PermintaanKlaim[];

  /** Data penghuni milik akun yang sedang login. */
  penghuniSaya: Penghuni | null;
  kamarSaya: Kamar | null;
  tagihanSaya: Tagihan[];

  login: (username: string, password: string) => boolean;
  logout: () => void;
  register: (
    nama: string,
    username: string,
    password: string,
    nomorHp?: string,
  ) => HasilAksi;
  tautkanAkun: (nomorHp: string) => HasilAksi;
  batalkanKlaim: () => HasilAksi;
  setujuiKlaim: (
    userId: string,
    setujui: boolean,
    catatan?: string,
  ) => HasilAksi;
  gantiPassword: (lama: string, baru: string) => HasilAksi;

  tambahPenghuni: (penghuniBaru: InputPenghuni) => HasilAksi;
  editPenghuni: (id: string, dataBaru: InputPenghuni) => HasilAksi;
  keluarPenghuni: (penghuniId: string) => HasilAksi;
  hapusDataPenghuniLama: (id: string) => HasilAksi;

  tambahTransaksi: (
    transaksiBaru: Omit<Transaksi, "id" | "tanggal">,
  ) => HasilAksi;
  ubahStatusKeluhan: (id: string) => HasilAksi;
  tambahKeluhan: (
    keluhanBaru: Omit<Keluhan, "id" | "status" | "tanggal">,
  ) => HasilAksi;
  hapusKeluhan: (id: string) => HasilAksi;

  tambahKamar: (kamarBaru: InputKamar) => HasilAksi;
  editKamar: (id: string, dataBaru: InputKamar) => HasilAksi;
  hapusKamar: (id: string) => HasilAksi;

  bayarTagihan: (id: string, metode: string, catatan?: string) => HasilAksi;
  verifikasiTagihan: (id: string, setujui: boolean) => HasilAksi;
  buatTagihanBulanIni: () => {
    dibuat: number;
    dilewati: number;
    periode: string;
  };
}

const KosContext = createContext<kosContextType | undefined>(undefined);
const STORAGE_KEY = "smartkos_data";
const USERS_KEY = "users";
const SESSION_KEY = "currentUser";

const ADMIN_DEFAULT: User = {
  id: "U-ADMIN",
  username: "Admin",
  password: "Admin",
  role: "admin",
  nama: "Administrator",
};

/** Salinan bersih data awal, supaya state tidak ikut berubah saat dummyData diedit. */
const cloneInitialData = (): KosData =>
  JSON.parse(JSON.stringify(initialData)) as KosData;

/** localStorage bisa berisi JSON rusak / diblokir browser — jangan sampai app crash. */
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed === null ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Kuota penuh / mode privat: data di memori tetap jalan.
  }
}

/** Pastikan data lama yang tersimpan tetap punya semua koleksi yang dibutuhkan. */
function normalizeData(value: Partial<KosData> | null): KosData {
  const kosong = cloneInitialData();
  if (!value) return kosong;
  return {
    kamar: Array.isArray(value.kamar) ? value.kamar : kosong.kamar,
    penghuni: Array.isArray(value.penghuni)
      ? value.penghuni
      : kosong.penghuni,
    tagihan: Array.isArray(value.tagihan) ? value.tagihan : kosong.tagihan,
    transaksi: Array.isArray(value.transaksi)
      ? value.transaksi
      : kosong.transaksi,
    keluhan: Array.isArray(value.keluhan) ? value.keluhan : kosong.keluhan,
  };
}

/**
 * Admin adalah akun tetap: kredensialnya dikembalikan ke nilai awal setiap
 * sesi supaya password yang pernah diubah versi lama tidak mengunci aplikasi.
 */
function normalizeUsers(value: unknown): User[] {
  const daftar = Array.isArray(value)
    ? (value.filter(
        (item): item is User =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as User).id === "string",
      ) as User[])
    : [];

  const adaAdmin = daftar.some((user) => user.role === "admin");
  const lengkap = adaAdmin ? daftar : [ADMIN_DEFAULT, ...daftar];

  return lengkap.map((user) =>
    user.role === "admin"
      ? {
          ...user,
          username: ADMIN_DEFAULT.username,
          password: ADMIN_DEFAULT.password,
          nama: ADMIN_DEFAULT.nama,
        }
      : user,
  );
}

/** Sesi lama menyimpan objek user; sesi baru menyimpan id saja. */
function bacaSesiId(): string | null {
  const tersimpan = readStorage<unknown>(SESSION_KEY, null);
  if (typeof tersimpan === "string" && tersimpan) return tersimpan;
  if (tersimpan && typeof tersimpan === "object") {
    const id = (tersimpan as { id?: unknown }).id;
    if (typeof id === "string" && id) return id;
  }
  return null;
}

const periodeSekarang = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** ID unik walau dua aksi terjadi pada milidetik yang sama. */
const buatId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const KosProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<KosData>(() => {
    const saved = readStorage<Partial<KosData> | null>(STORAGE_KEY, null);
    return saved ? normalizeData(saved) : cloneInitialData();
  });

  const [users, setUsers] = useState<User[]>(() =>
    normalizeUsers(readStorage<unknown>(USERS_KEY, [])),
  );

  const [sessionId, setSessionId] = useState<string | null>(bacaSesiId);

  /** Sumber kebenaran sesi adalah daftar user, bukan salinan objek yang bisa basi. */
  const currentUser = useMemo<User | null>(
    () => (sessionId ? (users.find((u) => u.id === sessionId) ?? null) : null),
    [sessionId, users],
  );

  useEffect(() => {
    writeStorage(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    writeStorage(USERS_KEY, users);
  }, [users]);

  useEffect(() => {
    writeStorage(SESSION_KEY, sessionId);
  }, [sessionId]);

  const penghuniSaya = useMemo<Penghuni | null>(() => {
    if (
      !currentUser ||
      currentUser.role !== "penghuni" ||
      !currentUser.penghuniId
    ) {
      return null;
    }
    return data.penghuni.find((p) => p.id === currentUser.penghuniId) ?? null;
  }, [currentUser, data.penghuni]);

  const kamarSaya = useMemo<Kamar | null>(
    () =>
      penghuniSaya && penghuniSaya.statusAktif
        ? (data.kamar.find((k) => k.id === penghuniSaya.kamarId) ?? null)
        : null,
    [penghuniSaya, data.kamar],
  );

  const tagihanSaya = useMemo<Tagihan[]>(() => {
    if (!penghuniSaya) return [];
    return data.tagihan
      .filter((t) => t.penghuniId === penghuniSaya.id)
      .sort((a, b) => b.periode.localeCompare(a.periode));
  }, [penghuniSaya, data.tagihan]);

  const permintaanKlaim = useMemo<PermintaanKlaim[]>(() => {
    if (!currentUser || currentUser.role !== "admin") return [];

    return users
      .filter((user) => user.klaim?.status === "Menunggu")
      .map((user) => {
        const klaim = user.klaim as KlaimKamar;
        const target = data.penghuni.find(
          (p) => p.nomorHp === klaim.nomorHp,
        );
        const kamar = target
          ? data.kamar.find((k) => k.id === target.kamarId)
          : undefined;

        return {
          userId: user.id,
          nama: user.nama,
          username: user.username,
          nomorHp: klaim.nomorHp,
          diajukanPada: klaim.diajukanPada,
          penghuniNama: target?.nama ?? null,
          nomorKamar: kamar?.nomor ?? null,
          statusPenghuni: target
            ? target.statusAktif
              ? "Aktif"
              : "Tidak aktif"
            : "Tidak ditemukan",
          sudahDipakai:
            Boolean(target) &&
            users.some(
              (lain) => lain.id !== user.id && lain.penghuniId === target?.id,
            ),
        };
      });
  }, [currentUser, users, data.penghuni, data.kamar]);

  const login = useCallback(
    (username: string, password: string) => {
      const user = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password,
      );
      if (!user) return false;
      setSessionId(user.id);
      return true;
    },
    [users],
  );

  const logout = useCallback(() => setSessionId(null), []);

  const register = useCallback(
    (nama: string, username: string, password: string, nomorHp?: string) => {
      const namaBersih = nama.trim();
      const uname = username.trim();
      const hp = hanyaAngka(nomorHp ?? "");

      if (namaBersih.length < 2) {
        return { success: false, message: "Nama minimal 2 karakter." };
      }
      if (uname.length < 3) {
        return { success: false, message: "Username minimal 3 karakter." };
      }
      if (password.length < 6) {
        return { success: false, message: "Password minimal 6 karakter." };
      }
      if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
        return { success: false, message: "Username sudah terdaftar." };
      }
      if (hp) {
        const galatHp = validasiNomorHp(hp);
        if (galatHp) return { success: false, message: galatHp };

        const penghuniHp = data.penghuni.find((p) => p.nomorHp === hp);
        const sudahTerhubung =
          penghuniHp &&
          users.some((u) => u.penghuniId === penghuniHp.id);
        if (sudahTerhubung) {
          return {
            success: false,
            message: "Nomor HP ini sudah terhubung ke akun lain.",
          };
        }

        const klaimLain = users.some(
          (u) =>
            u.klaim?.status === "Menunggu" && u.klaim.nomorHp === hp,
        );
        if (klaimLain) {
          return {
            success: false,
            message:
              "Nomor HP ini sedang menunggu verifikasi admin. Hubungi admin kos.",
          };
        }
      }

      const newUser: User = {
        id: buatId("U"),
        nama: namaBersih,
        username: uname,
        password,
        role: "penghuni",
        klaim: hp
          ? {
              nomorHp: hp,
              status: "Menunggu",
              diajukanPada: hariIni(),
            }
          : undefined,
      };

      setUsers((prev) => [...prev, newUser]);

      return {
        success: true,
        message: hp
          ? "Registrasi berhasil. Permintaan penautan nomor HP dikirim ke admin untuk disetujui."
          : "Registrasi berhasil. Silakan login.",
      };
    },
    [users, data.penghuni],
  );

  const tautkanAkun = useCallback(
    (nomorHp: string): HasilAksi => {
      if (!currentUser) {
        return { success: false, message: "Sesi login tidak ditemukan." };
      }
      if (currentUser.role !== "penghuni") {
        return {
          success: false,
          message: "Hanya akun penghuni yang bisa dihubungkan ke data kamar.",
        };
      }
      if (currentUser.penghuniId) {
        return {
          success: false,
          message: "Akun Anda sudah terhubung ke data penghuni.",
        };
      }

      const hp = hanyaAngka(nomorHp);
      const galatHp = validasiNomorHp(hp);
      if (galatHp) return { success: false, message: galatHp };

      if (currentUser.klaim?.status === "Menunggu") {
        return {
          success: false,
          message: "Permintaan sebelumnya masih menunggu persetujuan admin.",
        };
      }

      const penghuniHp = data.penghuni.find((p) => p.nomorHp === hp);
      if (
        penghuniHp &&
        users.some((u) => u.penghuniId === penghuniHp.id)
      ) {
        return {
          success: false,
          message: "Nomor HP ini sudah terhubung ke akun lain.",
        };
      }

      const klaim: KlaimKamar = {
        nomorHp: hp,
        status: "Menunggu",
        diajukanPada: hariIni(),
      };
      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, klaim } : u)),
      );

      return {
        success: true,
        message:
          "Permintaan penautan dikirim. Admin akan memeriksa dan menyetujuinya.",
      };
    },
    [currentUser, data.penghuni, users],
  );

  const batalkanKlaim = useCallback((): HasilAksi => {
    if (!currentUser || currentUser.role !== "penghuni") {
      return { success: false, message: "Sesi penghuni tidak ditemukan." };
    }
    if (currentUser.klaim?.status !== "Menunggu") {
      return { success: false, message: "Tidak ada permintaan yang aktif." };
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id ? { ...u, klaim: undefined } : u,
      ),
    );
    return { success: true, message: "Permintaan penautan dibatalkan." };
  }, [currentUser]);

  const setujuiKlaim = useCallback(
    (userId: string, setujui: boolean, catatan?: string): HasilAksi => {
      if (!currentUser || currentUser.role !== "admin") {
        return {
          success: false,
          message: "Hanya admin yang dapat memutuskan klaim akun.",
        };
      }

      const user = users.find((u) => u.id === userId);
      if (!user?.klaim || user.klaim.status !== "Menunggu") {
        return {
          success: false,
          message: "Permintaan ini sudah diproses atau tidak ditemukan.",
        };
      }

      const catatanBersih = catatan?.trim() || undefined;

      if (!setujui) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  klaim: {
                    ...(u.klaim as KlaimKamar),
                    status: "Ditolak",
                    diputuskanPada: hariIni(),
                    catatan: catatanBersih,
                  },
                }
              : u,
          ),
        );
        return {
          success: true,
          message: `Permintaan ${user.nama} ditolak.`,
        };
      }

      const target = data.penghuni.find(
        (p) => p.nomorHp === user.klaim?.nomorHp,
      );
      if (!target) {
        return {
          success: false,
          message:
            "Belum ada data penghuni dengan nomor HP tersebut. Tambahkan penghuni dulu, lalu setujui klaimnya.",
        };
      }
      if (!target.statusAktif) {
        return {
          success: false,
          message: "Data penghuni dengan nomor HP tersebut sudah tidak aktif.",
        };
      }
      if (
        users.some((u) => u.id !== userId && u.penghuniId === target.id)
      ) {
        return {
          success: false,
          message: "Data penghuni ini sudah terhubung ke akun lain.",
        };
      }

      const nomorKamar = data.kamar.find((k) => k.id === target.kamarId)?.nomor;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                penghuniId: target.id,
                klaim: {
                  ...(u.klaim as KlaimKamar),
                  status: "Disetujui",
                  diputuskanPada: hariIni(),
                  catatan: catatanBersih,
                },
              }
            : u,
        ),
      );
      setData((prev) => ({
        ...prev,
        penghuni: prev.penghuni.map((p) =>
          p.id === target.id
            ? { ...p, username: p.username || user.username }
            : p,
        ),
      }));

      return {
        success: true,
        message: `Klaim ${user.nama} disetujui${
          nomorKamar ? ` untuk Kamar ${nomorKamar}` : ""
        }.`,
      };
    },
    [currentUser, users, data.penghuni, data.kamar],
  );

  const gantiPassword = useCallback(
    (lama: string, baru: string): HasilAksi => {
      if (!currentUser) {
        return { success: false, message: "Sesi login tidak ditemukan." };
      }
      if (currentUser.role === "admin") {
        return {
          success: false,
          message:
            "Password akun administrator bersifat tetap dan tidak dapat diubah.",
        };
      }
      if (currentUser.password !== lama) {
        return { success: false, message: "Password lama tidak sesuai." };
      }
      if (baru.length < 6) {
        return {
          success: false,
          message: "Password baru minimal 6 karakter.",
        };
      }
      if (lama === baru) {
        return {
          success: false,
          message: "Password baru harus berbeda dari password lama.",
        };
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === currentUser.id ? { ...u, password: baru } : u)),
      );
      return { success: true, message: "Password berhasil diubah." };
    },
    [currentUser],
  );

  const tambahPenghuni = useCallback(
    (penghuniBaru: InputPenghuni): HasilAksi => {
      const nama = penghuniBaru.nama.trim();
      const hp = hanyaAngka(penghuniBaru.nomorHp);

      if (nama.length < 2) {
        return { success: false, message: "Nama minimal 2 karakter." };
      }
      const galatHp = validasiNomorHp(hp);
      if (galatHp) return { success: false, message: galatHp };

      if (data.penghuni.some((p) => p.statusAktif && p.nomorHp === hp)) {
        return {
          success: false,
          message: "Nomor HP sudah dipakai penghuni aktif lain.",
        };
      }

      const kamar = data.kamar.find((k) => k.id === penghuniBaru.kamarId);
      if (!kamar) {
        return { success: false, message: "Kamar yang dipilih tidak ditemukan." };
      }
      if (kamar.status !== "Kosong") {
        return {
          success: false,
          message: `Kamar ${kamar.nomor} sudah terisi. Pilih kamar lain.`,
        };
      }
      if (
        data.penghuni.some((p) => p.statusAktif && p.kamarId === kamar.id)
      ) {
        return {
          success: false,
          message: `Kamar ${kamar.nomor} masih tercatat dihuni penghuni aktif.`,
        };
      }

      const payload: Penghuni = {
        id: buatId("P"),
        nama,
        username: hp,
        nomorHp: hp,
        kamarId: kamar.id,
        tanggalMasuk: penghuniBaru.tanggalMasuk || hariIni(),
        statusAktif: true,
        tanggalKeluar: null,
      };

      setData((prev) => ({
        ...prev,
        penghuni: [...prev.penghuni, payload],
        kamar: prev.kamar.map((k) =>
          k.id === kamar.id ? { ...k, status: "Terisi" } : k,
        ),
      }));

      return {
        success: true,
        message: `${nama} ditambahkan ke Kamar ${kamar.nomor}.`,
      };
    },
    [data.penghuni, data.kamar],
  );

  const editPenghuni = useCallback(
    (id: string, dataBaru: InputPenghuni): HasilAksi => {
      const target = data.penghuni.find((p) => p.id === id);
      if (!target) {
        return { success: false, message: "Data penghuni tidak ditemukan." };
      }
      if (!target.statusAktif) {
        return {
          success: false,
          message:
            "Penghuni yang sudah keluar tidak dapat diedit. Hapus datanya bila sudah tidak diperlukan.",
        };
      }

      const nama = dataBaru.nama.trim();
      const hp = hanyaAngka(dataBaru.nomorHp);
      if (nama.length < 2) {
        return { success: false, message: "Nama minimal 2 karakter." };
      }
      const galatHp = validasiNomorHp(hp);
      if (galatHp) return { success: false, message: galatHp };

      if (
        data.penghuni.some(
          (p) =>
            p.id !== id &&
            p.statusAktif &&
            p.nomorHp === hp,
        )
      ) {
        return {
          success: false,
          message: "Nomor HP sudah dipakai penghuni aktif lain.",
        };
      }

      const kamarBaru = data.kamar.find((k) => k.id === dataBaru.kamarId);
      if (!kamarBaru) {
        return { success: false, message: "Kamar yang dipilih tidak ditemukan." };
      }

      const pindah = kamarBaru.id !== target.kamarId;
      if (
        pindah &&
        (kamarBaru.status !== "Kosong" ||
          data.penghuni.some(
            (p) =>
              p.statusAktif && p.id !== id && p.kamarId === kamarBaru.id,
          ))
      ) {
        return {
          success: false,
          message: `Kamar ${kamarBaru.nomor} sudah terisi. Pilih kamar kosong.`,
        };
      }

      const updated: Penghuni = {
        ...target,
        nama,
        nomorHp: hp,
        kamarId: kamarBaru.id,
        username:
          target.username === target.nomorHp ? hp : target.username,
      };

      setData((prev) => ({
        ...prev,
        penghuni: prev.penghuni.map((p) => (p.id === id ? updated : p)),
        kamar: pindah
          ? prev.kamar.map((k) => {
              if (k.id === target.kamarId) {
                const masihDihuni = prev.penghuni.some(
                  (p) =>
                    p.statusAktif && p.id !== id && p.kamarId === target.kamarId,
                );
                return masihDihuni ? k : { ...k, status: "Kosong" };
              }
              if (k.id === kamarBaru.id) return { ...k, status: "Terisi" };
              return k;
            })
          : prev.kamar,
      }));

      return {
        success: true,
        message: pindah
          ? `${nama} dipindahkan ke Kamar ${kamarBaru.nomor}. Tagihan yang sudah terbit tidak berubah.`
          : `Data ${nama} diperbarui.`,
      };
    },
    [data.penghuni, data.kamar],
  );

  const keluarPenghuni = useCallback(
    (penghuniId: string): HasilAksi => {
      const target = data.penghuni.find((p) => p.id === penghuniId);
      if (!target) {
        return { success: false, message: "Data penghuni tidak ditemukan." };
      }
      if (!target.statusAktif) {
        return { success: false, message: "Penghuni ini sudah checkout." };
      }

      setData((prev) => ({
        ...prev,
        penghuni: prev.penghuni.map((p) =>
          p.id === penghuniId
            ? { ...p, statusAktif: false, tanggalKeluar: hariIni() }
            : p,
        ),
        kamar: prev.kamar.map((k) => {
          if (k.id !== target.kamarId) return k;
          const masihDihuni = prev.penghuni.some(
            (p) =>
              p.statusAktif && p.id !== penghuniId && p.kamarId === target.kamarId,
          );
          return masihDihuni ? k : { ...k, status: "Kosong" };
        }),
      }));

      return {
        success: true,
        message: `${target.nama} berhasil checkout.`,
      };
    },
    [data.penghuni],
  );

  const hapusDataPenghuniLama = useCallback(
    (id: string): HasilAksi => {
      const target = data.penghuni.find((p) => p.id === id);
      if (!target) {
        return { success: false, message: "Data penghuni tidak ditemukan." };
      }
      if (target.statusAktif) {
        return {
          success: false,
          message: "Checkout penghuni dulu sebelum menghapus datanya.",
        };
      }

      setData((prev) => ({
        ...prev,
        penghuni: prev.penghuni.filter((p) => p.id !== id),
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.penghuniId === id
            ? { ...u, penghuniId: undefined, klaim: undefined }
            : u,
        ),
      );

      return { success: true, message: `Data ${target.nama} dihapus.` };
    },
    [data.penghuni],
  );

  const tambahTransaksi = useCallback(
    (transaksiBaru: Omit<Transaksi, "id" | "tanggal">): HasilAksi => {
      const keterangan = transaksiBaru.keterangan.trim();
      if (!keterangan) {
        return { success: false, message: "Keterangan transaksi wajib diisi." };
      }
      if (!Number.isFinite(transaksiBaru.jumlah) || transaksiBaru.jumlah <= 0) {
        return { success: false, message: "Jumlah harus lebih dari 0." };
      }

      const payload: Transaksi = {
        ...transaksiBaru,
        keterangan,
        id: buatId("TR"),
        tanggal: hariIni(),
      };

      setData((prev) => ({
        ...prev,
        transaksi: [payload, ...prev.transaksi],
      }));
      return { success: true, message: "Transaksi berhasil ditambahkan." };
    },
    [],
  );

  const ubahStatusKeluhan = useCallback(
    (id: string): HasilAksi => {
      const target = data.keluhan.find((k) => k.id === id);
      if (!target) {
        return { success: false, message: "Laporan tidak ditemukan." };
      }
      if (target.status === "Selesai") {
        return {
          success: false,
          message: "Laporan ini sudah selesai dan tidak bisa dimajukan lagi.",
        };
      }

      const berikutnya: StatusKeluhan =
        target.status === "Pending" ? "Proses" : "Selesai";

      setData((prev) => ({
        ...prev,
        keluhan: prev.keluhan.map((k) => {
          if (k.id !== id) return k;
          const next: StatusKeluhan =
            k.status === "Pending" ? "Proses" : "Selesai";
          return { ...k, status: next };
        }),
      }));

      return {
        success: true,
        message: `Status laporan diubah ke ${berikutnya}.`,
      };
    },
    [data.keluhan],
  );

  const tambahKeluhan = useCallback(
    (keluhanBaru: Omit<Keluhan, "id" | "status" | "tanggal">): HasilAksi => {
      if (!data.kamar.some((k) => k.id === keluhanBaru.kamarId)) {
        return { success: false, message: "Kamar laporan tidak ditemukan." };
      }
      const deskripsi = keluhanBaru.deskripsi.trim();
      if (!deskripsi) {
        return { success: false, message: "Deskripsi keluhan wajib diisi." };
      }

      const payload: Keluhan = {
        ...keluhanBaru,
        deskripsi,
        id: buatId("KL"),
        status: "Pending",
        tanggal: hariIni(),
      };

      setData((prev) => ({
        ...prev,
        keluhan: [payload, ...prev.keluhan],
      }));
      return { success: true, message: "Keluhan berhasil dikirim ke admin." };
    },
    [data.kamar],
  );

  const hapusKeluhan = useCallback(
    (id: string): HasilAksi => {
      if (!data.keluhan.some((k) => k.id === id)) {
        return { success: false, message: "Laporan tidak ditemukan." };
      }
      setData((prev) => ({
        ...prev,
        keluhan: prev.keluhan.filter((k) => k.id !== id),
      }));
      return { success: true, message: "Laporan keluhan dihapus." };
    },
    [data.keluhan],
  );

  const tambahKamar = useCallback(
    (kamarBaru: InputKamar): HasilAksi => {
      const galat = validasiKamar(kamarBaru, data.kamar);
      if (galat) return { success: false, message: galat };

      const payload: Kamar = {
        id: buatId("KMR"),
        nomor: kamarBaru.nomor.trim(),
        tipe: kamarBaru.tipe,
        harga: kamarBaru.harga,
        status: "Kosong",
      };
      setData((prev) => ({ ...prev, kamar: [...prev.kamar, payload] }));
      return {
        success: true,
        message: `Kamar ${payload.nomor} berhasil ditambahkan.`,
      };
    },
    [data.kamar],
  );

  const editKamar = useCallback(
    (id: string, dataBaru: InputKamar): HasilAksi => {
      if (!data.kamar.some((k) => k.id === id)) {
        return { success: false, message: "Kamar tidak ditemukan." };
      }
      const galat = validasiKamar(dataBaru, data.kamar, id);
      if (galat) return { success: false, message: galat };

      setData((prev) => ({
        ...prev,
        kamar: prev.kamar.map((k) =>
          k.id === id
            ? {
                ...k,
                nomor: dataBaru.nomor.trim(),
                tipe: dataBaru.tipe,
                harga: dataBaru.harga,
              }
            : k,
        ),
      }));

      return {
        success: true,
        message: `Kamar ${dataBaru.nomor.trim()} berhasil diperbarui.`,
      };
    },
    [data.kamar],
  );

  const hapusKamar = useCallback(
    (id: string): HasilAksi => {
      const target = data.kamar.find((k) => k.id === id);
      if (!target) {
        return { success: false, message: "Kamar tidak ditemukan." };
      }
      if (
        data.penghuni.some((p) => p.statusAktif && p.kamarId === id)
      ) {
        return {
          success: false,
          message: `Kamar ${target.nomor} masih dihuni. Checkout penghuninya dulu.`,
        };
      }

      setData((prev) => ({
        ...prev,
        kamar: prev.kamar.filter((k) => k.id !== id),
      }));
      return { success: true, message: `Kamar ${target.nomor} dihapus.` };
    },
    [data.kamar, data.penghuni],
  );

  /** Penghuni konfirmasi pembayaran -> menunggu verifikasi admin. */
  const bayarTagihan = useCallback(
    (id: string, metode: string, catatan?: string): HasilAksi => {
      const target = data.tagihan.find((t) => t.id === id);
      if (!target) {
        return { success: false, message: "Tagihan tidak ditemukan." };
      }
      if (
        !currentUser ||
        currentUser.role !== "penghuni" ||
        !penghuniSaya ||
        penghuniSaya.id !== target.penghuniId
      ) {
        return {
          success: false,
          message: "Anda hanya dapat membayar tagihan milik sendiri.",
        };
      }
      if (!penghuniSaya.statusAktif) {
        return {
          success: false,
          message: "Penghuni yang sudah checkout tidak bisa mengirim pembayaran.",
        };
      }
      if (target.status !== "Belum Dibayar") {
        return {
          success: false,
          message: "Tagihan ini tidak berada pada status Belum Dibayar.",
        };
      }

      setData((prev) => ({
        ...prev,
        tagihan: prev.tagihan.map((t) =>
          t.id === id && t.status === "Belum Dibayar"
            ? {
                ...t,
                status: "Menunggu Verifikasi",
                tanggalBayar: hariIni(),
                metode,
                catatan: catatan?.trim() || undefined,
              }
            : t,
        ),
      }));

      return {
        success: true,
        message:
          "Konfirmasi pembayaran terkirim. Admin akan memverifikasi dalam 1x24 jam.",
      };
    },
    [data.tagihan, currentUser, penghuniSaya],
  );

  /** Admin menyetujui / menolak pembayaran. Yang disetujui masuk ke transaksi. */
  const verifikasiTagihan = useCallback(
    (id: string, setujui: boolean): HasilAksi => {
      if (!currentUser || currentUser.role !== "admin") {
        return {
          success: false,
          message: "Hanya admin yang dapat memverifikasi pembayaran.",
        };
      }

      const target = data.tagihan.find((t) => t.id === id);
      if (!target) {
        return { success: false, message: "Tagihan tidak ditemukan." };
      }
      if (target.status !== "Menunggu Verifikasi") {
        return {
          success: false,
          message: "Tagihan ini tidak sedang menunggu verifikasi.",
        };
      }

      const penghuni = data.penghuni.find((p) => p.id === target.penghuniId);

      if (!setujui) {
        setData((prev) => ({
          ...prev,
          tagihan: prev.tagihan.map((t) =>
            t.id === id && t.status === "Menunggu Verifikasi"
              ? {
                  ...t,
                  status: "Belum Dibayar",
                  tanggalBayar: null,
                  metode: undefined,
                  catatan: undefined,
                }
              : t,
          ),
        }));
        return {
          success: true,
          message: `Pembayaran ${penghuni?.nama ?? "penghuni"} ditolak. Tagihan kembali Belum Dibayar.`,
        };
      }

      const transaksiBaru: Transaksi = {
        id: buatId("TR"),
        keterangan: `Pembayaran sewa ${labelPeriode(target.periode)} - ${penghuni?.nama ?? "Penghuni"}`,
        jumlah: target.jumlah,
        tipe: "Pemasukan",
        tanggal: hariIni(),
      };

      setData((prev) => {
        const masihMenunggu = prev.tagihan.some(
          (t) => t.id === id && t.status === "Menunggu Verifikasi",
        );
        if (!masihMenunggu) return prev;

        return {
          ...prev,
          tagihan: prev.tagihan.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: "Lunas",
                  tanggalBayar: t.tanggalBayar ?? hariIni(),
                }
              : t,
          ),
          transaksi: [transaksiBaru, ...prev.transaksi],
        };
      });

      return {
        success: true,
        message: `Pembayaran ${penghuni?.nama ?? "penghuni"} diverifikasi dan masuk ke pemasukan.`,
      };
    },
    [currentUser, data.tagihan, data.penghuni],
  );

  /** Buat tagihan bulan berjalan untuk semua penghuni aktif (sekali klik). */
  const buatTagihanBulanIni = useCallback(() => {
    const periode = periodeSekarang();
    if (!currentUser || currentUser.role !== "admin") {
      return { dibuat: 0, dilewati: 0, periode };
    }

    const sudahAda = new Set(
      data.tagihan
        .filter((t) => t.periode === periode)
        .map((t) => t.penghuniId),
    );

    const targets = data.penghuni.filter(
      (p) => p.statusAktif && !sudahAda.has(p.id),
    );
    const baru: Tagihan[] = targets.flatMap((p) => {
      const kamar = data.kamar.find((k) => k.id === p.kamarId);
      if (!kamar) return [];
      return [
        {
          id: buatId("T"),
          penghuniId: p.id,
          kamarId: kamar.id,
          periode,
          tanggalJatuhTempo: `${periode}-10`,
          jumlah: kamar.harga,
          status: "Belum Dibayar" as const,
        },
      ];
    });

    if (baru.length > 0) {
      // Cek ulang di dalam updater supaya klik ganda tidak membuat tagihan dobel.
      setData((prev) => {
        const sudahAdaDiState = new Set(
          prev.tagihan
            .filter((t) => t.periode === periode)
            .map((t) => t.penghuniId),
        );
        const tambahan = baru.filter(
          (t) => !sudahAdaDiState.has(t.penghuniId),
        );
        if (tambahan.length === 0) return prev;
        return { ...prev, tagihan: [...prev.tagihan, ...tambahan] };
      });
    }

    return {
      dibuat: baru.length,
      dilewati: targets.length - baru.length,
      periode,
    };
  }, [data.tagihan, data.penghuni, data.kamar, currentUser]);

  const value = useMemo<kosContextType>(
    () => ({
      kamar: data.kamar,
      penghuni: data.penghuni,
      tagihan: data.tagihan,
      transaksi: data.transaksi,
      keluhan: data.keluhan,

      currentUser,
      permintaanKlaim,
      penghuniSaya,
      kamarSaya,
      tagihanSaya,
      register,
      login,
      logout,
      tautkanAkun,
      batalkanKlaim,
      setujuiKlaim,
      gantiPassword,

      tambahPenghuni,
      editPenghuni,
      keluarPenghuni,
      hapusDataPenghuniLama,

      tambahTransaksi,
      ubahStatusKeluhan,
      tambahKeluhan,
      hapusKeluhan,
      tambahKamar,
      editKamar,
      hapusKamar,

      bayarTagihan,
      verifikasiTagihan,
      buatTagihanBulanIni,
    }),
    [
      data,
      currentUser,
      permintaanKlaim,
      penghuniSaya,
      kamarSaya,
      tagihanSaya,
      register,
      login,
      logout,
      tautkanAkun,
      batalkanKlaim,
      setujuiKlaim,
      gantiPassword,
      tambahPenghuni,
      editPenghuni,
      keluarPenghuni,
      hapusDataPenghuniLama,
      tambahTransaksi,
      ubahStatusKeluhan,
      tambahKeluhan,
      hapusKeluhan,
      tambahKamar,
      editKamar,
      hapusKamar,
      bayarTagihan,
      verifikasiTagihan,
      buatTagihanBulanIni,
    ],
  );

  return <KosContext.Provider value={value}>{children}</KosContext.Provider>;
};

export const useKos = () => {
  const context = useContext(KosContext);
  if (!context) {
    throw new Error("useKos harus digunakan didalam KosProvider");
  }
  return context;
};

export default KosProvider;
