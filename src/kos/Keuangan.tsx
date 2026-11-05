import { Check, Plus, Search, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import type { Tagihan, TipeTransaksi } from "../types";
import {
  formatTanggal,
  labelPeriode,
  rupiah,
  statusTagihan,
} from "../utils/format";

const Keuangan = () => {
  const {
    transaksi,
    tambahTransaksi,
    tagihan,
    penghuni,
    kamar,
    verifikasiTagihan,
    buatTagihanBulanIni,
  } = useKos();
  const { notify } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    keterangan: "",
    jumlah: "",
    tipe: "Pemasukan" as TipeTransaksi,
  });
  const [periode, setPeriode] = useState("semua");
  const [cari, setCari] = useState("");
  const [tolakTarget, setTolakTarget] = useState<Tagihan | null>(null);

  const namaPenghuni = useMemo(
    () => new Map(penghuni.map((p) => [p.id, p.nama])),
    [penghuni],
  );
  const nomorKamar = useMemo(
    () => new Map(kamar.map((k) => [k.id, k.nomor])),
    [kamar],
  );

  const periodeTersedia = useMemo(() => {
    const daftar = new Set<string>();
    for (const t of transaksi) {
      if (t.tanggal.length >= 7) daftar.add(t.tanggal.slice(0, 7));
    }
    for (const t of tagihan) daftar.add(t.periode);
    return [...daftar].sort((a, b) => b.localeCompare(a));
  }, [transaksi, tagihan]);

  const kataKunci = cari.trim().toLowerCase();

  const transaksiTampil = useMemo(
    () =>
      transaksi
        .filter((t) => {
          const cocokPeriode =
            periode === "semua" || t.tanggal.slice(0, 7) === periode;
          const cocokCari =
            !kataKunci ||
            `${t.keterangan} ${t.tipe} ${t.tanggal}`
              .toLowerCase()
              .includes(kataKunci);
          return cocokPeriode && cocokCari;
        })
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal)),
    [transaksi, periode, kataKunci],
  );

  const tagihanTampil = useMemo(
    () =>
      tagihan
        .filter((t) => {
          const cocokPeriode = periode === "semua" || t.periode === periode;
          const pencarian = [
            namaPenghuni.get(t.penghuniId) ?? "",
            nomorKamar.get(t.kamarId) ?? "",
            labelPeriode(t.periode),
            statusTagihan(t).label,
          ]
            .join(" ")
            .toLowerCase();
          return cocokPeriode && (!kataKunci || pencarian.includes(kataKunci));
        })
        .sort((a, b) => b.periode.localeCompare(a.periode)),
    [tagihan, periode, kataKunci, namaPenghuni, nomorKamar],
  );

  const { totalPemasukan, totalPengeluaran } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    for (const item of transaksiTampil) {
      if (item.tipe === "Pemasukan") masuk += item.jumlah;
      else keluar += item.jumlah;
    }
    return { totalPemasukan: masuk, totalPengeluaran: keluar };
  }, [transaksiTampil]);

  const saldoBersih = totalPemasukan - totalPengeluaran;
  const jumlahMenunggu = tagihanTampil.filter(
    (t) => t.status === "Menunggu Verifikasi",
  ).length;

  const { totalTertagih, totalLunas, totalBelumLunas } = useMemo(() => {
    let tertagih = 0;
    let lunas = 0;
    let belum = 0;
    for (const t of tagihanTampil) {
      tertagih += t.jumlah;
      if (t.status === "Lunas") lunas += t.jumlah;
      else belum += t.jumlah;
    }
    return { totalTertagih: tertagih, totalLunas: lunas, totalBelumLunas: belum };
  }, [tagihanTampil]);

  const labelFilter =
    periode === "semua" ? "semua periode" : labelPeriode(periode);

  const handleBukaModal = () => {
    setFormData({ keterangan: "", jumlah: "", tipe: "Pemasukan" });
    setShowModal(true);
  };

  const handleSimpan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasil = tambahTransaksi({
      keterangan: formData.keterangan,
      jumlah: Number(formData.jumlah),
      tipe: formData.tipe,
    });
    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }
    notify(hasil.message);
    setShowModal(false);
  };

  const handleBuatTagihan = () => {
    const hasil = buatTagihanBulanIni();
    if (hasil.dibuat === 0) {
      notify(
        `Tagihan ${labelPeriode(hasil.periode)} sudah dibuat untuk semua penghuni aktif.`,
        "info",
      );
      return;
    }
    notify(
      `${hasil.dibuat} tagihan ${labelPeriode(hasil.periode)} dibuat.${
        hasil.dilewati > 0
          ? ` ${hasil.dilewati} penghuni dilewati karena kamarnya tidak ditemukan.`
          : ""
      }`,
    );
  };

  const handleVerifikasi = (id: string, setujui: boolean) => {
    const hasil = verifikasiTagihan(id, setujui);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Manajemen Keuangan
          </h2>
          <p className="text-sm text-slate-500">
            Pantau pemasukan, pengeluaran, tagihan, dan saldo bersih kos.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleBukaModal}>
          <Plus size={17} aria-hidden="true" /> Tambah Transaksi
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-field">
          <label htmlFor="filter-periode" className="form-label">
            Periode
          </label>
          <select
            id="filter-periode"
            className="form-input"
            value={periode}
            onChange={(e) => setPeriode(e.target.value)}
          >
            <option value="semua">Semua periode</option>
            {periodeTersedia.map((p) => (
              <option key={p} value={p}>
                {labelPeriode(p)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field filter-search">
          <label htmlFor="filter-cari" className="form-label">
            Cari
          </label>
          <div className="search-input">
            <Search size={16} aria-hidden="true" />
            <input
              id="filter-cari"
              type="search"
              className="form-input"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Nama penghuni, kamar, atau keterangan"
            />
          </div>
        </div>
      </div>

      <p className="summary-caption">
        Ringkasan {labelFilter}
        {kataKunci ? ` · pencarian “${cari.trim()}”` : ""}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="stat-card green">
          <div className="stat-top">
            <span>Saldo Bersih</span>
          </div>
          <p className="stat-value">{rupiah(saldoBersih)}</p>
        </article>
        <article className="stat-card blue">
          <div className="stat-top">
            <span>Total Pemasukan</span>
          </div>
          <p className="stat-value">{rupiah(totalPemasukan)}</p>
        </article>
        <article className="stat-card rose">
          <div className="stat-top">
            <span>Total Pengeluaran</span>
          </div>
          <p className="stat-value">{rupiah(totalPengeluaran)}</p>
        </article>
      </div>

      <div className="data-card">
        <div className="panel-toolbar">
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              Tagihan Penghuni
              {jumlahMenunggu > 0 && (
                <span className="badge-warning">{jumlahMenunggu} menunggu</span>
              )}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Terbitkan tagihan bulanan dan verifikasi pembayaran penghuni.
            </p>
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBuatTagihan}
          >
            <Plus size={16} aria-hidden="true" /> Tagihan bulan ini
          </button>
        </div>

        <div className="bill-totals">
          <span>
            Tertagih <strong>{rupiah(totalTertagih)}</strong>
          </span>
          <span>
            Lunas <strong>{rupiah(totalLunas)}</strong>
          </span>
          <span>
            Belum lunas <strong>{rupiah(totalBelumLunas)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Penghuni</th>
                <th scope="col">Kamar</th>
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
              {tagihanTampil.length > 0 ? (
                tagihanTampil.map((t) => {
                  const badge = statusTagihan(t);
                  return (
                    <tr key={t.id}>
                      <td className="font-medium text-slate-800">
                        {namaPenghuni.get(t.penghuniId) ?? "Penghuni"}
                      </td>
                      <td className="text-slate-600">
                        {nomorKamar.get(t.kamarId) ?? "-"}
                      </td>
                      <td className="text-slate-600">
                        {labelPeriode(t.periode)}
                      </td>
                      <td className="whitespace-nowrap text-slate-600">
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
                      <td>
                        {t.status === "Menunggu Verifikasi" ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              className="btn-success-soft btn-sm"
                              onClick={() => handleVerifikasi(t.id, true)}
                            >
                              <Check size={14} aria-hidden="true" /> Verifikasi
                            </button>
                            <button
                              type="button"
                              className="btn-danger-soft btn-sm"
                              onClick={() => setTolakTarget(t)}
                            >
                              <X size={14} aria-hidden="true" /> Tolak
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-xs text-slate-500">
                            {t.status === "Lunas"
                              ? t.tanggalBayar
                                ? `Lunas ${formatTanggal(t.tanggalBayar)}`
                                : "Lunas"
                              : "Belum dibayar"}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="empty-cell">
                    {tagihan.length === 0
                      ? 'Belum ada tagihan. Klik "Tagihan bulan ini" untuk membuat tagihan semua penghuni aktif.'
                      : "Tidak ada tagihan yang cocok dengan filter ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="data-card">
        <div className="panel-toolbar">
          <div>
            <h3 className="font-semibold text-slate-800">Riwayat Transaksi</h3>
            <p className="mt-1 text-xs text-slate-500">
              {transaksiTampil.length} transaksi pada filter aktif.
            </p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Tanggal</th>
                <th scope="col">Keterangan</th>
                <th scope="col">Tipe</th>
                <th scope="col" className="text-right">
                  Jumlah
                </th>
              </tr>
            </thead>
            <tbody>
              {transaksiTampil.length > 0 ? (
                transaksiTampil.map((t) => (
                  <tr key={t.id}>
                    <td className="text-slate-600">
                      {formatTanggal(t.tanggal)}
                    </td>
                    <td className="font-medium text-slate-800">
                      {t.keterangan}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          t.tipe === "Pemasukan"
                            ? "badge-income"
                            : "badge-expense"
                        }`}
                      >
                        {t.tipe}
                      </span>
                    </td>
                    <td
                      className={`text-right font-bold ${
                        t.tipe === "Pemasukan"
                          ? "income-text"
                          : "expense-text"
                      }`}
                    >
                      {t.tipe === "Pemasukan" ? "+" : "−"} {rupiah(t.jumlah)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    {transaksi.length === 0
                      ? "Belum ada riwayat transaksi."
                      : "Tidak ada transaksi yang cocok dengan filter ini."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          title="Tambah Transaksi Baru"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSimpan} className="modal-body space-y-4">
            <div>
              <label htmlFor="transaksi-keterangan" className="form-label">
                Keterangan
              </label>
              <input
                id="transaksi-keterangan"
                type="text"
                required
                className="form-input"
                value={formData.keterangan}
                onChange={(e) =>
                  setFormData({ ...formData, keterangan: e.target.value })
                }
                placeholder="Contoh: Bayar listrik / sewa kamar"
              />
            </div>

            <div>
              <label htmlFor="transaksi-tipe" className="form-label">
                Tipe transaksi
              </label>
              <select
                id="transaksi-tipe"
                className="form-input"
                value={formData.tipe}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tipe: e.target.value as TipeTransaksi,
                  })
                }
              >
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </div>

            <div>
              <label htmlFor="transaksi-jumlah" className="form-label">
                Jumlah (Rp)
              </label>
              <input
                id="transaksi-jumlah"
                type="number"
                required
                min={1}
                inputMode="numeric"
                className="form-input"
                value={formData.jumlah}
                onChange={(e) =>
                  setFormData({ ...formData, jumlah: e.target.value })
                }
                placeholder="Contoh: 500000"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button type="submit" className="btn-primary">
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {tolakTarget && (
        <ConfirmDialog
          title="Tolak pembayaran"
          message={`Pembayaran tagihan ${labelPeriode(tolakTarget.periode)} akan ditolak dan statusnya kembali ke Belum Dibayar.`}
          confirmLabel="Ya, tolak"
          onConfirm={() => handleVerifikasi(tolakTarget.id, false)}
          onClose={() => setTolakTarget(null)}
        />
      )}
    </div>
  );
};

export default Keuangan;
