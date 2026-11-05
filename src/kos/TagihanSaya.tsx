import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import type { Tagihan } from "../types";
import {
  formatTanggal,
  labelPeriode,
  rupiah,
  statusTagihan,
} from "../utils/format";

const METODE_PEMBAYARAN = ["Transfer Bank", "QRIS", "Tunai"];

export default function TagihanSaya() {
  const { tagihanSaya, penghuniSaya, bayarTagihan, currentUser } = useKos();
  const { notify } = useToast();
  const [selected, setSelected] = useState<Tagihan | null>(null);
  const [metode, setMetode] = useState(METODE_PEMBAYARAN[0]);
  const [catatan, setCatatan] = useState("");

  const ringkasan = useMemo(() => {
    let belumDibayar = 0;
    let sudahDibayar = 0;
    let menunggu = 0;
    let terdekat: Tagihan | null = null;

    for (const t of tagihanSaya) {
      if (t.status === "Lunas") {
        sudahDibayar += t.jumlah;
        continue;
      }
      if (t.status === "Menunggu Verifikasi") {
        menunggu += 1;
        continue;
      }
      belumDibayar += t.jumlah;
      if (!terdekat || t.tanggalJatuhTempo < terdekat.tanggalJatuhTempo) {
        terdekat = t;
      }
    }

    return { belumDibayar, sudahDibayar, menunggu, terdekat };
  }, [tagihanSaya]);

  const bukaPembayaran = (tagihan: Tagihan) => {
    setSelected(tagihan);
    setMetode(METODE_PEMBAYARAN[0]);
    setCatatan("");
  };

  const handleBayar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;

    const hasil = bayarTagihan(selected.id, metode, catatan.trim() || undefined);
    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }
    setSelected(null);
    notify(hasil.message);
  };

  if (currentUser?.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PENGHUNI WORKSPACE</p>
            <h2 className="text-2xl font-bold text-slate-800">Tagihan Saya</h2>
          </div>
        </div>
        <div className="empty-panel">
          <h3>Halaman khusus penghuni</h3>
          <p>
            Kelola dan verifikasi tagihan semua penghuni melalui menu Keuangan.
          </p>
          <Link to="/keuangan" className="primary-link">
            Buka Keuangan
          </Link>
        </div>
      </div>
    );
  }

  if (!penghuniSaya) {
    return (
      <div className="space-y-6">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PENGHUNI WORKSPACE</p>
            <h2 className="text-2xl font-bold text-slate-800">Tagihan Saya</h2>
          </div>
        </div>
        <div className="empty-panel">
          <AlertCircle
            size={26}
            className="mx-auto mb-3 text-warning"
            aria-hidden="true"
          />
          <h3>Akun belum terhubung ke kamar</h3>
          <p>
            Hubungkan akun dengan nomor HP yang terdaftar agar tagihan dan kamar
            Anda muncul di sini.
          </p>
          <Link to="/profil" className="primary-link">
            Hubungkan di Profil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">PENGHUNI WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">Tagihan Saya</h2>
          <p className="text-slate-500 text-sm">
            Pantau tagihan sewa, jatuh tempo, dan status pembayaran Anda.
          </p>
        </div>
      </div>

      {!penghuniSaya.statusAktif && (
        <div className="notice notice-warning">
          Status penghuni Anda sudah tidak aktif (sudah checkout), jadi
          pembayaran baru tidak dapat dikirim dari akun ini. Riwayat tagihan
          tetap ditampilkan.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="stat-card rose">
          <div className="stat-top">
            <span>Total belum dibayar</span>
            <Wallet size={18} aria-hidden="true" />
          </div>
          <p className="stat-value">{rupiah(ringkasan.belumDibayar)}</p>
          <p className="stat-meta">
            {ringkasan.menunggu > 0
              ? `${ringkasan.menunggu} pembayaran menunggu verifikasi`
              : "Tidak ada pembayaran tertunda"}
          </p>
        </article>

        <article className="stat-card amber">
          <div className="stat-top">
            <span>Jatuh tempo terdekat</span>
            <CalendarClock size={18} aria-hidden="true" />
          </div>
          <p className="stat-value">
            {ringkasan.terdekat
              ? formatTanggal(ringkasan.terdekat.tanggalJatuhTempo)
              : "-"}
          </p>
          <p className="stat-meta">
            {ringkasan.terdekat
              ? labelPeriode(ringkasan.terdekat.periode)
              : "Semua tagihan sudah dibayar"}
          </p>
        </article>

        <article className="stat-card green">
          <div className="stat-top">
            <span>Total sudah dibayar</span>
            <CheckCircle2 size={18} aria-hidden="true" />
          </div>
          <p className="stat-value">{rupiah(ringkasan.sudahDibayar)}</p>
          <p className="stat-meta">
            {tagihanSaya.filter((t) => t.status === "Lunas").length} tagihan
            lunas
          </p>
        </article>
      </div>

      <div className="data-card">
        <div className="panel-toolbar">
          <div>
            <h3 className="font-semibold text-slate-800">Riwayat Tagihan</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Periode</th>
                <th scope="col">Jatuh Tempo</th>
                <th scope="col">Jumlah</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {tagihanSaya.length > 0 ? (
                tagihanSaya.map((t) => {
                  const badge = statusTagihan(t);
                  return (
                    <tr key={t.id}>
                      <td className="font-semibold text-slate-800">
                        {labelPeriode(t.periode)}
                      </td>
                      <td className="text-slate-600">
                        {formatTanggal(t.tanggalJatuhTempo)}
                      </td>
                      <td className="whitespace-nowrap font-medium text-slate-800">
                        {rupiah(t.jumlah)}
                      </td>
                      <td>
                        <span className={`badge ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="text-right">
                        {t.status === "Belum Dibayar" &&
                        penghuniSaya.statusAktif ? (
                          <button
                            type="button"
                            onClick={() => bukaPembayaran(t)}
                            className="btn-primary btn-sm"
                          >
                            <CreditCard size={14} aria-hidden="true" /> Bayar
                          </button>
                        ) : t.status === "Menunggu Verifikasi" ? (
                          <span className="text-xs text-warning">
                            Menunggu verifikasi
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">
                            {t.status === "Lunas"
                              ? t.tanggalBayar
                                ? `Dibayar ${formatTanggal(t.tanggalBayar)}`
                                : "Lunas"
                              : "Hubungi admin kos"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Belum ada tagihan. Admin akan menerbitkan tagihan sewa Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <Modal
          title={`Pembayaran ${labelPeriode(selected.periode)}`}
          onClose={() => setSelected(null)}
        >
          <form onSubmit={handleBayar} className="modal-body space-y-4">
            <div className="info-box space-y-1.5">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Jumlah</span>
                <strong className="text-slate-800">
                  {rupiah(selected.jumlah)}
                </strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Jatuh tempo</span>
                <span className="text-slate-700">
                  {formatTanggal(selected.tanggalJatuhTempo)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Status</span>
                <span className="text-slate-700">Belum Dibayar</span>
              </div>
            </div>

            <div>
              <label htmlFor="metode" className="form-label">
                Metode Pembayaran
              </label>
              <select
                id="metode"
                className="form-input"
                value={metode}
                onChange={(e) => setMetode(e.target.value)}
              >
                {METODE_PEMBAYARAN.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="catatan" className="form-label">
                Catatan (opsional)
              </label>
              <textarea
                id="catatan"
                rows={2}
                className="form-input resize-y"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Contoh: transfer dari BCA a.n. Budi"
              />
            </div>

            <p className="form-hint">
              Setelah dikirim, admin akan memverifikasi pembayaran Anda. Status
              tagihan berubah menjadi Lunas setelah diverifikasi.
            </p>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="btn-secondary"
              >
                Batal
              </button>
              <button type="submit" className="btn-primary">
                Kirim Konfirmasi
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
