import { ArrowRight, Building2 } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useKos } from "../context/kosContext";
import AuthLayout from "./AuthLayout";

export default function Login() {
  const { login } = useKos();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "" | "error" | "success";
    text: string;
  }>(() => {
    const pesan = (location.state as { pesan?: string } | null)?.pesan;
    return pesan ? { type: "success", text: pesan } : { type: "", text: "" };
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage({ type: "", text: "" });

    if (login(username, password)) {
      navigate("/dashboard", { replace: true });
      return;
    }

    setMessage({ type: "error", text: "Username atau Password salah!" });
  };

  return (
    <AuthLayout
      icon={<Building2 size={27} />}
      title="Selamat datang kembali"
      subtitle="Masuk ke Workspace Smartkos"
      message={message}
      footer={
        <>
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="font-semibold text-sky-700 hover:underline transition-colors"
          >
            Daftar sebagai penghuni
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            type="password"
            required
            className="form-input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary mt-6 w-full">
          Masuk ke dashboard
          <ArrowRight size={17} />
        </button>
      </form>
    </AuthLayout>
  );
}
