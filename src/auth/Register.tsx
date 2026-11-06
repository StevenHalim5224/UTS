import { ArrowRight, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKos } from "../context/kosContext";
import { validasiNomorHp } from "../utils/validasi";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const { register } = useKos();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: "",
    username: "",
    password: "",
    confirmPassword: "",
    nomorHp: "",
  });
  const [message, setMessage] = useState<{
    type: "" | "error" | "success";
    text: string;
  }>({ type: "", text: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.password !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "Password dan konfirmasi password tidak cocok!",
      });
      return;
    }

    if (form.username.trim().length < 3) {
      setMessage({ type: "error", text: "Username minimal 3 karakter." });
      return;
    }

    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }

    if (form.nomorHp) {
      const galatHp = validasiNomorHp(form.nomorHp);
      if (galatHp) {
        setMessage({ type: "error", text: galatHp });
        return;
      }
    }

    const hasil = register(
      form.nama,
      form.username,
      form.password,
      form.nomorHp,
    );

    if (hasil.success) {
      navigate("/login", { replace: true, state: { pesan: hasil.message } });
      return;
    }

    setMessage({ type: "error", text: hasil.message });
  };

  return (
    <AuthLayout
      icon={<UserPlus size={27} />}
      title="Daftar Akun Baru"
      subtitle="Buat Akun Penghuni"
      message={message}
      footer={
        <>
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="font-semibold text-sky-700 hover:underline transition-colors"
          >
            Masuk di sini
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={form.nama}
            onChange={(event) => setForm({ ...form, nama: event.target.value })}
          />
        </div>

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
            value={form.username}
            onChange={(event) =>
              setForm({ ...form, username: event.target.value })
            }
          />
        </div>

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
            value={form.nomorHp}
            onChange={(event) =>
              setForm({ ...form, nomorHp: event.target.value.replace(/\D/g, "") })
            }
          />
          <p id="petunjuk-nomorHp" className="text-xs text-slate-500 mt-1">
            Nomor HP tidak langsung menautkan akun. Admin akan memeriksa dan
            menyetujui permintaan Anda.
          </p>
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            autoComplete="new-password"
            placeholder="Masukkan password"
            type="password"
            required
            className="form-input"
            value={form.password}
            onChange={(event) =>
              setForm({ ...form, password: event.target.value })
            }
          />
        </div>

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
            value={form.confirmPassword}
            onChange={(event) =>
              setForm({ ...form, confirmPassword: event.target.value })
            }
          />
        </div>

        <button type="submit" className="btn-primary mt-6 w-full">
          Daftar Akun
          <ArrowRight size={17} />
        </button>
      </form>
    </AuthLayout>
  );
}
