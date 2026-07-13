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

export default function App() {
  // Auth state
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
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
  const [dataError, setDataError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    contractorsCount: 0,
    projectsCount: 0,
    clientsCount: 0,
    growth: "—",
  });

  // Listen for Auth Session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setSessionLoading(false);
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
    setIsAuthorized(false);
  };

  // Authentication proves identity; this check enforces authorization.
  useEffect(() => {
    let active = true;

    async function validateAdminAccess() {
      if (!session?.user) {
        setIsAuthorized(false);
        return;
      }

      setAccessLoading(true);
      setAuthError(null);

      const { data, error } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        await supabase.auth.signOut();
        setAuthError(`No se pudo verificar el acceso administrativo: ${error.message}`);
        setIsAuthorized(false);
      } else if (!data?.active || data.role !== "super_admin") {
        await supabase.auth.signOut();
        setAuthError("Esta cuenta no tiene permisos de superadministrador.");
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }

      if (active) setAccessLoading(false);
    }

    void validateAdminAccess();

    return () => {
      active = false;
    };
  }, [session]);

  // Load database information once session is active
  const loadDatabaseData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingData(true);
    setDataError(null);

    try {
      const [
        profilesResult,
        projectsResult,
        clientsResult,
        catalogResult,
        formulasResult,
      ] = await Promise.all([
        supabase
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
          `)
          .eq("role", "contractor"),
        supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .in("status", ["approved", "in_progress", "paused"]),
        supabase
          .from("clients")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("catalog_items")
          .select(`
            id,
            sku,
            name,
            sale_price,
            category:catalog_categories (name),
            unit:units (symbol)
          `)
          .eq("active", true)
          .order("name", { ascending: true }),
        supabase
          .from("catalog_yields")
          .select(`
            id,
            name,
            output_quantity,
            labor_hours,
            crew_size,
            waste_percentage
          `)
          .eq("active", true)
          .order("name", { ascending: true }),
      ]);

      const queryError =
        profilesResult.error ||
        projectsResult.error ||
        clientsResult.error ||
        catalogResult.error ||
        formulasResult.error;

      if (queryError) throw queryError;

      const loadedContractors = (profilesResult.data || []).map((p: any) => {
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
          contact: p.phone || "Sin teléfono",
          status: activeStatus,
          joined: p.created_at ? p.created_at.substring(0, 10) : "N/A",
        };
      });

      const loadedCatalog = (catalogResult.data || []).map((item: any) => {
        const category = Array.isArray(item.category)
          ? item.category[0]
          : item.category;
        const unit = Array.isArray(item.unit) ? item.unit[0] : item.unit;

        return {
          id: item.id,
          code: item.sku || "N/A",
          name: item.name,
          category: category?.name || "Sin categoría",
          unit: unit?.symbol || "—",
          basePrice: item.sale_price || 0,
        };
      });

      const loadedFormulas = (formulasResult.data || []).map((formula: any) => ({
        id: formula.id,
        name: formula.name,
        variables: "Producción, horas, cuadrilla y desperdicio",
        expression: `${formula.output_quantity} unidades / ${formula.labor_hours} h / ${formula.crew_size} personas / ${formula.waste_percentage}%`,
      }));

      setContractors(loadedContractors);
      setCatalogItems(loadedCatalog);
      setFormulas(loadedFormulas);
      setMarkupRules([]);
      setStats({
        contractorsCount: loadedContractors.length,
        projectsCount: projectsResult.count || 0,
        clientsCount: clientsResult.count || 0,
        growth: "—",
      });
    } catch (err: any) {
      console.error("Error consultando Supabase:", err);
      setDataError(err.message || "No fue posible cargar la información.");
      setContractors([]);
      setCatalogItems([]);
      setFormulas([]);
      setMarkupRules([]);
    } finally {
      setLoadingData(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      loadDatabaseData();
    }
  }, [isAuthorized, loadDatabaseData]);

  if (sessionLoading || (session && (!isAuthorized || accessLoading))) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#0f172a", color: "#94a3b8" }}>
        <Loader2 size={28} className="animate-spin" />
        <span>Verificando acceso administrativo...</span>
      </div>
    );
  }

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
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Server size={20} className="stat-icon" />
              <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#22c55e" }}>
                API: ONLINE
              </span>
            </div>
          </div>
        </div>

        {dataError && (
          <div style={{ margin: "0 0 20px", padding: "14px", border: "1px solid #ef4444", borderRadius: "8px", backgroundColor: "#311c1c", color: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertTriangle size={18} /> Error de Supabase: {dataError}
            </span>
            <button onClick={() => void loadDatabaseData()} style={{ padding: "7px 12px", borderRadius: "6px", border: "1px solid #ef4444", background: "transparent", color: "#fca5a5", cursor: "pointer", fontWeight: "700" }}>
              Reintentar
            </button>
          </div>
        )}

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
                    <div className="stat-desc">Métrica pendiente</div>
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
                          <td>{c.contact}</td>
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
                        <td>{c.contact}</td>
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
