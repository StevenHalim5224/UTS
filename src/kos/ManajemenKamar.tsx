import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { TIPE_KAMAR } from "../constants/kamar";
import { useKos } from "../context/kosContext";
import type { Kamar } from "../types";
import { rupiah } from "../utils/format";

type ModeForm = "tambah" | "edit" | null;

const ManajemenKamar = () => {
  const { kamar, tambahKamar, editKamar, hapusKamar } = useKos();
  const { notify } = useToast();

  const [mode, setMode] = useState<ModeForm>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomor: "",
    tipe: "Standar",
    harga: "",
  });
  const [hapusTarget, setHapusTarget] = useState<Kamar | null>(null);

  const bukaTambah = () => {
    setMode("tambah");
    setEditId(null);
    setFormData({ nomor: "", tipe: "Standar", harga: "" });
  };

  const bukaEdit = (dataKamar: Kamar) => {
    setMode("edit");
    setEditId(dataKamar.id);
    setFormData({
      nomor: dataKamar.nomor,
      tipe: dataKamar.tipe,
      harga: String(dataKamar.harga),
    });
  };

  const tutupForm = () => {
    setMode(null);
    setEditId(null);
  };

  const handleSimpan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      nomor: formData.nomor,
      tipe: formData.tipe,
      harga: Number(formData.harga),
    };
    const hasil =
      mode === "edit" && editId
        ? editKamar(editId, payload)
        : tambahKamar(payload);

    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }
    notify(hasil.message);
    tutupForm();
  };

  const mintaHapus = (dataKamar: Kamar) => {
    if (dataKamar.status === "Terisi") {
      notify(
        `Kamar ${dataKamar.nomor} masih terisi. Checkout penghuninya dulu.`,
        "error",
      );
      return;
    }
    setHapusTarget(dataKamar);
  };

  const handleHapus = () => {
    if (!hapusTarget) return;
    const hasil = hapusKamar(hapusTarget.id);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  const tipeTersedia = formData.tipe
    ? TIPE_KAMAR.includes(formData.tipe as (typeof TIPE_KAMAR)[number])
      ? TIPE_KAMAR
      : [...TIPE_KAMAR, formData.tipe]
    : TIPE_KAMAR;

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kamar</h2>
          <p className="text-sm text-slate-500">
            Kelola daftar kamar, tipe, dan harga sewa.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={bukaTambah}>
          <Plus size={17} aria-hidden="true" /> Tambah Kamar
        </button>
      </div>

      <div className="data-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Nomor</th>
                <th scope="col">Tipe Kamar</th>
                <th scope="col">Harga (Rp)</th>
                <th scope="col">Status</th>
                <th scope="col" className="text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {kamar.length > 0 ? (
                kamar.map((k) => (
                  <tr key={k.id}>
                    <td className="font-bold text-slate-700">{k.nomor}</td>
                    <td className="text-slate-600">{k.tipe}</td>
                    <td className="font-medium text-slate-600">
                      {rupiah(k.harga)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          k.status === "Kosong"
                            ? "badge-success"
                            : "badge-danger"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => bukaEdit(k)}
                        >
                          <Pencil size={14} aria-hidden="true" /> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger-soft btn-sm"
                          onClick={() => mintaHapus(k)}
                        >
                          <Trash2 size={14} aria-hidden="true" /> Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Belum ada data kamar. Tambah kamar baru untuk mulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode && (
        <Modal
          title={mode === "tambah" ? "Tambah Kamar Baru" : "Edit Data Kamar"}
          onClose={tutupForm}
        >
          <form onSubmit={handleSimpan} className="modal-body space-y-4">
            <div>
              <label htmlFor="kamar-nomor" className="form-label">
                Nomor kamar
              </label>
              <input
                id="kamar-nomor"
                type="text"
                required
                className="form-input"
                value={formData.nomor}
                onChange={(e) =>
                  setFormData({ ...formData, nomor: e.target.value })
                }
                placeholder="Contoh: 101"
              />
              <p className="form-hint">Nomor kamar harus unik.</p>
            </div>

            <div>
              <label htmlFor="kamar-tipe" className="form-label">
                Tipe kamar
              </label>
              <select
                id="kamar-tipe"
                required
                className="form-input"
                value={formData.tipe}
                onChange={(e) =>
                  setFormData({ ...formData, tipe: e.target.value })
                }
              >
                {tipeTersedia.map((tipe) => (
                  <option key={tipe} value={tipe}>
                    {tipe}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="kamar-harga" className="form-label">
                Harga sewa per bulan (Rp)
              </label>
              <input
                id="kamar-harga"
                type="number"
                required
                min={1}
                step={1}
                inputMode="numeric"
                className="form-input"
                value={formData.harga}
                onChange={(e) =>
                  setFormData({ ...formData, harga: e.target.value })
                }
                placeholder="Contoh: 1500000"
              />
              {formData.harga !== "" && Number(formData.harga) <= 0 && (
                <p className="form-hint text-danger">
                  Harga harus lebih dari 0.
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={tutupForm}
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

      {hapusTarget && (
        <ConfirmDialog
          title="Hapus kamar"
          message={`Kamar ${hapusTarget.nomor} akan dihapus permanen. Kamar yang masih punya riwayat tagihan sebaiknya tidak dihapus.`}
          confirmLabel="Ya, hapus"
          onConfirm={handleHapus}
          onClose={() => setHapusTarget(null)}
        />
      )}
    </div>
  );
};

export default ManajemenKamar;
