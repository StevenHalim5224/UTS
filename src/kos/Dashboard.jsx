import {
  DoorOpen,
  Users,
  Wallet,
  MessageSquare,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useKos } from "../context/kosContext";
const rupiah = (value) => `Rp ${value.toLocaleString("id-ID")}`;

export default function Dashboard() {
  const { kamar, penghuni, transaksi, keluhan } = useKos();
  const terisi = kamar.filter((k) => k.status === "Terisi").length;
  const kosong = kamar.length - terisi;
  const aktif = penghuni.filter((p) => p.statusAktif).length;
  const pemasukan = transaksi
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((s, t) => s + t.jumlah, 0);
  const pengeluaran = transaksi
    .filter((t) => t.tipe === "Pengeluaran")
    .reduce((s, t) => s + t.jumlah, 0);
  const pending = keluhan.filter((k) => k.status !== "Selesai").length;
  const stats = [
    {
      label: "Kamar terisi / total",
      value: `${terisi} / ${kamar.length}`,
      icon: DoorOpen,
    },
    { label: "Penghuni aktif", value: aktif, icon: Users },
    { label: "Laporan terbuka", value: pending, icon: MessageSquare },
    {
      label: "Saldo bersih",
      value: rupiah(pemasukan - pengeluaran),
      icon: Wallet,
      color: "green",
    },
  ];
  return (
    <div className="dashboard space-y-6">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SMARTKOS WORKSPACE</p>
          <h2>Bisnis Anda, dalam kendali.</h2>
          <p>Pantau hunian, keuangan, dan layanan penghuni.</p>
        </div>
        <Link to="/kamar" className="primary-link">
          <DoorOpen size={17} aria-hidden="true" />
          Kelola kamar <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <section className="stats-grid" aria-label="Statistik kos">
        {stats.map(({ label, value, icon: Icon, color = "" }) => (
          <article className={`stat-card ${color}`} key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon size={19} aria-hidden="true" />
            </div>
            <p className="stat-value">{value}</p>
          </article>
        ))}
      </section>
      <div className="dashboard-panels">
        <section className="panel form-panel">
          <h3>Prioritas hari ini</h3>
          <Link className="action-row" to="/kamar">
            <span>
              <DoorOpen size={20} aria-hidden="true" />
              Kamar tersedia
            </span>
            <strong>
              {kosong}
              <ArrowUpRight size={17} aria-hidden="true" />
            </strong>
          </Link>
          <Link className="action-row" to="/keluhan">
            <span>
              <MessageSquare size={20} aria-hidden="true" />
              Laporan penghuni
            </span>
            <strong>
              {pending}
              <ArrowUpRight size={17} aria-hidden="true" />
            </strong>
          </Link>
          <Link className="action-row" to="/penghuni">
            <span>
              <Users size={20} aria-hidden="true" />
              Data penghuni
            </span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
        <section className="panel form-panel">
          <h3>Ringkasan arus kas</h3>
          <div className="cash-row">
            <span className="cash-icon income">
              <ArrowRight size={19} aria-hidden="true" />
            </span>
            <div>
              <strong>Total pemasukan</strong>
              <small>Dana masuk yang tercatat</small>
            </div>
            <b className="income-text">{rupiah(pemasukan)}</b>
          </div>
          <div className="cash-row">
            <span className="cash-icon expense">
              <ArrowUpRight size={19} aria-hidden="true" />
            </span>
            <div>
              <strong>Total pengeluaran</strong>
              <small>Biaya operasional tercatat</small>
            </div>
            <b className="expense-text">{rupiah(pengeluaran)}</b>
          </div>
          <Link to="/keuangan" className="panel-link">
            Lihat rincian keuangan <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Transaksi terbaru</h3>
            <p>Aktivitas keuangan yang terakhir dicatat.</p>
          </div>
          <Link to="/keuangan" className="text-link">
            Lihat semua <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Tipe</th>
                <th className="text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.length ? (
                [...transaksi]
                  .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
                  .slice(0, 4)
                  .map((t) => (
                    <tr key={t.id}>
                      <td>{t.tanggal}</td>
                      <td className="font-medium">{t.keterangan}</td>
                      <td>
                        <span
                          className={`transaction-badge ${t.tipe === "Pemasukan" ? "income" : "expense"}`}
                        >
                          {t.tipe}
                        </span>
                      </td>
                      <td
                        className={`text-right font-semibold whitespace-nowrap ${t.tipe === "Pemasukan" ? "income-text" : "expense-text"}`}
                      >
                        {rupiah(t.jumlah)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-cell">
                    <CheckCircle2 size={24} aria-hidden="true" />
                    <p>Belum ada transaksi. Tambahkan melalui menu Keuangan.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
