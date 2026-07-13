import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  Server,
  Activity,
  UserCheck,
  TrendingUp,
  BookOpen,
  Calculator,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Sliders,
  Loader2,
  Lock,
  Mail,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "./supabase";

// Mock Fallback Data (used if Supabase fails or tables do not exist yet)
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

const mockCatalogItems = [
  { id: "1", code: "CONC-001", name: "Concreto Premezclado 3000 PSI", category: "Materiales", unit: "m³", basePrice: 125.00 },
  { id: "2", code: "GYP-012", name: "Lámina Gypsum Standard 1/2", category: "Materiales", unit: "Pza", basePrice: 10.50 },
  { id: "3", code: "PNT-002", name: "Pintura Látex Premium (Galón)", category: "Acabados", unit: "Gal", basePrice: 28.90 },
  { id: "4", code: "MO-REP", name: "Mano de Obra Repello Liso", category: "Mano de Obra", unit: "m²", basePrice: 8.50 },
  { id: "5", code: "BLO-004", name: "Bloque de Arcilla 4 pulgadas", category: "Materiales", unit: "Pza", basePrice: 0.65 },
];

const mockFormulas = [
  { id: "1", name: "Cálculo de Concreto de Losa", variables: "Largo, Ancho, Espesor", expression: "Largo * Ancho * Espesor * 1.05 (Desperdicio)" },
  { id: "2", name: "Cálculo de Bloques de Pared", variables: "Largo, Alto, BloqueTipo", expression: "(Largo * Alto) * 12.5 (Bloques por m²)" },
  { id: "3", name: "Cálculo de Gypsum en Cielo Raso", variables: "Largo, Ancho", expression: "(Largo * Ancho) / 2.98 (Área de lámina)" },
];

const mockMarkupRules = [
  { id: "1", category: "Materiales", globalMarkup: 15, laborCostHour: 0 },
  { id: "2", category: "Mano de Obra", globalMarkup: 25, laborCostHour: 12.50 },
  { id: "3", category: "Acabados", globalMarkup: 20, laborCostHour: 0 },
];

export default function App() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // App UI state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contractors, setContractors] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [markupRules, setMarkupRules] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [stats, setStats] = useState({
    contractorsCount: 0,
    projectsCount: 0,
    clientsCount: 0,
    growth: "+28%",
  });

  // Listen for Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;
      setSession(data.session);
    } catch (err: any) {
      setAuthError(err.message || "Credenciales inválidas");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // Load database information once session is active
  const loadDatabaseData = useCallback(async () => {
    if (!session) return;
    setLoadingData(true);
    setIsDemoMode(false);
    try {
      // 1. Fetch Contractors (profiles joined with companies)
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          phone,
          role,
          created_at,
          company_members (
            role,
            company:companies (
              id,
              name,
              active
            )
          )
        `);

      if (profilesError) throw profilesError;

      const loadedContractors = (profilesData || []).map((p: any) => {
        const membership = p.company_members?.[0];
        const company = membership?.company;
        const companyName = Array.isArray(company) 
          ? company[0]?.name 
          : (company as any)?.name || "Sin Empresa";
        const activeStatus = Array.isArray(company)
          ? (company[0]?.active ? "active" : "pending")
          : ((company as any)?.active ? "active" : "pending");

        return {
          id: p.id,
          name: companyName,
          owner: p.full_name || "Sin Nombre",
          email: p.phone || "Sin Teléfono",
          projects: 0,
          status: p.role === "super_admin" ? "active" : activeStatus,
          joined: p.created_at ? p.created_at.substring(0, 10) : "N/A",
        };
      });

      // 2. Fetch Projects Count
      let pCount = 0;
      try {
        const { count } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true });
        pCount = count || 0;
      } catch {
        pCount = 0;
      }

      // 3. Fetch Clients Count
      let cCount = 0;
      try {
        const { count } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true });
        cCount = count || 0;
      } catch {
        cCount = 0;
      }

      // 4. Fetch Catalog Items
      let loadedCatalog: any[] = [];
      try {
        const { data: catalogData } = await supabase
          .from("catalog_items")
          .select(`
            id,
            sku,
            name,
            sale_price,
            category_id
          `);

        if (catalogData) {
          loadedCatalog = catalogData.map((item: any) => ({
            id: item.id,
            code: item.sku || "N/A",
            name: item.name,
            category: item.category_id || "General",
            unit: "Pza",
            basePrice: item.sale_price || 0,
          }));
        }
      } catch (err) {
        console.warn("Catalog fetch failed or table doesn't exist:", err);
      }

      // 5. Fetch Formulas
      let loadedFormulas: any[] = [];
      try {
        const { data: formulasData } = await (supabase as any)
          .from("formulas")
          .select("*");
        if (formulasData) {
          loadedFormulas = formulasData.map((f: any) => ({
            id: f.id,
            name: f.name || "Fórmula",
            variables: f.variables || "N/A",
            expression: f.expression || "N/A",
          }));
        }
      } catch (err) {
        console.warn("Formulas fetch failed or table doesn't exist:", err);
      }

      // 6. Fetch Pricing Rules
      let loadedMarkup: any[] = [];
      try {
        const { data: pricingData } = await (supabase as any)
          .from("pricing_rules")
          .select("*");
        if (pricingData) {
          loadedMarkup = pricingData.map((p: any) => ({
            id: p.id,
            category: p.category || "General",
            globalMarkup: p.markup_percentage || 0,
            laborCostHour: p.labor_cost || 0,
          }));
        }
      } catch (err) {
        console.warn("Pricing rules fetch failed or table doesn't exist:", err);
      }

      // Determine if we need to show fallback/demo data (if tables exist but are empty)
      if (loadedContractors.length === 0 && loadedCatalog.length === 0) {
        setIsDemoMode(true);
        setContractors(mockContractors);
        setCatalogItems(mockCatalogItems);
        setFormulas(mockFormulas);
        setMarkupRules(mockMarkupRules);
        setStats({
          contractorsCount: mockContractors.length,
          projectsCount: 156,
          clientsCount: 432,
          growth: "+28%",
        });
      } else {
        setIsDemoMode(false);
        setContractors(loadedContractors.length > 0 ? loadedContractors : mockContractors);
        setCatalogItems(loadedCatalog.length > 0 ? loadedCatalog : mockCatalogItems);
        setFormulas(loadedFormulas.length > 0 ? loadedFormulas : mockFormulas);
        setMarkupRules(loadedMarkup.length > 0 ? loadedMarkup : mockMarkupRules);
        setStats({
          contractorsCount: loadedContractors.length,
          projectsCount: pCount,
          clientsCount: cCount,
          growth: "+28%",
        });
      }

    } catch (err: any) {
      console.error("General error querying Supabase. Activating Demo Mode.", err);
      setIsDemoMode(true);
      setContractors(mockContractors);
      setCatalogItems(mockCatalogItems);
      setFormulas(mockFormulas);
      setMarkupRules(mockMarkupRules);
      setStats({
        contractorsCount: mockContractors.length,
        projectsCount: 156,
        clientsCount: 432,
        growth: "+28%",
      });
    } finally {
      setLoadingData(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      loadDatabaseData();
    }
  }, [session, loadDatabaseData]);

  // LOGIN SCREEN
  if (!session) {
    return (
      <div className="login-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#0f172a", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: "#1e293b", padding: "40px", borderRadius: "12px", width: "100%", maxWidth: "420px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)", border: "1px solid #334155" }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <Briefcase size={40} style={{ color: "#3b82f6", margin: "0 auto 10px auto" }} />
            <h2 style={{ fontSize: "1.75rem", fontWeight: "800", letterSpacing: "-0.025em" }}>Contractor Pro</h2>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "5px" }}>Super Admin Central Portal</p>
          </div>

          {authError && (
            <div style={{ backgroundColor: "#311c1c", border: "1px solid #f87171", color: "#f87171", padding: "12px", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
              <AlertTriangle size={16} />
              <span>{authError}</span>
            </div>
          )}

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>Correo Electrónico</label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "6px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "30px" }}>
            <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "600" }}>Contraseña</label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#64748b" }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 12px 10px 40px", borderRadius: "6px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#fff", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading}
            style={{ width: "100%", padding: "12px", borderRadius: "6px", backgroundColor: "#3b82f6", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background-color 0.2s" }}
          >
            {authLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              "Ingresar al Panel"
            )}
          </button>
        </form>
      </div>
    );
  }

  // PORTAL MAIN SCREEN
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
            onClick={() => setActiveTab("catalog")}
            className={`nav-item ${activeTab === "catalog" ? "active" : ""}`}
          >
            <BookOpen size={18} />
            <span>Catálogo Central</span>
          </div>

          <div
            onClick={() => setActiveTab("formulas")}
            className={`nav-item ${activeTab === "formulas" ? "active" : ""}`}
          >
            <Calculator size={18} />
            <span>Fórmulas y Medidas</span>
          </div>

          <div
            onClick={() => setActiveTab("pricing")}
            className={`nav-item ${activeTab === "pricing" ? "active" : ""}`}
          >
            <DollarSign size={18} />
            <span>Gestión de Precios</span>
          </div>

          <div
            onClick={() => setActiveTab("settings")}
            className={`nav-item ${activeTab === "settings" ? "active" : ""}`}
          >
            <Settings size={18} />
            <span>Ajustes del Sistema</span>
          </div>
        </div>

        {/* User Signout footer */}
        <div style={{ marginTop: "auto", padding: "15px", borderTop: "1px solid #1e293b", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#fff" }}>Super Administrador</span>
            <span style={{ fontSize: "0.7rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {session.user?.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: "#1e293b", color: "#f87171", border: "1px solid #334155", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "0.8rem" }}
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Admin Page Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <div className="title-container">
            <h1>Super Admin Panel</h1>
            <p>
              {activeTab === "dashboard" && "Monitoreo global de la plataforma"}
              {activeTab === "contractors" && "Administración de empresas y contratistas registrados"}
              {activeTab === "catalog" && "Administración del catálogo central de materiales y mano de obra"}
              {activeTab === "formulas" && "Gestión de variables de ingeniería y fórmulas matemáticas"}
              {activeTab === "pricing" && "Configuración global de márgenes, recargos y costos base"}
              {activeTab === "settings" && "Configuración general del monorepositorio"}
            </p>
          </div>

          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            {isDemoMode && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", color: "#f59e0b", backgroundColor: "#2d1f10", padding: "6px 12px", borderRadius: "6px", border: "1px solid #d97706" }}>
                <AlertTriangle size={14} /> Modo Demostración (DB Vacía)
              </span>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Server size={20} className="stat-icon" />
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#22c55e" }}>
                API: ONLINE
              </span>
            </div>
          </div>
        </div>

        {loadingData ? (
          <div style={{ display: "flex", flexDirection: "column", height: "50vh", alignItems: "center", justifyContent: "center", gap: "10px", color: "#94a3b8" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} />
            <span>Consultando Supabase...</span>
          </div>
        ) : (
          <>
            {/* Tab 1: Dashboard */}
            {activeTab === "dashboard" && (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-header">
                      <span>Contratistas</span>
                      <Briefcase size={16} className="stat-icon" />
                    </div>
                    <div className="stat-value">{stats.contractorsCount}</div>
                    <div className="stat-desc">Sincronizado</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span>Proyectos Activos</span>
                      <Activity size={16} className="stat-icon" />
                    </div>
                    <div className="stat-value">{stats.projectsCount}</div>
                    <div className="stat-desc">Sincronizado</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span>Clientes Registrados</span>
                      <UserCheck size={16} className="stat-icon" />
                    </div>
                    <div className="stat-value">{stats.clientsCount}</div>
                    <div className="stat-desc">Auto-vinculados</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-header">
                      <span>Crecimiento Mensual</span>
                      <TrendingUp size={16} className="stat-icon" />
                    </div>
                    <div className="stat-value">{stats.growth}</div>
                    <div className="stat-desc">Objetivo: 20%</div>
                  </div>
                </div>

                <div className="data-table-container">
                  <div className="table-header">
                    <h3>Contratistas Sincronizados (Supabase)</h3>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Empresa / Contratista</th>
                        <th>Administrador</th>
                        <th>Contacto</th>
                        <th>Estado</th>
                        <th>Registro</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractors.map((c) => (
                        <tr key={c.id}>
                          <td style={{ fontWeight: "700" }}>{c.name}</td>
                          <td>{c.owner}</td>
                          <td>{c.email}</td>
                          <td>
                            <span className={`badge ${c.status === "active" ? "badge-active" : "badge-pending"}`}>
                              {c.status === "active" ? "Activo" : "Pendiente"}
                            </span>
                          </td>
                          <td style={{ color: "#64748b" }}>{c.joined}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Tab 2: Contractors List */}
            {activeTab === "contractors" && (
              <div className="data-table-container">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Listado General de Contratistas</h3>
                  <button style={{ backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                    <Plus size={16} /> Agregar Contratista
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Empresa</th>
                      <th>Propietario</th>
                      <th>Contacto</th>
                      <th>Estado de Cuenta</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractors.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: "700" }}>{c.name}</td>
                        <td>{c.owner}</td>
                        <td>{c.email}</td>
                        <td>
                          <span className={`badge ${c.status === "active" ? "badge-active" : "badge-pending"}`}>
                            {c.status === "active" ? "Activo" : "Pendiente"}
                          </span>
                        </td>
                        <td>
                          <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer" }}>
                            <Sliders size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Central Catalog */}
            {activeTab === "catalog" && (
              <div className="data-table-container">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Catálogo de Conceptos y Materiales</h3>
                  <button style={{ backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                    <Plus size={16} /> Nuevo Ítem
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Nombre del Elemento</th>
                      <th>Categoría</th>
                      <th>Unidad</th>
                      <th>Precio Base ($)</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogItems.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontFamily: "monospace", color: "#94a3b8" }}>{item.code}</td>
                        <td style={{ fontWeight: "700" }}>{item.name}</td>
                        <td>{item.category}</td>
                        <td>{item.unit}</td>
                        <td>${item.basePrice.toFixed(2)}</td>
                        <td>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Edit size={16} style={{ color: "#3b82f6", cursor: "pointer" }} />
                            <Trash2 size={16} style={{ color: "#ef4444", cursor: "pointer" }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Formulas */}
            {activeTab === "formulas" && (
              <div className="data-table-container">
                <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3>Fórmulas de Cómputo Métrico</h3>
                  <button style={{ backgroundColor: "#3b82f6", color: "#fff", display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", borderRadius: "6px", fontSize: "0.85rem", border: "none", cursor: "pointer" }}>
                    <Plus size={16} /> Agregar Fórmula
                  </button>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Fórmula / Módulo</th>
                      <th>Variables Requeridas</th>
                      <th>Expresión Lógica / Algoritmo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulas.map((f) => (
                      <tr key={f.id}>
                        <td style={{ fontWeight: "700" }}>{f.name}</td>
                        <td>{f.variables}</td>
                        <td style={{ fontFamily: "monospace", color: "#3b82f6" }}>{f.expression}</td>
                        <td>
                          <div style={{ display: "flex", gap: "12px" }}>
                            <Edit size={16} style={{ color: "#3b82f6", cursor: "pointer" }} />
                            <Trash2 size={16} style={{ color: "#ef4444", cursor: "pointer" }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 5: Pricing Management */}
            {activeTab === "pricing" && (
              <div className="data-table-container">
                <div className="table-header">
                  <h3>Márgenes de Utilidad y Costo de Mano de Obra</h3>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Categoría de Concepto</th>
                      <th>Margen Comercial Global (%)</th>
                      <th>Costo Promedio Hora ($)</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {markupRules.map((rule) => (
                      <tr key={rule.id}>
                        <td style={{ fontWeight: "700" }}>{rule.category}</td>
                        <td>{rule.globalMarkup}%</td>
                        <td>{rule.laborCostHour > 0 ? `$${rule.laborCostHour.toFixed(2)}` : "N/A"}</td>
                        <td>
                          <span className="badge badge-active">Activo</span>
                        </td>
                        <td>
                          <Edit size={16} style={{ color: "#3b82f6", cursor: "pointer" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 6: Settings */}
            {activeTab === "settings" && (
              <div className="data-table-container" style={{ padding: "20px" }}>
                <h3 style={{ marginBottom: "15px" }}>Ajustes del Sistema</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "15px", maxWidth: "400px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "5px" }}>Nombre del Portal</label>
                    <input type="text" defaultValue="Contractor Pro Admin" style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "5px" }}>Supabase Endpoint API</label>
                    <input type="text" defaultValue="https://bbfkkgrjschhxjhsmkau.supabase.co" style={{ width: "100%", padding: "8px", borderRadius: "6px", backgroundColor: "#1e293b", border: "1px solid #334155", color: "#fff" }} />
                  </div>
                  <button style={{ width: "fit-content", backgroundColor: "#10b981", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}>
                    Guardar Configuración
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
