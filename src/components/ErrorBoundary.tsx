import { AlertTriangle, RotateCcw, LayoutDashboard } from "lucide-react";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Menangkap error render supaya satu halaman rusak tidak membuat seluruh
 * aplikasi menjadi layar putih.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan yang tidak diketahui.",
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("SmartKos render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-screen">
        <section className="error-card" role="alert">
          <span className="error-icon">
            <AlertTriangle size={26} aria-hidden="true" />
          </span>
          <h1>Aplikasi berhenti di halaman ini</h1>
          <p>
            Data Anda di localStorage tidak dihapus. Muat ulang halaman untuk
            mencoba lagi, atau kembali ke ringkasan.
          </p>
          <pre>{this.state.message}</pre>
          <div className="error-actions">
            <button
              type="button"
              className="primary-link"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={16} aria-hidden="true" /> Muat ulang
            </button>
            <button
              type="button"
              className="secondary-link"
              onClick={() => window.location.assign("/dashboard")}
            >
              <LayoutDashboard size={16} aria-hidden="true" /> Kembali ke
              ringkasan
            </button>
          </div>
        </section>
      </div>
    );
  }
}
