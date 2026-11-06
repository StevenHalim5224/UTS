import { CalendarDays } from "lucide-react";
import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { KosProvider, useKos } from "./context/kosContext";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./kos/Sidebar";

const Dashboard = lazy(() => import("./kos/Dashboard"));
const DataPenghuni = lazy(() => import("./kos/DataPenghuni"));
const Keluhan = lazy(() => import("./kos/Keluhan"));
const KeluhanPenghuni = lazy(() => import("./kos/KeluhanPenghuni"));
const Keuangan = lazy(() => import("./kos/Keuangan"));
const ManajemenKamar = lazy(() => import("./kos/ManajemenKamar"));
const TagihanSaya = lazy(() => import("./kos/TagihanSaya"));
const Profil = lazy(() => import("./kos/Profil"));

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function PageFallback() {
  return (
    <div className="page-fallback" role="status" aria-live="polite">
      Memuat halaman…
    </div>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useKos();
  if (currentUser?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

/** Halaman login tidak perlu ditampilkan lagi kalau sesi masih aktif. */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useKos();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function ProtectedLayout() {
  const { currentUser } = useKos();
  const tanggal = useMemo(() => tanggalFormatter.format(new Date()), []);

  if (!currentUser) return <Navigate to="/login" replace />;
  const isAdmin = currentUser.role === "admin";

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-workspace">
        <header className="topbar">
          <span>
            <span className="status-dot" />
            {isAdmin ? "Admin portal" : "Portal penghuni"}
          </span>
          <span className="topbar-date">
            <CalendarDays size={15} aria-hidden="true" />
            {tanggal}
          </span>
        </header>
        <main className="app-main">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/penghuni"
                element={
                  <AdminRoute>
                    <DataPenghuni />
                  </AdminRoute>
                }
              />
              <Route
                path="/keluhan"
                element={
                  <AdminRoute>
                    <Keluhan />
                  </AdminRoute>
                }
              />
              <Route
                path="/keuangan"
                element={
                  <AdminRoute>
                    <Keuangan />
                  </AdminRoute>
                }
              />
              <Route
                path="/kamar"
                element={
                  <AdminRoute>
                    <ManajemenKamar />
                  </AdminRoute>
                }
              />

              <Route path="/tagihan-saya" element={<TagihanSaya />} />
              <Route path="/keluhan-saya" element={<KeluhanPenghuni />} />
              <Route path="/profil" element={<Profil />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <KosProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <Login />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <Register />
                  </GuestRoute>
                }
              />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </KosProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
