import { Plus, X, Trash2, RefreshCw } from "lucide-react";
import React, { useState } from "react";
import { useKos } from "../context/kosContext";

const Keluhan = () => {
  const { keluhan, kamar, ubahStatusKeluhan, tambahKeluhan, hapusKeluhan } =
    useKos();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    kamarId: "",
    kategori: "Listrik & Air",
    deskripsi: "",
  });

  // Fungsi pembantu untuk mendapatkan warna badge sesuai status
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-rose-100 text-rose-700";
      case "Proses":
        return "bg-amber-100 text-amber-700";
      case "Selesai":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const handleBukaModal = () => {
    setFormData({
      kamarId: "",
      kategori: "Listrik & Air",
      deskripsi: "",
    });
    setShowModal(true);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    if (!formData.kamarId || !formData.deskripsi) return;

    tambahKeluhan({
      kamarId: formData.kamarId,
      kategori: formData.kategori,
      deskripsi: formData.deskripsi,
    });

    setShowModal(false);
  };

  const handleHapus = (id) => {
    if (
      window.confirm(
        "Yakin ingin menghapus laporan keluhan ini secara permanen?",
      )
    ) {
      hapusKeluhan(id);
      alert("Keluhan berhasil dihapus!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Keluhan Penghuni
          </h2>
          <p className="text-slate-500">
            Daftar laporan dan perbaikan fasilitas kos.
          </p>
        </div>
        <button
          onClick={handleBukaModal}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus size={17} aria-hidden="true" /> Buat Laporan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keluhan.length > 0 ? (
          keluhan.map((k) => {
            // Mencari nomor kamar berdasarkan kamarId dari data keluhan
            const kamarTerkait = kamar.find((kmr) => kmr.id === k.kamarId);

            return (
              <div
                key={k.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800">
                    Kamar {kamarTerkait ? kamarTerkait.nomor : "Unknown"}
                  </h3>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${getStatusColor(k.status)}`}
                  >
                    {k.status}
                  </span>
                </div>

                <p className="text-slate-600 text-sm mb-1">{k.deskripsi}</p>
                <p className="text-xs text-slate-400 mb-4">{k.tanggal}</p>

                <div className="flex-1"></div>

                <button
                  onClick={() => ubahStatusKeluhan(k.id)}
                  className="w-full mt-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw size={14} aria-hidden="true" /> Ubah Status
                </button>
                <button
                  onClick={() => handleHapus(k.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-medium border border-red-200 transition-colors"
                >
                  <Trash2 size={14} aria-hidden="true" /> Hapus
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500">Tidak ada data keluhan saat ini.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">
                Tambah Laporan Keluhan
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Tutup form"
                className="text-xl font-bold text-slate-400 hover:text-slate-600"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSimpan} className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Pilih Kamar
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.kamarId}
                  onChange={(e) =>
                    setFormData({ ...formData, kamarId: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Pilih Kamar
                  </option>
                  {kamar.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kamar {k.nomor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Kategori
                </label>
                <select
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Deskripsi
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full resize-y rounded-lg border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Contoh: AC kurang dingin"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Keluhan;
