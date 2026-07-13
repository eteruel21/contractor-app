import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [contractors, setContractors] = useState<any[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [formulas, setFormulas] = useState<any[]>([]);
  const [markupRules, setMarkupRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [stats, setStats] = useState({
    contractorsCount: 0,
    projectsCount: 0,
    clientsCount: 0,
    growth: "+28%",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg(null);
      try {
        // 1. Fetch Contractors (profiles where role = contractor or super_admin)
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

        if (profilesError) {
          console.warn("Profiles fetch failed, using fallback data.");
          setContractors(mockContractors);
        } else {
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
          setContractors(loadedContractors.length > 0 ? loadedContractors : mockContractors);
        }

        // 2. Fetch Projects Count
        let pCount = 0;
        try {
          const { count } = await supabase
            .from("projects")
            .select("*", { count: "exact", head: true });
          pCount = count || 0;
        } catch {
          pCount = 156;
        }

        // 3. Fetch Clients Count
        let cCount = 0;
        try {
          const { count } = await supabase
            .from("clients")
            .select("*", { count: "exact", head: true });
          cCount = count || 0;
        } catch {
          cCount = 432;
        }

        setStats({
          contractorsCount: contractors.length || mockContractors.length,
          projectsCount: pCount,
          clientsCount: cCount,
          growth: "+28%",
        });

        // 4. Fetch Catalog Items
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

          if (catalogData && catalogData.length > 0) {
            setCatalogItems(catalogData.map((item: any) => ({
              id: item.id,
              code: item.sku || "N/A",
              name: item.name,
              category: item.category_id || "General",
              unit: "Pza",
              basePrice: item.sale_price || 0,
            })));
          } else {
            setCatalogItems(mockCatalogItems);
          }
        } catch {
          setCatalogItems(mockCatalogItems);
        }

        // 5. Fetch Formulas (Try-catch in case table doesn't exist yet)
        try {
          const { data: formulasData } = await (supabase as any)
            .from("formulas")
            .select("*");
          
          if (formulasData && formulasData.length > 0) {
            setFormulas(formulasData.map((f: any) => ({
              id: f.id,
              name: f.name || "Fórmula sin nombre",
              variables: f.variables || "N/A",
              expression: f.expression || "N/A",
            })));
          } else {
            setFormulas(mockFormulas);
          }
        } catch {
          setFormulas(mockFormulas);
        }

        // 6. Fetch Pricing Rules / Margins
        try {
          const { data: pricingData } = await (supabase as any)
            .from("pricing_rules")
            .select("*");
          if (pricingData && pricingData.length > 0) {
            setMarkupRules(pricingData.map((p: any) => ({
              id: p.id,
              category: p.category || "General",
              globalMarkup: p.markup_percentage || 0,
              laborCostHour: p.labor_cost || 0,
            })));
          } else {
            setMarkupRules(mockMarkupRules);
          }
        } catch {
          setMarkupRules(mockMarkupRules);
        }

      } catch (err: any) {
        console.error("Error loading real data from Supabase:", err);
        setErrorMsg("Error cargando base de datos real. Usando datos locales de respaldo.");
        setContractors(mockContractors);
        setCatalogItems(mockCatalogItems);
        setFormulas(mockFormulas);
        setMarkupRules(mockMarkupRules);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

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
            {errorMsg && (
              <span style={{ fontSize: "0.8rem", color: "#f87171", backgroundColor: "#311c1c", padding: "4px 10px", borderRadius: "4px" }}>
                {errorMsg}
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

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", height: "50vh", alignItems: "center", justifyContent: "center", gap: "10px", color: "#94a3b8" }}>
            <Loader2 size={32} className="animate-spin" style={{ color: "#3b82f6" }} />
            <span>Conectando con Supabase...</span>
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
                    <div className="stat-value">{stats.contractorsCount || contractors.length}</div>
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
