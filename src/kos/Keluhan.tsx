import { RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../components/Toast";
import { useKos } from "../context/kosContext";
import { formatTanggal, statusColor } from "../utils/format";

const Keluhan = () => {
  const { keluhan, kamar, ubahStatusKeluhan, hapusKeluhan } = useKos();
  const { notify } = useToast();
  const [hapusId, setHapusId] = useState<string | null>(null);

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
