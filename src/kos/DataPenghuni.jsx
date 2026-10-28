import { Plus, X, Trash2, LogOut } from "lucide-react";
import React, { useState } from "react";
import { useKos } from "../context/kosContext";

const DataPenghuni = () => {
  const {
    penghuni,
    kamar,
    tambahPenghuni,
    keluarPenghuni,
    hapusDataPenghuniLama,
  } = useKos();

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nama: "",
    nomorHp: "",
    kamarId: "",
  });

  // Menyaring hanya kamar yang statusnya "Kosong" untuk dropdown pilihan
  const kamarKosong = kamar ? kamar.filter((k) => k.status === "Kosong") : [];
  const filterNomor = String(formData.nomorHp).length;

  const handleBukaModal = () => {
    setFormData({ nama: "", nomorHp: "", kamarId: "" });
    setShowModal(true);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    if (!formData.kamarId) {
      alert("Gagal: Silakan pilih kamar terlebih dahulu!");
      return;
    }

    if (filterNomor < 10 || filterNomor > 13) {
      alert(
        "Gagal: Nomor HP tidak valid! nomor harus berjumlah 10 hingga 13 digit angka",
      );
      return;
    }

    tambahPenghuni(formData);
    alert("Penghuni baru berhasil ditambahkan dan kamar Terisi!");
    setShowModal(false);
  };

  const handleCheckout = (id, nama) => {
    if (
      window.confirm(
        `Yakin ingin melakukan checkout untuk penghuni ${nama}? Kamar yang ditinggalkan akan kembali berstatus Kosong.`,
      )
    ) {
      keluarPenghuni(id);
      alert(`Penghuni ${nama} berhasil di-checkout!`);
    }
  };

  const handleHapus = (id, nama) => {
    if (
      window.confirm(
        `Yakin ingin menghapus data penghuni ${nama} secara permanen?`,
      )
    ) {
      hapusDataPenghuniLama(id);
      alert(`Data ${nama} berhasil dihapus!`);
    }
  };
  // Fungsi bantuan untuk mencari nomor kamar berdasarkan ID
  const getNomorKamar = (kamarId) => {
    const targetKamar = kamar?.find((k) => k.id === kamarId);
    return targetKamar ? targetKamar.nomor : "Tidak diketahui";
  };

  return (
    <div className="space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-xl font-bold text-slate-800">Data Penghuni</h2>
          <p className="text-sm text-slate-500">
            Kelola data penghuni dan alokasi kamar kos.
          </p>
        </div>
        <button
          onClick={handleBukaModal}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={17} aria-hidden="true" /> Tambah Penghuni
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama Penghuni</th>
                <th className="px-6 py-4 font-semibold">Kontak</th>
                <th className="px-6 py-4 font-semibold">Kamar</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {penghuni && penghuni.length > 0 ? (
                penghuni.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {p.nama}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.nomorHp}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      Kamar {getNomorKamar(p.kamarId)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.statusAktif
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.statusAktif ? "Aktif" : "Sudah Keluar"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {p.statusAktif ? (
                        /* Tombol Checkout HANYA muncul jika penghuni masih Aktif */
                        <button
                          onClick={() => handleCheckout(p.id, p.nama)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-red-200"
                        >
                          <LogOut size={14} aria-hidden="true" /> Checkout
                        </button>
                      ) : (
                        /* Tombol Hapus HANYA muncul jika penghuni Sudah Keluar */
                        <button
                          onClick={() => handleHapus(p.id, p.nama)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-slate-300"
                        >
                          <Trash2 size={14} aria-hidden="true" /> Hapus
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada data penghuni.
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
                Tambah Penghuni Baru
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
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData({ ...formData, nama: e.target.value })
                  }
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nomor Kontak / WA
                </label>
                <input
                  type="tel"
                  required
                  maxLength="13"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.nomorHp}
                  onChange={(e) => {
                    //memaksa hanyalah angka
                    const hanyaAngka = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, nomorHp: hanyaAngka });
                  }}
                  placeholder="Contoh: 08123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pilih Kamar (Kosong)
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.kamarId}
                  onChange={(e) =>
                    setFormData({ ...formData, kamarId: e.target.value })
                  }
                >
                  <option value="">-- Silakan Pilih Kamar --</option>
                  {kamarKosong.map((k) => (
                    <option key={k.id} value={k.id}>
                      Kamar {k.nomor} - {k.tipe} (Rp{" "}
                      {k.harga?.toLocaleString("id-ID") || "0"})
                    </option>
                  ))}
                </select>
                {kamarKosong.length === 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    Semua kamar penuh. Silakan tambah kamar baru atau checkout
                    penghuni.
                  </p>
                )}
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
                  disabled={kamarKosong.length === 0}
                  className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg font-medium transition-colors"
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

export default DataPenghuni;
