import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  Users,
  Wallet,
  MessageSquare,
  LogOut,
  ArrowUpRight,
  Receipt,
  UserRound,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useKos } from "../context/kosContext";

const adminMenus = [
  ["/dashboard", "Ringkasan", LayoutDashboard],
  ["/kamar", "Manajemen kamar", DoorOpen],
  ["/penghuni", "Data penghuni", Users],
  ["/keuangan", "Keuangan", Wallet],
  ["/keluhan", "Laporan penghuni", MessageSquare],
] as const;

const penghuniMenus = [
  ["/dashboard", "Dashboard Saya", LayoutDashboard],
  ["/tagihan-saya", "Tagihan Saya", Receipt],
  ["/keluhan-saya", "Lapor Keluhan", MessageSquare],
  ["/profil", "Profil Saya", UserRound],
] as const;

export default function Sidebar() {
  const { currentUser, logout } = useKos();

  const isAdmin = currentUser?.role === "admin";
  const displayMenus = isAdmin ? adminMenus : penghuniMenus
  return (
    <aside className="sidebar">
      <NavLink
        to="/dashboard"
        className="brand"
        aria-label="SmartKos: Ringkasan"
      >
        <span className="brand-icon">
          <Building2 size={22} aria-hidden="true" />
        </span>
        <span>
          smartkos<span className="brand-dot">.</span>
        </span>
      </NavLink>
      <p className="nav-label">{isAdmin ? "MANAGEMENT WORKSPACE" : "PENGHUNI WORKSPACE"}</p>
      <nav aria-label="Menu dashboard" className="sidebar-nav">
        {displayMenus.map(([path, label, Icon]) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon size={18} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      {isAdmin && (
        <NavLink to="/kamar" className="sidebar-shortcut">
          Kelola Ketersediaan Kamar <ArrowUpRight size={16} aria-hidden="true"/>
        </NavLink>
      )}
      <div className="sidebar-account">
        <span className="avatar">
          {currentUser?.username?.slice(0, 1).toUpperCase() || "U "}
        </span>
        <div>
          <strong>{currentUser?.nama || currentUser?.username}</strong>
          <small>{isAdmin ? "Administrator" : "Penghuni"}</small>
        </div>
      </div>
      <button type="button" onClick={logout} className="logout-button">
        <LogOut size={16} aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
