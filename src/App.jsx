import { CalendarDays } from "lucide-react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { KosProvider, useKos } from "./context/kosContext";
import Auth from "./auth/Auth";
import Sidebar from "./kos/Sidebar";
import Dashboard from "./kos/Dashboard";
import DataPenghuni from "./kos/DataPenghuni";
import Keluhan from "./kos/keluhan";
import Keuangan from "./kos/Keuangan";
import ManajemenKamar from "./kos/ManajemenKamar";

function ProtectedLayout() {
  const { currentUser } = useKos();
  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-workspace">
        <header className="topbar">
          <span>
            <span className="status-dot" />
            Admin portal
          </span>
          <span className="topbar-date">
            <CalendarDays size={15} aria-hidden="true" />
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              timeZone: "Asia/Jakarta",
            }).format(new Date())}
          </span>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/penghuni" element={<DataPenghuni />} />
            <Route path="/keluhan" element={<Keluhan />} />
            <Route path="/keuangan" element={<Keuangan />} />
            <Route path="/kamar" element={<ManajemenKamar />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
export default function App() {
  return (
    <KosProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Auth />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </BrowserRouter>
    </KosProvider>
  );
}
