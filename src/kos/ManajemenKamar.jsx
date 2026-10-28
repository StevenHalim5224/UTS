import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useKos } from "../context/kosContext";

const ManajemenKamar = () => {
  const { kamar, tambahKamar, editKamar, hapusKamar } = useKos();
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("tambah");
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    nomor: "",
    tipe: "Reguler",
    harga: "",
  });

  const handleBukaModalTambah = () => {
    setModalMode("tambah");
    setFormData({ nomor: "", tipe: "Reguler", harga: "" });
    setShowModal(true);
  };

  const handleBukaModalEdit = (dataKamar) => {
    setModalMode("edit");
    setEditId(dataKamar.id);
    setFormData({
      nomor: dataKamar.nomor,
      tipe: dataKamar.tipe,
      harga: dataKamar.harga,
    });
    setShowModal(true);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    if (modalMode === "tambah") {
      tambahKamar({ ...formData, harga: Number(formData.harga) });
      alert("Kamar baru berhasil ditambahkan!");
    } else {
      editKamar(editId, { ...formData, harga: Number(formData.harga) });
      alert("Data kamar berhasil diperbarui!");
    }
    setShowModal(false);
  };

  const handleHapus = (id, nomorKamar, status) => {
    if (status === "Terisi") {
      alert(` Gagal: Kamar ${nomorKamar} sedang terisi`);
      return;
    }

    if (
      window.confirm(
        `Yakin ingin menghapus kamar ${nomorKamar} secara permanen?`,
      )
    ) {
      hapusKamar(id);
      alert(` Kamar ${nomorKamar} berhasil dihapus`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kamar</h2>
          <p className="text-sm text-slate-500">Kelola daftar kamar kos Anda</p>
        </div>
        <button
          onClick={handleBukaModalTambah}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={17} aria-hidden="true" /> Tambah Kamar
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nomor</th>
                <th className="px-6 py-4 font-semibold">Tipe Kamar</th>
                <th className="px-6 py-4 font-semibold">Harga (Rp)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kamar && kamar.length > 0 ? (
                kamar.map((k) => (
                  <tr
                    key={k.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {k.nomor}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{k.tipe}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {/* 3. Render defensif: Jika harga rusak/kosong, tampilkan 0 untuk mencegah crash */}
                      {k.harga ? k.harga.toLocaleString("id-ID") : "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          k.status === "Kosong"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {k.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleBukaModalEdit(k)}
                        className="text-sky-600 hover:text-sky-800 font-medium px-2 py-1 bg-sky-50 hover:bg-sky-100 rounded transition-colors"
                      >
                        <Pencil size={14} aria-hidden="true" /> Edit
                      </button>
                      <button
                        onClick={() => handleHapus(k.id, k.nomor, k.status)}
                        className="text-rose-600 hover:text-rose-800 font-medium px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded transition-colors"
                      >
                        <Trash2 size={14} aria-hidden="true" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada data kamar. Silakan tambah kamar baru.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                {modalMode === "tambah"
                  ? "Tambah Kamar Baru"
                  : "Edit Data Kamar"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Tutup form"
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSimpan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor Kamar
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.nomor}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor: e.target.value })
                  }
                  placeholder="Contoh: 101"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Kamar
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.tipe}
                  onChange={(e) =>
                    setFormData({ ...formData, tipe: e.target.value })
                  }
                >
                  <option value="Reguler">Reguler (Non-AC)</option>
                  <option value="AC">AC</option>
                  <option value="AC + KM Dalam">AC + KM Dalam</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Harga Sewa (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.harga}
                  onChange={(e) =>
                    setFormData({ ...formData, harga: e.target.value })
                  }
                  placeholder="Contoh: 1500000"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  aria-label="Tutup form"
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium transition-colors"
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

export default ManajemenKamar;
