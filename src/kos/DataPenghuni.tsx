import { BadgeCheck, LogOut, Pencil, Plus, ShieldQuestion, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import { formatTanggal, rupiah } from "../utils/format";

type ModeForm = "tambah" | "edit" | null;

interface Konfirmasi {
  aksi: "checkout" | "hapus";
  id: string;
  nama: string;
}

const DataPenghuni = () => {
  const {
    penghuni,
    kamar,
    permintaanKlaim,
    tambahPenghuni,
    editPenghuni,
    keluarPenghuni,
    hapusDataPenghuniLama,
    setujuiKlaim,
  } = useKos();
  const { notify } = useToast();

  const [mode, setMode] = useState<ModeForm>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    nomorHp: "",
    kamarId: "",
  });
  const [konfirmasi, setKonfirmasi] = useState<Konfirmasi | null>(null);
  const [klaimTarget, setKlaimTarget] = useState<{
    userId: string;
    nama: string;
    setujui: boolean;
  } | null>(null);

  const nomorKamarById = useMemo(
    () => new Map(kamar.map((k) => [k.id, k.nomor])),
    [kamar],
  );

  const penghuniDiedit = useMemo(
    () => (editId ? (penghuni.find((p) => p.id === editId) ?? null) : null),
    [editId, penghuni],
  );

  const kamarPilihan = useMemo(() => {
    if (penghuniDiedit) {
      return kamar.filter(
        (k) =>
          k.status === "Kosong" || k.id === penghuniDiedit.kamarId,
      );
    }
    return kamar.filter((k) => k.status === "Kosong");
  }, [kamar, penghuniDiedit]);

  const bukaTambah = (awalan?: { nama: string; nomorHp: string }) => {
    setMode("tambah");
    setEditId(null);
    setFormData({
      nama: awalan?.nama ?? "",
      nomorHp: awalan?.nomorHp ?? "",
      kamarId: "",
    });
  };

  const bukaEdit = (id: string) => {
    const target = penghuni.find((p) => p.id === id);
    if (!target) return;
    setMode("edit");
    setEditId(id);
    setFormData({
      nama: target.nama,
      nomorHp: target.nomorHp,
      kamarId: target.kamarId,
    });
  };

  const tutupForm = () => {
    setMode(null);
    setEditId(null);
  };

  const handleSimpan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasil =
      mode === "edit" && editId
        ? editPenghuni(editId, formData)
        : tambahPenghuni(formData);

    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }
    notify(hasil.message);
    tutupForm();
  };

  const handleKonfirmasi = () => {
    if (!konfirmasi) return;
    const hasil =
      konfirmasi.aksi === "checkout"
        ? keluarPenghuni(konfirmasi.id)
        : hapusDataPenghuniLama(konfirmasi.id);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  const handleKlaim = () => {
    if (!klaimTarget) return;
    const hasil = setujuiKlaim(klaimTarget.userId, klaimTarget.setujui);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-xl font-bold text-slate-800">Data Penghuni</h2>
          <p className="text-sm text-slate-500">
            Kelola data penghuni, alokasi kamar, dan permintaan penautan akun.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => bukaTambah()}>
          <Plus size={17} aria-hidden="true" /> Tambah Penghuni
        </button>
      </div>

      {permintaanKlaim.length > 0 && (
        <section
          className="claim-panel"
          aria-labelledby="judul-klaim"
        >
          <div className="claim-heading">
            <span className="claim-mark" aria-hidden="true">
              <ShieldQuestion size={20} />
            </span>
            <div>
              <h3 id="judul-klaim">
                Permintaan penautan akun
                <span className="claim-count">{permintaanKlaim.length}</span>
              </h3>
              <p>
                Akun tidak otomatis terhubung. Cocokkan nomor HP dengan data
                penghuni sebelum menyetujui.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr>
                  <th scope="col">Akun</th>
                  <th scope="col">Nomor HP</th>
                  <th scope="col">Diajukan</th>
                  <th scope="col">Data penghuni</th>
                  <th scope="col" className="text-right">
                    Keputusan
                  </th>
                </tr>
              </thead>
              <tbody>
                {permintaanKlaim.map((klaim) => {
                  const bisaSetujui =
                    klaim.statusPenghuni === "Aktif" && !klaim.sudahDipakai;

                  return (
                    <tr key={klaim.userId}>
                      <td>
                        <strong className="block text-slate-800">
                          {klaim.nama}
                        </strong>
                        <span className="text-xs text-slate-500">
                          @{klaim.username}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">{klaim.nomorHp}</td>
                      <td className="whitespace-nowrap">
                        {formatTanggal(klaim.diajukanPada)}
                      </td>
                      <td>
                        {klaim.statusPenghuni === "Aktif" ? (
                          <span className="text-slate-700">
                            {klaim.penghuniNama}
                            {klaim.nomorKamar
                              ? ` · Kamar ${klaim.nomorKamar}`
                              : ""}
                          </span>
                        ) : klaim.statusPenghuni === "Tidak aktif" ? (
                          <span className="text-warning">
                            Penghuni sudah keluar
                          </span>
                        ) : (
                          <span className="text-danger">
                            Belum ada data penghuni
                          </span>
                        )}
                        {klaim.sudahDipakai && (
                          <span className="badge-warning ml-2">
                            Sudah tertaut akun lain
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          {!bisaSetujui && (
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() =>
                                bukaTambah({
                                  nama: klaim.penghuniNama ?? klaim.nama,
                                  nomorHp: klaim.nomorHp,
                                })
                              }
                            >
                              <Plus size={14} aria-hidden="true" /> Tambah
                              penghuni
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() =>
                              setKlaimTarget({
                                userId: klaim.userId,
                                nama: klaim.nama,
                                setujui: false,
                              })
                            }
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            className="btn-primary btn-sm"
                            disabled={!bisaSetujui}
                            onClick={() =>
                              setKlaimTarget({
                                userId: klaim.userId,
                                nama: klaim.nama,
                                setujui: true,
                              })
                            }
                          >
                            <BadgeCheck size={14} aria-hidden="true" /> Setujui
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <div className="data-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Nama Penghuni</th>
                <th scope="col">Kontak</th>
                <th scope="col">Kamar</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {penghuni.length > 0 ? (
                penghuni.map((p) => (
                  <tr key={p.id}>
                    <td className="font-bold text-slate-800">{p.nama}</td>
                    <td className="text-slate-600">{p.nomorHp}</td>
                    <td className="font-medium text-slate-600">
                      Kamar {nomorKamarById.get(p.kamarId) ?? "Tidak diketahui"}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          p.statusAktif ? "badge-success" : "badge-neutral"
                        }`}
                      >
                        {p.statusAktif ? "Aktif" : "Sudah Keluar"}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        {p.statusAktif ? (
                          <>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => bukaEdit(p.id)}
                            >
                              <Pencil size={14} aria-hidden="true" /> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-danger-soft btn-sm"
                              onClick={() =>
                                setKonfirmasi({
                                  aksi: "checkout",
                                  id: p.id,
                                  nama: p.nama,
                                })
                              }
                            >
                              <LogOut size={14} aria-hidden="true" /> Checkout
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() =>
                              setKonfirmasi({
                                aksi: "hapus",
                                id: p.id,
                                nama: p.nama,
                              })
                            }
                          >
                            <Trash2 size={14} aria-hidden="true" /> Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Belum ada data penghuni.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode && (
        <Modal
          title={
            mode === "edit" ? "Edit Data Penghuni" : "Tambah Penghuni Baru"
          }
          onClose={tutupForm}
        >
          <form onSubmit={handleSimpan} className="modal-body space-y-4">
            <div>
              <label htmlFor="penghuni-nama" className="form-label">
                Nama lengkap
              </label>
              <input
                id="penghuni-nama"
                type="text"
                required
                minLength={2}
                autoComplete="name"
                className="form-input"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label htmlFor="penghuni-hp" className="form-label">
                Nomor HP / WhatsApp
              </label>
              <input
                id="penghuni-hp"
                type="tel"
                inputMode="numeric"
                required
                maxLength={13}
                className="form-input"
                value={formData.nomorHp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    nomorHp: e.target.value.replace(/\D/g, ""),
                  })
                }
                placeholder="Contoh: 08123456789"
              />
            </div>

            <div>
              <label htmlFor="penghuni-kamar" className="form-label">
                Kamar
              </label>
              <select
                id="penghuni-kamar"
                required
                className="form-input disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                disabled={kamarPilihan.length === 0}
                aria-describedby={
                  kamarPilihan.length === 0 ? "penghuni-kamar-hint" : undefined
                }
                value={formData.kamarId}
                onChange={(e) =>
                  setFormData({ ...formData, kamarId: e.target.value })
                }
              >
                <option value="">
                  {kamarPilihan.length === 0
                    ? "Tidak ada kamar kosong"
                    : "Pilih kamar"}
                </option>
                {kamarPilihan.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor} · {k.tipe} ({rupiah(k.harga)})
                  </option>
                ))}
              </select>
              {kamarPilihan.length === 0 && (
                <p id="penghuni-kamar-hint" className="form-hint">
                  Belum ada kamar kosong. Tambah kamar atau checkout penghuni
                  lain sebelum menambahkan penghuni.
                </p>
              )}
              {mode === "edit" && (
                <p className="form-hint">
                  Pindah kamar akan mengosongkan kamar lama. Tagihan yang sudah
                  terbit tetap memakai kamar dan harga saat diterbitkan.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={tutupForm}>
                Batal
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={kamarPilihan.length === 0}
              >
                Simpan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {konfirmasi && (
        <ConfirmDialog
          title={
            konfirmasi.aksi === "checkout"
              ? "Checkout penghuni"
              : "Hapus data penghuni"
          }
          message={
            konfirmasi.aksi === "checkout"
              ? `${konfirmasi.nama} akan ditandai sudah keluar dan kamarnya menjadi Kosong. Riwayat tagihan tetap disimpan.`
              : `Data ${konfirmasi.nama} akan dihapus permanen. Riwayat tagihan dan transaksi yang sudah ada tidak ikut dihapus.`
          }
          confirmLabel={
            konfirmasi.aksi === "checkout" ? "Ya, checkout" : "Ya, hapus"
          }
          onConfirm={handleKonfirmasi}
          onClose={() => setKonfirmasi(null)}
        />
      )}

      {klaimTarget && (
        <ConfirmDialog
          title={
            klaimTarget.setujui
              ? "Setujui penautan akun"
              : "Tolak permintaan penautan"
          }
          message={
            klaimTarget.setujui
              ? `Akun ${klaimTarget.nama} akan terhubung ke data penghuni dengan nomor HP yang diajukan. Pastikan nomor HP sudah Anda verifikasi.`
              : `Permintaan ${klaimTarget.nama} akan ditolak. Penghuni dapat mengajukan nomor lain dari halaman Profil.`
          }
          confirmLabel={
            klaimTarget.setujui ? "Ya, setujui" : "Ya, tolak"
          }
          tone={klaimTarget.setujui ? "primary" : "danger"}
          onConfirm={handleKlaim}
          onClose={() => setKlaimTarget(null)}
        />
      )}
    </div>
  );
};

export default DataPenghuni;
