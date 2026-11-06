import { Building2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type PesanAuth = { type: "" | "error" | "success"; text: string };

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  message?: PesanAuth;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthLayout({
  icon,
  title,
  subtitle,
  message,
  children,
  footer,
}: Props) {
  return (
    <div className="auth-shell">
      <section className="auth-intro">
        <div className="brand">
          <span className="brand-icon">
            <Building2 size={25} />
          </span>
          <span>
            smartkos<span className="brand-dot">.</span>
            <small>MANAGEMENT WORKSPACE</small>
          </span>
        </div>
        <div>
          <p className="eyebrow">UNTUK PENGELOLA KOS</p>
          <h2>
            Catatan kos
            <br />
            <em>yang tidak tercecer.</em>
          </h2>
          <p>
            Kamar mana yang kosong, siapa yang belum bayar, dan laporan apa yang
            masih terbuka. Tidak perlu tanya penghuni satu per satu.
          </p>
          <div className="auth-feature">
            <ShieldCheck size={20} /> Akses pengelola dan penghuni dipisah.
          </div>
        </div>
        <small>SmartKos · Aplikasi manajemen kos</small>
      </section>

      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="mb-8">
            <span className="auth-mark">{icon}</span>
            <h1 className="mb-2">{title}</h1>
            <p className="text-slate-500">{subtitle}</p>
          </div>

          {message?.text && (
            <div
              role="alert"
              className={`notice mb-4 text-center ${
                message.type === "error" ? "notice-danger" : "notice-success"
              }`}
            >
              {message.text}
            </div>
          )}

          {children}

          <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>

          <p className="auth-note mt-6">
            Demo lokal. Data tersimpan di browser ini, bukan di server.
          </p>
        </div>
      </div>
    </div>
  );
}
