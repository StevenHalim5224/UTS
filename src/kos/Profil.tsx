import {
  BadgeCheck,
  Clock3,
  DoorOpen,
  KeyRound,
  Link2,
  LogOut,
  UserRound,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import { formatTanggal, rupiah } from "../utils/format";
import { validasiNomorHp } from "../utils/validasi";

type Pesan = { type: "" | "success" | "error"; text: string };

const pesanKosong: Pesan = { type: "", text: "" };

export default function Profil() {
  const {
    currentUser,
    penghuniSaya,
    kamarSaya,
    tagihanSaya,
    tautkanAkun,
    batalkanKlaim,
    gantiPassword,
    logout,
  } = useKos();
  const { notify } = useToast();

  const [nomorHp, setNomorHp] = useState("");
  const [password, setPassword] = useState({
    lama: "",
    baru: "",
    konfirmasi: "",
  });
  const [pesanPassword, setPesanPassword] = useState<Pesan>(pesanKosong);

  if (!currentUser) return null;

  // Admin adalah akun tetap; halaman profil hanya untuk penghuni.
  if (currentUser.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PENGHUNI WORKSPACE</p>
            <h2 className="text-2xl font-bold text-slate-800">Profil Saya</h2>
          </div>
        </div>
        <div className="empty-panel">
          <h3>Halaman khusus penghuni</h3>
          <p>
            Akun administrator adalah akun tetap aplikasi. Profil, data kamar,
            dan penggantian password hanya berlaku untuk akun penghuni.
          </p>
          <Link to="/dashboard" className="primary-link">
            Kembali ke Ringkasan
          </Link>
        </div>
      </div>
    );
  }

  const klaim = currentUser.klaim;
  const klaimMenunggu = klaim?.status === "Menunggu";
  const belumDibayar = tagihanSaya.filter((t) => t.status !== "Lunas").length;

  const handleTautkan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hp = nomorHp.trim();
    const galat = validasiNomorHp(hp);
    if (galat) {
      notify(galat, "error");
      return;
    }

    const hasil = tautkanAkun(hp);
    notify(hasil.message, hasil.success ? "success" : "error");
    if (hasil.success) setNomorHp("");
  };

  const handleBatalkanKlaim = () => {
    const hasil = batalkanKlaim();
    notify(hasil.message, hasil.success ? "success" : "error");
  };

  const handleGantiPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password.baru !== password.konfirmasi) {
      setPesanPassword({
        type: "error",
        text: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    const hasil = gantiPassword(password.lama, password.baru);
    setPesanPassword({
      type: hasil.success ? "success" : "error",
      text: hasil.message,
    });
    if (hasil.success) {
      setPassword({ lama: "", baru: "", konfirmasi: "" });
      notify("Password berhasil diubah.");
    }
  };

  const statusKamar = kamarSaya
    ? { label: "Terhubung", tone: "badge-success", ikon: true }
    : klaimMenunggu
      ? { label: "Menunggu admin", tone: "badge-warning", ikon: false }
      : klaim?.status === "Ditolak"
        ? { label: "Klaim ditolak", tone: "badge-danger", ikon: false }
        : { label: "Belum terhubung", tone: "badge-neutral", ikon: false };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PENGHUNI WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">Profil Saya</h2>
          <p className="text-slate-500 text-sm">
            Kelola akun, status kamar, dan keamanan akun Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="page-card pad">
          <div className="flex items-center gap-4">
            <span className="avatar avatar-lg uppercase">
              {currentUser.nama?.slice(0, 1) || "U"}
            </span>
            <div className="min-w-0">
              <h3 className="panel-title truncate">
                {currentUser.nama || currentUser.username}
              </h3>
              <p className="text-sm text-slate-500">@{currentUser.username}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Peran akun</dt>
              <dd className="font-medium text-slate-800">Penghuni</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Status kamar</dt>
              <dd>
                <span className={`badge ${statusKamar.tone}`}>
                  {statusKamar.ikon && (
                    <BadgeCheck size={13} aria-hidden="true" />
                  )}
                  {statusKamar.label}
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Tagihan belum lunas</dt>
              <dd className="font-medium text-slate-800">
                {belumDibayar} tagihan
              </dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={logout}
            className="btn-secondary mt-6 w-full"
          >
            <LogOut size={15} aria-hidden="true" /> Keluar dari akun
          </button>
        </section>

        <section className="page-card pad">
          <h3 className="panel-title">
            <DoorOpen size={19} aria-hidden="true" /> Kamar Saya
          </h3>

          {kamarSaya ? (
            <div className="mt-4 space-y-3 text-sm">
              <div className="info-box">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nomor kamar
                </p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">
                  {kamarSaya.nomor}
                </p>
                <p className="text-slate-500 mt-1">
                  {kamarSaya.tipe} · {rupiah(kamarSaya.harga)} / bulan
                </p>
              </div>
              {penghuniSaya && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Tanggal masuk</span>
                  <span className="font-medium text-slate-800">
                    {formatTanggal(penghuniSaya.tanggalMasuk)}
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500">
                Perubahan data kamar hanya dapat dilakukan oleh admin kos.
              </p>
            </div>
          ) : penghuniSaya ? (
            <div className="notice notice-warning mt-4">
              Status penghuni Anda sudah tidak aktif (sudah checkout). Hubungi
              admin kos jika Anda masih menempati kamar.
            </div>
          ) : klaimMenunggu ? (
            <div className="mt-4 space-y-4">
              <div className="notice notice-warning">
                <p className="flex items-center gap-2 font-semibold">
                  <Clock3 size={16} aria-hidden="true" /> Menunggu persetujuan
                  admin
                </p>
                <p className="mt-2">
                  Permintaan penautan untuk nomor{" "}
                  <strong>{klaim?.nomorHp}</strong> diajukan{" "}
                  {formatTanggal(klaim?.diajukanPada ?? "")}. Kamar dan tagihan
                  baru muncul setelah admin menyetujui.
                </p>
              </div>
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={handleBatalkanKlaim}
              >
                Batalkan permintaan
              </button>
            </div>
          ) : (
            <div className="mt-4">
              {klaim?.status === "Ditolak" && (
                <div className="notice notice-danger mb-4">
                  <p className="font-semibold">Permintaan sebelumnya ditolak</p>
                  <p className="mt-1">
                    {klaim.catatan ||
                      "Nomor HP belum cocok dengan data penghuni. Periksa nomornya atau hubungi admin kos."}
                  </p>
                </div>
              )}

              <p className="text-sm text-slate-500">
                Ajukan nomor HP yang terdaftar pada data penghuni. Admin akan
                memeriksa dan menyetujui sebelum akun terhubung ke kamar.
              </p>
              <form onSubmit={handleTautkan} className="mt-4 space-y-3">
                <div>
                  <label htmlFor="nomorHp" className="form-label">
                    Nomor HP terdaftar
                  </label>
                  <input
                    id="nomorHp"
                    type="tel"
                    inputMode="numeric"
                    maxLength={13}
                    required
                    className="form-input"
                    value={nomorHp}
                    onChange={(e) =>
                      setNomorHp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="Contoh: 08123456789"
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  <Link2 size={16} aria-hidden="true" /> Ajukan penautan
                </button>
              </form>
            </div>
          )}
        </section>
      </div>

      <section className="page-card pad">
        <h3 className="panel-title">
          <KeyRound size={19} aria-hidden="true" /> Ganti Password
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Gunakan minimal 6 karakter dan jangan bagikan password ke orang lain.
        </p>

        <form
          onSubmit={handleGantiPassword}
          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div>
            <label htmlFor="passwordLama" className="form-label">
              Password lama
            </label>
            <input
              id="passwordLama"
              type="password"
              autoComplete="current-password"
              required
              className="form-input"
              value={password.lama}
              onChange={(e) =>
                setPassword({ ...password, lama: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="passwordBaru" className="form-label">
              Password baru
            </label>
            <input
              id="passwordBaru"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="form-input"
              value={password.baru}
              onChange={(e) =>
                setPassword({ ...password, baru: e.target.value })
              }
            />
          </div>
          <div>
            <label htmlFor="passwordKonfirmasi" className="form-label">
              Ulangi password baru
            </label>
            <input
              id="passwordKonfirmasi"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              className="form-input"
              value={password.konfirmasi}
              onChange={(e) =>
                setPassword({ ...password, konfirmasi: e.target.value })
              }
            />
          </div>

          <div className="md:col-span-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="submit" className="btn-primary">
              <UserRound size={16} aria-hidden="true" /> Simpan Password
            </button>
            {pesanPassword.text && (
              <p
                role="status"
                className={`text-xs ${
                  pesanPassword.type === "success"
                    ? "text-success"
                    : "text-danger"
                }`}
              >
                {pesanPassword.text}
              </p>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
