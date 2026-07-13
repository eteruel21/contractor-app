import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Server,
  Activity,
  UserCheck,
  TrendingUp,
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data of contractors/companies
  const mockContractors = [
    {
      id: "1",
      name: "Constructora Horizon PA",
      owner: "Carlos Mendoza",
      email: "carlos.m@horizon.com",
      projects: 14,
      status: "active",
      joined: "2026-04-12",
    },
    {
      id: "2",
      name: "Teruel & Asociados",
      owner: "Eliel Teruel",
      email: "eteruel21@gmail.com",
      projects: 22,
      status: "active",
      joined: "2026-05-01",
    },
    {
      id: "3",
      name: "Reformas Integrales Balboa",
      owner: "Ana Victoria Díaz",
      email: "ventas@reformasbalboa.com",
      projects: 5,
      status: "active",
      joined: "2026-06-15",
    },
    {
      id: "4",
      name: "Electricidad y Gypsum Pro",
      owner: "Jorge Luis Pinto",
      email: "jorge.pinto@gmail.com",
      projects: 8,
      status: "pending",
      joined: "2026-07-10",
    },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar Nav */}
      <div className="sidebar">
        <div className="sidebar-brand">
          <Briefcase size={24} />
          <span>Contractor Pro</span>
        </div>

        <div className="nav-links">
          <div
            onClick={() => setActiveTab("dashboard")}
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            onClick={() => setActiveTab("contractors")}
            className={`nav-item ${activeTab === "contractors" ? "active" : ""}`}
          >
            <Users size={18} />
            <span>Contratistas</span>
          </div>

          <div
            onClick={() => setActiveTab("settings")}
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Ajustes del Sistema</span>
          </div>
        </div>
      </div>

      {/* Main Admin Page Content */}
      <div className="main-content">
        <div className="header">
          <div className="title-container">
            <h1>Super Admin Panel</h1>
            <p>Monitoreo global de Contractor Pro</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <Server size={20} className="stat-icon" />
            <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#22c55e" }}>
              API: ONLINE
            </span>
          </div>
        </div>

        {/* Dashboard stats view */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Contratistas</span>
              <Briefcase size={16} className="stat-icon" />
            </div>
            <div className="stat-value">24</div>
            <div className="stat-desc">+3 esta semana</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Proyectos Activos</span>
              <Activity size={16} className="stat-icon" />
            </div>
            <div className="stat-value">156</div>
            <div className="stat-desc">+12 esta semana</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Clientes Registrados</span>
              <UserCheck size={16} className="stat-icon" />
            </div>
            <div className="stat-value">432</div>
            <div className="stat-desc">Auto-vinculados: 89%</div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Crecimiento Mensual</span>
              <TrendingUp size={16} className="stat-icon" />
            </div>
            <div className="stat-value">+28%</div>
            <div className="stat-desc">Objetivo: 20%</div>
          </div>
        </div>

        {/* Data list view */}
        <div className="data-table-container">
          <div className="table-header">
            <h3>Contratistas Registrados recientemente</h3>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Empresa / Contratista</th>
                <th>Administrador</th>
                <th>Email de Contacto</th>
                <th>Proyectos</th>
                <th>Estado</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {mockContractors.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: "700" }}>{c.name}</td>
                  <td>{c.owner}</td>
                  <td>{c.email}</td>
                  <td>{c.projects}</td>
                  <td>
                    <span
                      className={`badge ${c.status === "active" ? "badge-active" : "badge-pending"}`}
                    >
                      {c.status === "active" ? "Activo" : "Pendiente"}
                    </span>
                  </td>
                  <td style={{ color: "#64748b" }}>{c.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
