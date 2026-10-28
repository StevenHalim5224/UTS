import {
  Building2,
  LayoutDashboard,
  DoorOpen,
  Users,
  Wallet,
  MessageSquare,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useKos } from "../context/kosContext";

const menus = [
  ["/dashboard", "Ringkasan", LayoutDashboard],
  ["/kamar", "Manajemen kamar", DoorOpen],
  ["/penghuni", "Data penghuni", Users],
  ["/keuangan", "Keuangan", Wallet],
  ["/keluhan", "Laporan penghuni", MessageSquare],
];

export default function Sidebar() {
  const { currentUser, logout } = useKos();
  return (
    <aside className="sidebar">
      <NavLink
        to="/dashboard"
        className="brand"
        aria-label="SmartKos — Ringkasan"
      >
        <span className="brand-icon">
          <Building2 size={22} aria-hidden="true" />
        </span>
        <span>
          smartkos<span className="brand-dot">.</span>
        </span>
      </NavLink>
      <p className="nav-label">MANAGEMENT WORKSPACE</p>
      <nav aria-label="Menu dashboard" className="sidebar-nav">
        {menus.map(([path, label, Icon]) => (
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
      <NavLink to="/kamar" className="sidebar-shortcut">
        Kelola ketersediaan kamar <ArrowUpRight size={16} aria-hidden="true" />
      </NavLink>
      <div className="sidebar-account">
        <span className="avatar">
          {currentUser?.username?.slice(0, 1).toUpperCase()}
        </span>
        <div>
          <strong>{currentUser?.username}</strong>
          <small>Administrator</small>
        </div>
      </div>
      <button type="button" onClick={logout} className="logout-button">
        <LogOut size={16} aria-hidden="true" />
        <span>Logout</span>
      </button>
    </aside>
  );
}
