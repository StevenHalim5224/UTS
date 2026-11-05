import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import { formatTanggal, statusColor } from "../utils/format";

const Keluhan = () => {
  const { keluhan, kamar, ubahStatusKeluhan, tambahKeluhan, hapusKeluhan } =
    useKos();
  const { notify } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [hapusId, setHapusId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kamarId: "",
    kategori: "Listrik & Air",
    deskripsi: "",
  });

  const handleBukaModal = () => {
    setFormData({
      kamarId: "",
      kategori: "Listrik & Air",
      deskripsi: "",
    });
    setShowModal(true);
  };

  const handleSimpan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hasil = tambahKeluhan({
      kamarId: formData.kamarId,
      kategori: formData.kategori,
      deskripsi: formData.deskripsi,
    });

    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }
    notify(hasil.message);
    setShowModal(false);
  };

  const handleStatus = (id: string) => {
    const hasil = ubahStatusKeluhan(id);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message, "info");
  };

  const handleHapus = () => {
    if (!hapusId) return;
    const hasil = hapusKeluhan(hapusId);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Keluhan Penghuni
          </h2>
          <p className="text-sm text-slate-500">
            Daftar laporan dan perbaikan fasilitas kos.
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={handleBukaModal}>
          <Plus size={17} aria-hidden="true" /> Buat Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keluhan.length > 0 ? (
          keluhan.map((k) => {
            const kamarTerkait = kamar.find((kmr) => kmr.id === k.kamarId);

            return (
              <article
                key={k.id}
                className="page-card pad flex flex-col"
              >
                <div className="flex justify-between items-start gap-3 mb-3">
                  <h3 className="font-semibold text-slate-800">
                    Kamar {kamarTerkait ? kamarTerkait.nomor : "tidak dikenal"}
                  </h3>
                  <span className={`badge ${statusColor(k.status)}`}>
                    {k.status}
                  </span>
                </div>

                <span className="category-tag w-fit">
                  {k.kategori || "Fasilitas"}
                </span>
                <p className="text-slate-700 text-sm mt-1 mb-1">
                  {k.deskripsi}
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  {formatTanggal(k.tanggal)}
                </p>

                <div className="flex-1" />

                <button
                  type="button"
                  onClick={() => handleStatus(k.id)}
                  disabled={k.status === "Selesai"}
                  className="btn-secondary w-full mt-2"
                >
                  <RefreshCw size={14} aria-hidden="true" />
                  {k.status === "Pending"
                    ? "Mulai proses"
                    : k.status === "Proses"
                      ? "Tandai selesai"
                      : "Sudah selesai"}
                </button>
                <button
                  type="button"
                  onClick={() => setHapusId(k.id)}
                  className="btn-danger-soft w-full mt-2"
                >
                  <Trash2 size={14} aria-hidden="true" /> Hapus
                </button>
              </article>
            );
          })
        ) : (
          <div className="empty-panel col-span-full">
            <p>Tidak ada data keluhan saat ini.</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Tambah Laporan Keluhan" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSimpan} className="modal-body space-y-4">
            <div>
              <label htmlFor="laporan-kamar" className="form-label">
                Pilih kamar
              </label>
              <select
                id="laporan-kamar"
                required
                className="form-input"
                value={formData.kamarId}
                onChange={(e) =>
                  setFormData({ ...formData, kamarId: e.target.value })
                }
              >
                <option value="" disabled>
                  Pilih kamar
                </option>
                {kamar.map((k) => (
                  <option key={k.id} value={k.id}>
                    Kamar {k.nomor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="laporan-kategori" className="form-label">
                Kategori
              </label>
              <select
                id="laporan-kategori"
                required
                className="form-input"
                value={formData.kategori}
                onChange={(e) =>
                  setFormData({ ...formData, kategori: e.target.value })
                }
              >
                <option value="Listrik & Air">Listrik & Air</option>
                <option value="Fasilitas Kamar">Fasilitas Kamar</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="laporan-deskripsi" className="form-label">
                Deskripsi
              </label>
              <textarea
                id="laporan-deskripsi"
                required
                rows={3}
                className="form-input resize-y"
                value={formData.deskripsi}
                onChange={(e) =>
                  setFormData({ ...formData, deskripsi: e.target.value })
                }
                placeholder="Contoh: AC kurang dingin"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="btn-secondary"
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

      {hapusId && (
        <ConfirmDialog
          title="Hapus laporan"
          message="Laporan keluhan ini akan dihapus permanen dari daftar."
          confirmLabel="Ya, hapus"
          onConfirm={handleHapus}
          onClose={() => setHapusId(null)}
        />
      )}
    </div>
  );
};

export default Keluhan;
