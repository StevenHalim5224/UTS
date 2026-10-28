import { Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKos } from "../context/kosContext";

const Auth = () => {
  const { login } = useKos();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (login(formData.username, formData.password)) {
      navigate("/dashboard", { replace: true });
    } else {
      setError("Username atau password salah!");
    }
  };

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
          <p className="eyebrow">RUANG UNTUK LEBIH TENANG</p>
          <h2>
            Bisnis Anda.
            <br />
            <em>Dalam kendali.</em>
          </h2>
          <p>
            Dari kamar hingga keuangan, semua yang Anda butuhkan untuk mengelola
            kos ada di satu tempat.
          </p>
          <div className="auth-feature">
            <ShieldCheck size={20} /> Teratur. Terpantau. Terkendali.
          </div>
        </div>
        <small>SmartKos · Manajemen kos yang lebih mudah</small>
      </section>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <div className="mb-8">
            <span className="auth-mark">
              <Building2 size={27} />
            </span>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Selamat datang kembali
            </h1>
            <p className="text-slate-500">Masuk ke workspace admin SmartKos.</p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 p-3 bg-rose-100 text-rose-700 text-sm rounded-lg font-medium text-center"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                placeholder="Masukkan username"
                type="text"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                type="password"
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors mt-6"
            >
              Masuk ke dashboard <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-note">
            Kelola kamar, penghuni, dan keuangan dengan mudah.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
