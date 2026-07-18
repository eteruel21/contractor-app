import type { ReactNode } from "react";
import {
  Briefcase,
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  Calculator,
  DollarSign,
  Settings,
} from "lucide-react";

export type Tab = "dashboard" | "users" | "catalog" | "calculations" | "pricing" | "system";

interface NavButtonProps {
  icon: ReactNode;
  label: string;
  tab: Tab;
  active: Tab;
  onClick: (tab: Tab) => void;
  badge?: number;
}

function NavButton({ icon, label, tab, active, onClick, badge }: NavButtonProps) {
  return (
    <button
      className={`nav-item ${active === tab ? "active" : ""}`}
      onClick={() => onClick(tab)}
    >
      {icon}
      <span>{label}</span>
      {Boolean(badge) && <strong className="nav-badge">{badge}</strong>}
    </button>
  );
}

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  pendingUsersCount: number;
  email: string;
  onSignOut: () => void;
}

export function Sidebar({ activeTab, setActiveTab, pendingUsersCount, email, onSignOut }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Briefcase size={24} />
        <span>Contractor Pro</span>
      </div>
      <nav className="nav-links">
        <NavButton icon={<LayoutDashboard />} label="Resumen" tab="dashboard" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={<Users />} label="Usuarios" tab="users" active={activeTab} onClick={setActiveTab} badge={pendingUsersCount} />
        <NavButton icon={<BookOpen />} label="Catálogo" tab="catalog" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={<Calculator />} label="Cálculos" tab="calculations" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={<DollarSign />} label="Precios" tab="pricing" active={activeTab} onClick={setActiveTab} />
        <NavButton icon={<Settings />} label="Sistema" tab="system" active={activeTab} onClick={setActiveTab} />
      </nav>
      <div className="sidebar-footer">
        <strong>Superadministrador</strong>
        <span>{email}</span>
        <button className="button button-ghost button-block" onClick={onSignOut}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
