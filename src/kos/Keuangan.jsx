import { Plus, X } from "lucide-react";
import React, { useState } from "react";
import { useKos } from "../context/kosContext";

const Keuangan = () => {
  const { transaksi, tambahTransaksi } = useKos();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    keterangan: "",
    jumlah: "",
    tipe: "Pemasukan",
  });

  // Menghitung total secara dinamis dari data context
  const totalPemasukan = transaksi
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((total, item) => total + item.jumlah, 0);

  const totalPengeluaran = transaksi
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((total, item) => total + item.jumlah, 0);

  const saldoBersih = totalPemasukan - totalPengeluaran;

  const handleBukaModal = () => {
    setFormData({ keterangan: "", jumlah: "", tipe: "Pemasukan" });
    setShowModal(true);
  };

  const handleSimpan = (e) => {
    e.preventDefault();
    tambahTransaksi({
      keterangan: formData.keterangan,
      jumlah: Number(formData.jumlah),
      tipe: formData.tipe,
    });
    alert("Transaksi berhasil ditambahkan!");
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2 className="text-2xl font-bold text-slate-800">
            Manajemen Keuangan
          </h2>
          <p className="text-sm text-slate-500">
            Pantau pemasukan, pengeluaran, dan saldo bersih kos.
          </p>
        </div>
        <button
          onClick={handleBukaModal}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={17} aria-hidden="true" /> Tambah Transaksi
        </button>
      </div>

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl">
          <p className="text-sm font-medium text-emerald-700 mb-1">
            Saldo Bersih
          </p>
          <p className="text-2xl font-bold text-emerald-700">
            Rp {saldoBersih.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
          <p className="text-sm font-medium text-blue-700 mb-1">
            Total Pemasukan
          </p>
          <p className="text-2xl font-bold text-blue-700">
            Rp {totalPemasukan.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-red-50 border border-red-100 p-5 rounded-xl">
          <p className="text-sm font-medium text-red-700 mb-1">
            Total Pengeluaran
          </p>
          <p className="text-2xl font-bold text-red-700">
            Rp {totalPengeluaran.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Riwayat Transaksi</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Tanggal</th>
                <th className="px-6 py-4 font-semibold">Keterangan</th>
                <th className="px-6 py-4 font-semibold">Tipe</th>
                <th className="px-6 py-4 font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaksi && transaksi.length > 0 ? (
                transaksi.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-600">{t.tanggal}</td>
                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {t.keterangan}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          t.tipe === "Pemasukan"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {t.tipe}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-right font-bold ${
                        t.tipe === "Pemasukan"
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {t.tipe === "Pemasukan" ? "+" : "-"} Rp{" "}
                      {t.jumlah.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Transaksi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800">
                Tambah Transaksi Baru
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
                  Keterangan
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.keterangan}
                  onChange={(e) =>
                    setFormData({ ...formData, keterangan: e.target.value })
                  }
                  placeholder="Contoh: Bayar Listrik / Sewa Kamar"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipe Transaksi
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.tipe}
                  onChange={(e) =>
                    setFormData({ ...formData, tipe: e.target.value })
                  }
                >
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Pengeluaran">Pengeluaran</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  value={formData.jumlah}
                  onChange={(e) =>
                    setFormData({ ...formData, jumlah: e.target.value })
                  }
                  placeholder="Contoh: 500000"
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

export default Keuangan;
