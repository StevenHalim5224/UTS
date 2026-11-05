import { Building2, ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKos } from "../context/kosContext";
import { validasiNomorHp } from "../utils/validasi";

const Auth = () => {
  const { login, register } = useKos();
  const navigate = useNavigate();
  const [isLoginMode,setIsLoginMode] = useState(true)
  const [formData, setFormData] = useState({ nama: "" ,username: "", password: "", confirmPassword: "", nomorHp: "" });
  const [message, setMessage] = useState({type: "", text: ""});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({type: "", text: ""});

    if (isLoginMode) {
      if (login(formData.username, formData.password)) {
        navigate("/dashboard", { replace: true });
      } else {
        setMessage({ type: "error", text: "Username atau Password salah!" });
      }
    } else {
      
      if (formData.password !== formData.confirmPassword) {
        setMessage({ type: "error", text: "Password dan konfirmasi password tidak cocok!" });
        return; 
      }

      if (formData.username.trim().length < 3) {
        setMessage({ type: "error", text: "Username minimal 3 karakter." });
        return;
      }

      if (formData.password.length < 6) {
        setMessage({ type: "error", text: "Password minimal 6 karakter." });
        return;
      }

      if (formData.nomorHp) {
        const galatHp = validasiNomorHp(formData.nomorHp);
        if (galatHp) {
          setMessage({ type: "error", text: galatHp });
          return;
        }
      }
      
      const res = register(formData.nama, formData.username, formData.password, formData.nomorHp);
      if (res.success) {
        setMessage({ type: "success", text: res.message });
        setIsLoginMode(true);
        setFormData({ nama: "", username: "", password: "", confirmPassword: "", nomorHp: "" });
      } else {
        setMessage({ type: "error", text: res.message });
      }
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setMessage({type: "", text: ""})
    setFormData({nama: "", username: "", password: "", confirmPassword: "", nomorHp: ""})
  }

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
            <span className="auth-mark">
              {isLoginMode ? <Building2 size={27} /> : <UserPlus size={27}/>}
            </span>
            <h1 className="mb-2">
              {isLoginMode ? "Selamat datang kembali" : "Daftar Akun Baru"}
            </h1>
            <p className="text-slate-500">
              {isLoginMode ? "Masuk ke Workspace Smartkos" : "Buat Akun Penghuni"}
            </p>
          </div>

          {message.text && (
            <div
              role="alert"
              className={`notice mb-4 text-center ${
                message.type === "error"
                  ? "notice-danger"
                  : "notice-success"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label htmlFor="nama" className="form-label">
                  Nama Lengkap
                </label>
                <input
                  id="nama"
                  autoComplete="name"
                  placeholder="Masukkan nama lengkap"
                  type="text"
                  required
                  minLength={2}
                  className="form-input"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>
            )}

            <div>
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <input
                id="username"
                autoComplete="username"
                placeholder="Masukkan username"
                type="text"
                required
                className="form-input"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="nomorHp" className="form-label">
                  Nomor HP (opsional)
                </label>
                <input
                  id="nomorHp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={13}
                  aria-describedby="petunjuk-nomorHp"
                  placeholder="Nomor HP yang terdaftar di kos"
                  className="form-input"
                  value={formData.nomorHp}
                  onChange={(e) =>
                    setFormData({ ...formData, nomorHp: e.target.value.replace(/\D/g, "") })
                  }
                />
                <p id="petunjuk-nomorHp" className="text-xs text-slate-500 mt-1">
                  Nomor HP tidak langsung menautkan akun. Admin akan memeriksa
                  dan menyetujui permintaan Anda.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                autoComplete={isLoginMode ? "current-password" : "new-password"}
                placeholder="Masukkan password"
                type="password"
                required
                className="form-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Konfirmasi Password
                </label>
                <input
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  type="password"
                  required
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn-primary mt-6 w-full"
            >
              {isLoginMode ? "Masuk ke dashboard" : "Daftar Akun"} 
              <ArrowRight size={17} />
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-600">
            {isLoginMode ? "Belum punya akun? " : "Sudah punya akun? "}
            <button 
              type="button"
              onClick={toggleMode}
              className="font-semibold text-sky-700 hover:underline transition-colors"
            >
              {isLoginMode ? "Daftar sebagai penghuni" : "Masuk di sini"}
            </button>
          </div>
          
          <p className="auth-note mt-6">
            Demo lokal. Data tersimpan di browser ini, bukan di server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
