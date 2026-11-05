import { Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import { formatTanggal, statusColor } from "../utils/format";

const KeluhanPenghuni = () => {
  const { keluhan, penghuniSaya, kamarSaya, tambahKeluhan, hapusKeluhan, currentUser } = useKos();
  const { notify } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [hapusId, setHapusId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    kategori: "Listrik & Air",
    deskripsi: "",
  });

  const keluhanSaya = keluhan.filter((k) => k.kamarId === penghuniSaya?.kamarId);

  const handleSimpan = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!penghuniSaya?.kamarId) return;

    const hasil = tambahKeluhan({
      kamarId: penghuniSaya.kamarId,
      kategori: formData.kategori,
      deskripsi: formData.deskripsi,
    });

    if (!hasil.success) {
      notify(hasil.message, "error");
      return;
    }

    notify(hasil.message);
    setFormData({ kategori: "Listrik & Air", deskripsi: "" });
    setShowModal(false);
  };

  const handleHapus = () => {
    if (!hapusId) return;
    const hasil = hapusKeluhan(hapusId);
    if (!hasil.success) notify(hasil.message, "error");
    else notify(hasil.message);
  };

  if (currentUser?.role === "admin") {
    return (
      <div className="space-y-6">
        <div className="page-heading">
          <div>
            <p className="eyebrow">PENGHUNI WORKSPACE</p>
            <h2 className="text-2xl font-bold text-slate-800">Keluhan Saya</h2>
          </div>
        </div>
        <div className="empty-panel">
          <h3>Halaman khusus penghuni</h3>
          <p>
            Kelola laporan semua penghuni melalui menu Laporan Penghuni.
          </p>
          <Link to="/keluhan" className="primary-link">
            Buka Laporan Penghuni
          </Link>
        </div>
      </div>
    );
  }

  if (!penghuniSaya) {
    return (
      <div className="empty-panel">
        <h3>Belum Mendapat Kamar</h3>
        <p>Anda belum terhubung ke kamar manapun. Silakan hubungi admin kos.</p>
      </div>
    );
  }

  if (!penghuniSaya.statusAktif) {
    return (
      <div className="empty-panel">
        <h3>Status Sudah Keluar</h3>
        <p>Data penghuni Anda sudah tidak aktif. Hubungi admin kos jika masih menempati kamar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="page-heading flex justify-between items-center">
        <div>
          <p className="eyebrow">PENGHUNI WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">Keluhan Saya</h2>
          <p className="text-slate-500 text-sm">
            Laporkan kendala fasilitas di Kamar {kamarSaya ? kamarSaya.nomor : ""} Anda.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          <Plus size={17} aria-hidden="true" /> Buat Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keluhanSaya.length > 0 ? (
          keluhanSaya.map((k) => (
            <div key={k.id} className="page-card pad flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-3 mb-3">
                  <span className="category-tag">
                    {k.kategori || "Fasilitas"}
                  </span>
                  <span className={`badge ${statusColor(k.status)}`}>
                    {k.status}
                  </span>
                </div>
                <p className="text-slate-600 text-sm mb-2 font-medium">{k.deskripsi}</p>
                <p className="text-xs text-slate-500 mb-4">
                  {formatTanggal(k.tanggal)}
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHapusId(k.id)}
                  className="btn-danger-soft btn-sm"
                >
                  <Trash2 size={14} aria-hidden="true" /> Batalkan laporan
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-panel col-span-full">
            <p>Belum ada riwayat keluhan untuk kamar Anda.</p>
          </div>
        )}
      </div>

      {showModal && (
        <Modal
          title="Buat Laporan Keluhan Baru"
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSimpan} className="modal-body space-y-4">
            <div>
              <label htmlFor="keluhan-kategori" className="form-label">
                Kategori kendala
              </label>
              <select
                id="keluhan-kategori"
                required
                className="form-input"
                value={formData.kategori}
                onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
              >
                <option value="Listrik & Air">Listrik & Air</option>
                <option value="Fasilitas Kamar">Fasilitas Kamar</option>
                <option value="Keamanan">Keamanan</option>
                <option value="Kebersihan">Kebersihan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="keluhan-deskripsi" className="form-label">
                Deskripsi keluhan
              </label>
              <textarea
                id="keluhan-deskripsi"
                required
                rows={3}
                className="form-input resize-y"
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Contoh: Lampu kamar mandi mati"
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
              <button
                type="submit"
                className="btn-primary"
              >
                Kirim Laporan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {hapusId && (
        <ConfirmDialog
          title="Batalkan laporan"
          message="Laporan keluhan ini akan dihapus dari daftar. Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Ya, hapus"
          onConfirm={handleHapus}
          onClose={() => setHapusId(null)}
        />
      )}
    </div>
  );
};

export default KeluhanPenghuni;
