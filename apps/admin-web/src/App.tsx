import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  AlertTriangle,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  DollarSign,
  Edit3,
  History,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Settings,
  SlidersHorizontal,
  UserCheck,
  Users,
  X,
} from "lucide-react";

import {
  adjustPrices,
  type AdminData,
  type CatalogItem,
  type Category,
  type CategoryDraft,
  type Formula,
  type FormulaDraft,
  type FormulaParameter,
  type GlobalCatalogItem,
  type GlobalCatalogItemDraft,
  type ItemDraft,
  type ItemType,
  loadAdminData,
  type PlatformUser,
  saveCategory,
  saveFormula,
  saveGlobalCatalogPricing,
  saveItem,
  saveUnit,
  saveUser,
  saveYield,
  type Unit,
  type UnitDraft,
  type UnitType,
  type UserDraft,
  type UserRole,
  type YieldDraft,
  type CatalogYield,
} from "./admin-data";
import { supabase } from "./supabase";

type Tab = "dashboard" | "users" | "catalog" | "calculations" | "pricing" | "system";
type Editor =
  | { kind: "user"; draft: UserDraft }
  | { kind: "category"; draft: CategoryDraft }
  | { kind: "item"; draft: ItemDraft }
  | { kind: "globalPrice"; draft: GlobalCatalogItemDraft }
  | { kind: "unit"; draft: UnitDraft }
  | { kind: "yield"; draft: YieldDraft }
  | { kind: "formula"; draft: FormulaDraft };

const EMPTY_DATA: AdminData = {
  users: [],
  companies: [],
  categories: [],
  items: [],
  globalItems: [],
  units: [],
  yields: [],
  formulas: [],
  projectCount: 0,
  clientCount: 0,
  priceHistoryCount: 0,
  warnings: [],
};

const ITEM_TYPES: Array<{ value: ItemType; label: string }> = [
  { value: "material", label: "Material" },
  { value: "labor", label: "Mano de obra" },
  { value: "equipment", label: "Equipo" },
  { value: "service", label: "Servicio" },
  { value: "subcontract", label: "Subcontrato" },
];

const UNIT_TYPES: Array<{ value: UnitType; label: string }> = [
  { value: "length", label: "Longitud" },
  { value: "area", label: "Área" },
  { value: "volume", label: "Volumen" },
  { value: "weight", label: "Peso" },
  { value: "unit", label: "Unidad" },
  { value: "time", label: "Tiempo" },
  { value: "package", label: "Paquete" },
  { value: "service", label: "Servicio" },
];

function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "No fue posible completar la operación.";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PA", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "PAB",
  }).format(value);
}

function roleLabel(role: UserRole) {
  if (role === "super_admin") return "Superadministrador";
  if (role === "client") return "Cliente";
  return "Contratista";
}

function statusFor(user: Pick<PlatformUser, "active" | "approvedAt">) {
  if (user.active) return { label: "Activo", className: "badge-active" };
  if (user.approvedAt) return { label: "Suspendido", className: "badge-suspended" };
  return { label: "Pendiente", className: "badge-pending" };
}

function userDraft(user: PlatformUser): UserDraft {
  return {
    id: user.id,
    fullName: user.fullName,
    phone: user.phone,
    role: user.role,
    active: user.active,
    approvedAt: user.approvedAt,
    approvedBy: user.approvedBy,
  };
}

function categoryDraft(category: Category): CategoryDraft {
  const { companyName: _companyName, ...draft } = category;
  return draft;
}

function itemDraft(item: CatalogItem): ItemDraft {
  const {
    companyName: _companyName,
    categoryName: _categoryName,
    unitSymbol: _unitSymbol,
    ...draft
  } = item;
  return draft;
}

function globalCatalogItemDraft(
  item: GlobalCatalogItem,
): GlobalCatalogItemDraft {
  return {
    id: item.id,
    unitCost: item.unitCost,
    salePrice: item.salePrice,
    wastePercentage: item.wastePercentage,
  };
}

function unitDraft(unit: Unit): UnitDraft {
  const { companyName: _companyName, ...draft } = unit;
  return draft;
}

function yieldDraft(catalogYield: CatalogYield): YieldDraft {
  const {
    companyName: _companyName,
    catalogItemName: _catalogItemName,
    outputUnitSymbol: _outputUnitSymbol,
    ...draft
  } = catalogYield;
  return draft;
}

function formulaDraft(formula: Formula): FormulaDraft {
  const { companyName: _companyName, ...draft } = formula;
  return {
    ...draft,
    parameters: draft.parameters.map((parameter) => ({ ...parameter })),
  };
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [accessLoading, setAccessLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);

  const [priceType, setPriceType] = useState<"all" | "material" | "labor">("all");
  const [priceTarget, setPriceTarget] = useState<"unit_cost" | "sale_price">("sale_price");
  const [pricePercentage, setPricePercentage] = useState("5");
  const [priceNotes, setPriceNotes] = useState("");
  const [adjustingPrices, setAdjustingPrices] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session: nextSession } }) => {
      setSession(nextSession);
      setSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setSessionLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    async function validateAccess() {
      if (!session?.user) {
        setIsAuthorized(false);
        return;
      }
      setAccessLoading(true);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, active")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!active) return;
      if (error || !profile?.active || profile.role !== "super_admin") {
        setAuthError(error ? error.message : "Esta cuenta no es superadministradora.");
        setIsAuthorized(false);
        await supabase.auth.signOut();
      } else {
        setAuthError(null);
        setIsAuthorized(true);
      }
      if (active) setAccessLoading(false);
    }
    void validateAccess();
    return () => { active = false; };
  }, [session]);

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const nextData = await loadAdminData();
      setData(nextData);
      setDataError(
        nextData.warnings.length > 0
          ? nextData.warnings.join(" ")
          : null,
      );
    } catch (error) {
      setDataError(errorMessage(error));
    } finally {
      setLoadingData(false);
    }
  }, [isAuthorized]);

  useEffect(() => { void loadData(); }, [loadData]);

  const pendingUsers = useMemo(
    () => data.users.filter((user) => !user.active && !user.approvedAt),
    [data.users],
  );
  const normalizedSearch = search.trim().toLowerCase();
  const visibleUsers = data.users.filter((user) =>
    [user.fullName, user.phone, user.companyName, roleLabel(user.role)]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );
  const visibleItems = data.items.filter((item) =>
    [item.sku, item.name, item.categoryName, item.companyName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch),
  );

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setSession(null);
    setIsAuthorized(false);
  }

  function showSuccess(message: string) {
    setSuccess(message);
    window.setTimeout(() => setSuccess(null), 3500);
  }

  async function toggleUser(user: PlatformUser) {
    if (!session?.user || user.id === session.user.id) return;
    setSaving(true);
    setDataError(null);
    try {
      await saveUser({ ...userDraft(user), active: !user.active }, session.user.id);
      showSuccess(user.active ? "Usuario suspendido." : "Usuario aprobado.");
      await loadData();
    } catch (error) {
      setDataError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function submitEditor() {
    if (!editor || !session?.user) return;
    setSaving(true);
    setDataError(null);
    try {
      if (editor.kind === "user") await saveUser(editor.draft, session.user.id);
      else if (editor.kind === "category") await saveCategory(editor.draft);
      else if (editor.kind === "item") await saveItem(editor.draft);
      else if (editor.kind === "globalPrice") {
        await saveGlobalCatalogPricing(editor.draft);
      }
      else if (editor.kind === "unit") await saveUnit(editor.draft);
      else if (editor.kind === "yield") await saveYield(editor.draft);
      else await saveFormula(editor.draft);
      setEditor(null);
      showSuccess("Cambios guardados correctamente.");
      await loadData();
    } catch (error) {
      setDataError(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handlePriceAdjustment(event: FormEvent) {
    event.preventDefault();
    const percentage = Number(pricePercentage.replace(",", "."));
    const itemIds = data.globalItems
      .filter((item) =>
        item.active &&
        (item.itemType === "material" || item.itemType === "labor") &&
        (priceType === "all" || item.itemType === priceType),
      )
      .map((item) => item.id);
    if (!Number.isFinite(percentage) || percentage <= -100 || itemIds.length === 0) {
      setDataError("Revisa el tipo, el porcentaje y los elementos activos.");
      return;
    }
    setAdjustingPrices(true);
    setDataError(null);
    try {
      await adjustPrices({
        itemIds,
        target: priceTarget,
        percentage,
        notes: priceNotes,
      });
      showSuccess(`Se actualizaron ${itemIds.length} precios.`);
      setPriceNotes("");
      await loadData();
    } catch (error) {
      setDataError(errorMessage(error));
    } finally {
      setAdjustingPrices(false);
    }
  }

  function newCategory() {
    setEditor({
      kind: "category",
      draft: { id: "", companyId: data.companies[0]?.id ?? "", name: "", description: "", active: true },
    });
  }

  function newItem() {
    const companyId = data.companies[0]?.id ?? "";
    setEditor({
      kind: "item",
      draft: {
        id: "",
        companyId,
        sku: "",
        name: "",
        description: "",
        itemType: "material",
        categoryId: data.categories.find((value) => value.companyId === companyId)?.id ?? null,
        unitId: data.units.find((value) => value.companyId === companyId)?.id ?? "",
        unitCost: 0,
        salePrice: 0,
        wastePercentage: 0,
        active: true,
      },
    });
  }

  function newUnit() {
    setEditor({
      kind: "unit",
      draft: {
        id: "",
        companyId: data.companies[0]?.id ?? "",
        code: "",
        name: "",
        symbol: "",
        unitType: "unit",
        conversionFactor: 1,
        active: true,
      },
    });
  }

  function newYield() {
    const companyId = data.companies[0]?.id ?? "";
    setEditor({
      kind: "yield",
      draft: {
        id: "",
        companyId,
        catalogItemId: data.items.find((value) => value.companyId === companyId)?.id ?? "",
        outputUnitId: data.units.find((value) => value.companyId === companyId)?.id ?? "",
        name: "",
        outputQuantity: 1,
        laborHours: 0,
        crewSize: 1,
        wastePercentage: 0,
        notes: "",
        active: true,
      },
    });
  }

  function newFormula() {
    setEditor({
      kind: "formula",
      draft: {
        id: "",
        companyId: data.companies[0]?.id ?? "",
        code: "",
        name: "",
        description: "",
        active: true,
        parameters: [],
      },
    });
  }

  if (sessionLoading || (session && accessLoading)) {
    return <FullScreenLoader label="Verificando acceso administrativo..." />;
  }

  if (!session || !isAuthorized) {
    return (
      <div className="login-container">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="login-brand">
            <Briefcase size={42} />
            <h1>Contractor Pro</h1>
            <p>Panel central de Super Admin</p>
          </div>
          {authError && <AlertBanner message={authError} />}
          <Field label="Correo electrónico">
            <div className="icon-input"><Mail size={18} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
          </Field>
          <Field label="Contraseña">
            <div className="icon-input"><Lock size={18} /><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></div>
          </Field>
          <button className="button button-primary button-block" disabled={authLoading}>
            {authLoading ? <Loader2 className="spin" size={18} /> : <Lock size={18} />}
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  const titles: Record<Tab, [string, string]> = {
    dashboard: ["Resumen de plataforma", "Usuarios, proyectos y configuración central."],
    users: ["Usuarios", "Aprueba registros y edita cada perfil."],
    catalog: ["Catálogo", "Categorías, materiales, mano de obra y servicios."],
    calculations: ["Cálculos", "Fórmulas, parámetros, unidades y rendimientos."],
    pricing: ["Precios globales", "Valores predeterminados para todos los usuarios."],
    system: ["Sistema", "Estado de la conexión y sesión administrativa."],
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-brand"><Briefcase size={24} /><span>Contractor Pro</span></div>
        <nav className="nav-links">
          <NavButton icon={<LayoutDashboard />} label="Resumen" tab="dashboard" active={activeTab} onClick={setActiveTab} />
          <NavButton icon={<Users />} label="Usuarios" tab="users" active={activeTab} onClick={setActiveTab} badge={pendingUsers.length} />
          <NavButton icon={<BookOpen />} label="Catálogo" tab="catalog" active={activeTab} onClick={setActiveTab} />
          <NavButton icon={<Calculator />} label="Cálculos" tab="calculations" active={activeTab} onClick={setActiveTab} />
          <NavButton icon={<DollarSign />} label="Precios" tab="pricing" active={activeTab} onClick={setActiveTab} />
          <NavButton icon={<Settings />} label="Sistema" tab="system" active={activeTab} onClick={setActiveTab} />
        </nav>
        <div className="sidebar-footer">
          <strong>Superadministrador</strong>
          <span>{session.user.email}</span>
          <button className="button button-ghost button-block" onClick={() => void handleSignOut()}><LogOut size={16} /> Cerrar sesión</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="title-container"><h1>{titles[activeTab][0]}</h1><p>{titles[activeTab][1]}</p></div>
          <button className="button button-secondary" onClick={() => void loadData()} disabled={loadingData}>
            <RefreshCw className={loadingData ? "spin" : ""} size={17} /> Actualizar
          </button>
        </header>

        {dataError && <AlertBanner message={dataError} onClose={() => setDataError(null)} />}
        {data.warnings.map((warning) => (
          <AlertBanner key={warning} message={warning} />
        ))}
        {success && <SuccessBanner message={success} />}

        {loadingData ? (
          <div className="content-loader"><Loader2 className="spin" size={34} /><span>Sincronizando con Supabase...</span></div>
        ) : (
          <div key={activeTab} className="tab-pane">
            {activeTab === "dashboard" && (
              <Dashboard data={data} pendingUsers={pendingUsers} onEdit={(user) => setEditor({ kind: "user", draft: userDraft(user) })} onToggle={toggleUser} />
            )}
            {activeTab === "users" && (
              <UsersTab users={visibleUsers} search={search} setSearch={setSearch} currentUserId={session.user.id} saving={saving} onEdit={(user) => setEditor({ kind: "user", draft: userDraft(user) })} onToggle={toggleUser} />
            )}
            {activeTab === "catalog" && (
              <CatalogTab categories={data.categories} items={visibleItems} search={search} setSearch={setSearch} onNewCategory={newCategory} onNewItem={newItem} onEditCategory={(category) => setEditor({ kind: "category", draft: categoryDraft(category) })} onEditItem={(item) => setEditor({ kind: "item", draft: itemDraft(item) })} />
            )}
            {activeTab === "calculations" && (
              <CalculationsTab formulas={data.formulas} units={data.units} yields={data.yields} onNewFormula={newFormula} onNewUnit={newUnit} onNewYield={newYield} onEditFormula={(formula) => setEditor({ kind: "formula", draft: formulaDraft(formula) })} onEditUnit={(unit) => setEditor({ kind: "unit", draft: unitDraft(unit) })} onEditYield={(value) => setEditor({ kind: "yield", draft: yieldDraft(value) })} />
            )}
            {activeTab === "pricing" && (
              <PricingTab data={data} itemType={priceType} setItemType={setPriceType} target={priceTarget} setTarget={setPriceTarget} percentage={pricePercentage} setPercentage={setPricePercentage} notes={priceNotes} setNotes={setPriceNotes} adjusting={adjustingPrices} onSubmit={handlePriceAdjustment} onEdit={(item) => setEditor({ kind: "globalPrice", draft: globalCatalogItemDraft(item) })} />
            )}
            {activeTab === "system" && <SystemTab data={data} email={session.user.email ?? ""} onSignOut={handleSignOut} />}
          </div>
        )}
      </main>

      {editor && (
        <EditorModal editor={editor} setEditor={setEditor} data={data} currentUserId={session.user.id} saving={saving} onSave={submitEditor} onClose={() => setEditor(null)} />
      )}
    </div>
  );
}

function FullScreenLoader({ label }: { label: string }) {
  return <div className="fullscreen-loader"><Loader2 className="spin" size={32} /><span>{label}</span></div>;
}

function AlertBanner({ message, onClose }: { message: string; onClose?: () => void }) {
  return <div className="alert-banner"><AlertTriangle size={18} /><span>{message}</span>{onClose && <button onClick={onClose}><X size={16} /></button>}</div>;
}

function SuccessBanner({ message }: { message: string }) {
  return <div className="success-banner"><CheckCircle2 size={18} /><span>{message}</span></div>;
}

function NavButton({ icon, label, tab, active, onClick, badge }: { icon: ReactNode; label: string; tab: Tab; active: Tab; onClick: (tab: Tab) => void; badge?: number }) {
  return <button className={`nav-item ${active === tab ? "active" : ""}`} onClick={() => onClick(tab)}>{icon}<span>{label}</span>{Boolean(badge) && <strong className="nav-badge">{badge}</strong>}</button>;
}

function StatCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function Dashboard({ data, pendingUsers, onEdit, onToggle }: { data: AdminData; pendingUsers: PlatformUser[]; onEdit: (user: PlatformUser) => void; onToggle: (user: PlatformUser) => Promise<void> }) {
  return <>
    <div className="stats-grid">
      <StatCard label="Usuarios" value={data.users.length} detail={`${pendingUsers.length} pendientes`} />
      <StatCard label="Empresas" value={data.companies.length} detail="Organizaciones registradas" />
      <StatCard label="Proyectos" value={data.projectCount} detail="Proyectos totales" />
      <StatCard label="Precios globales" value={data.globalItems.length} detail="Conceptos predeterminados" />
    </div>
    <section className="data-card">
      <SectionHeader title="Solicitudes pendientes" subtitle="Aprueba el acceso o revisa los datos antes de aceptar." />
      {pendingUsers.length ? (
        <Table><thead><tr><th>Usuario</th><th>Rol</th><th>Registro</th><th>Acciones</th></tr></thead><tbody>{pendingUsers.map((user) => <tr key={user.id}><td><strong>{user.fullName || "Sin nombre"}</strong><small>{user.phone || "Sin teléfono"}</small></td><td>{roleLabel(user.role)}</td><td>{formatDate(user.createdAt)}</td><td><div className="actions"><button className="button button-secondary" onClick={() => onEdit(user)}><Edit3 size={15} /> Editar</button><button className="button button-primary" onClick={() => void onToggle(user)}><UserCheck size={15} /> Aprobar</button></div></td></tr>)}</tbody></Table>
      ) : <EmptyState label="No hay registros pendientes." />}
    </section>
  </>;
}

function UsersTab({ users, search, setSearch, currentUserId, saving, onEdit, onToggle }: { users: PlatformUser[]; search: string; setSearch: (value: string) => void; currentUserId: string; saving: boolean; onEdit: (user: PlatformUser) => void; onToggle: (user: PlatformUser) => Promise<void> }) {
  return <section className="data-card">
    <div className="card-toolbar"><SectionHeader title="Todos los usuarios" subtitle={`${users.length} resultados`} /><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuario..." /></div>
    <Table><thead><tr><th>Usuario</th><th>Rol</th><th>Empresa</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr></thead><tbody>{users.map((user) => { const status = statusFor(user); const self = user.id === currentUserId; return <tr key={user.id}><td><strong>{user.fullName || "Sin nombre"}</strong><small>{user.phone || "Sin teléfono"}</small></td><td>{roleLabel(user.role)}</td><td>{user.companyName}</td><td><span className={`badge ${status.className}`}>{status.label}</span></td><td>{formatDate(user.createdAt)}</td><td><div className="actions"><button className="icon-button" onClick={() => onEdit(user)} aria-label="Editar"><Edit3 size={17} /></button>{!self && <button className={`button ${user.active ? "button-danger" : "button-primary"}`} disabled={saving} onClick={() => void onToggle(user)}>{user.active ? "Suspender" : user.approvedAt ? "Reactivar" : "Aprobar"}</button>}</div></td></tr>; })}</tbody></Table>
  </section>;
}

function CatalogTab({ categories, items, search, setSearch, onNewCategory, onNewItem, onEditCategory, onEditItem }: { categories: Category[]; items: CatalogItem[]; search: string; setSearch: (value: string) => void; onNewCategory: () => void; onNewItem: () => void; onEditCategory: (value: Category) => void; onEditItem: (value: CatalogItem) => void }) {
  return <>
    <section className="data-card">
      <div className="card-toolbar"><SectionHeader title="Categorías" subtitle={`${categories.length} categorías`} /><button className="button button-secondary" onClick={onNewCategory}><Plus size={16} /> Categoría</button></div>
      <div className="card-grid">{categories.map((category) => <button className="mini-card" key={category.id} onClick={() => onEditCategory(category)}><div><strong>{category.name}</strong><small>{category.companyName}</small></div><span className={`badge ${category.active ? "badge-active" : "badge-suspended"}`}>{category.active ? "Activa" : "Inactiva"}</span></button>)}</div>
    </section>
    <section className="data-card">
      <div className="card-toolbar"><SectionHeader title="Elementos del catálogo" subtitle={`${items.length} resultados`} /><div className="toolbar-actions"><input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar concepto..." /><button className="button button-primary" onClick={onNewItem}><Plus size={16} /> Elemento</button></div></div>
      <Table><thead><tr><th>Código</th><th>Elemento</th><th>Empresa</th><th>Unidad</th><th>Costo</th><th>Venta</th><th></th></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><code>{item.sku || "—"}</code></td><td><strong>{item.name}</strong><small>{item.categoryName}</small></td><td>{item.companyName}</td><td>{item.unitSymbol}</td><td>{formatMoney(item.unitCost)}</td><td>{formatMoney(item.salePrice)}</td><td><button className="icon-button" onClick={() => onEditItem(item)}><Edit3 size={17} /></button></td></tr>)}</tbody></Table>
    </section>
  </>;
}

function CalculationsTab({ formulas, units, yields, onNewFormula, onNewUnit, onNewYield, onEditFormula, onEditUnit, onEditYield }: { formulas: Formula[]; units: Unit[]; yields: CatalogYield[]; onNewFormula: () => void; onNewUnit: () => void; onNewYield: () => void; onEditFormula: (value: Formula) => void; onEditUnit: (value: Unit) => void; onEditYield: (value: CatalogYield) => void }) {
  return <>
    <section className="data-card"><div className="card-toolbar"><SectionHeader title="Fórmulas y parámetros" subtitle="Los parámetros activos llegan a las calculadoras." /><button className="button button-primary" onClick={onNewFormula}><Plus size={16} /> Cálculo</button></div><div className="formula-grid">{formulas.map((formula) => <button className="formula-card" key={formula.id} onClick={() => onEditFormula(formula)}><div><strong>{formula.name}</strong><small>{formula.companyName}</small></div><code>{formula.code}</code><span>{formula.parameters.length} parámetros</span></button>)}</div></section>
    <div className="two-column-grid">
      <section className="data-card"><div className="card-toolbar"><SectionHeader title="Unidades" subtitle={`${units.length} unidades`} /><button className="button button-secondary" onClick={onNewUnit}><Plus size={16} /> Unidad</button></div><Table><thead><tr><th>Unidad</th><th>Tipo</th><th>Factor</th><th></th></tr></thead><tbody>{units.map((unit) => <tr key={unit.id}><td><strong>{unit.name}</strong><small>{unit.symbol} · {unit.companyName}</small></td><td>{unit.unitType}</td><td>{unit.conversionFactor}</td><td><button className="icon-button" onClick={() => onEditUnit(unit)}><Edit3 size={16} /></button></td></tr>)}</tbody></Table></section>
      <section className="data-card"><div className="card-toolbar"><SectionHeader title="Rendimientos" subtitle={`${yields.length} rendimientos`} /><button className="button button-secondary" onClick={onNewYield}><Plus size={16} /> Rendimiento</button></div><Table><thead><tr><th>Nombre</th><th>Producción</th><th>Horas</th><th></th></tr></thead><tbody>{yields.map((value) => <tr key={value.id}><td><strong>{value.name}</strong><small>{value.companyName}</small></td><td>{value.outputQuantity} {value.outputUnitSymbol}</td><td>{value.laborHours} h</td><td><button className="icon-button" onClick={() => onEditYield(value)}><Edit3 size={16} /></button></td></tr>)}</tbody></Table></section>
    </div>
  </>;
}

function PricingTab({ data, itemType, setItemType, target, setTarget, percentage, setPercentage, notes, setNotes, adjusting, onSubmit, onEdit }: { data: AdminData; itemType: "all" | "material" | "labor"; setItemType: (value: "all" | "material" | "labor") => void; target: "unit_cost" | "sale_price"; setTarget: (value: "unit_cost" | "sale_price") => void; percentage: string; setPercentage: (value: string) => void; notes: string; setNotes: (value: string) => void; adjusting: boolean; onSubmit: (event: FormEvent) => Promise<void>; onEdit: (item: GlobalCatalogItem) => void }) {
  const items = data.globalItems.filter((item) =>
    (item.itemType === "material" || item.itemType === "labor") &&
    (itemType === "all" || item.itemType === itemType),
  );
  return <>
    <form className="data-card" onSubmit={onSubmit}>
      <div className="card-toolbar"><SectionHeader title="Ajuste masivo global" subtitle={`Aplicará a ${items.filter((item) => item.active).length} elementos activos y será el nuevo valor predeterminado.`} /><span className="history-pill"><History size={15} /> {data.priceHistoryCount} cambios</span></div>
      <div className="form-grid four-columns"><SelectField label="Conceptos" value={itemType} onChange={(value) => setItemType(value as "all" | "material" | "labor")} options={[{ value: "all", label: "Materiales y mano de obra" }, { value: "material", label: "Solo materiales" }, { value: "labor", label: "Solo mano de obra" }]} /><SelectField label="Campo" value={target} onChange={(value) => setTarget(value as "unit_cost" | "sale_price")} options={[{ value: "unit_cost", label: "Costo unitario" }, { value: "sale_price", label: "Precio de venta" }]} /><TextField label="Porcentaje" type="number" value={percentage} onChange={setPercentage} suffix="%" /><TextField label="Nota" value={notes} onChange={setNotes} /></div>
      <button className="button button-primary" disabled={adjusting || items.length === 0}>{adjusting ? <Loader2 className="spin" size={17} /> : <SlidersHorizontal size={17} />} Aplicar ajuste</button>
    </form>
    <section className="data-card"><SectionHeader title="Catálogo maestro" subtitle="Estos precios no pertenecen a ninguna empresa. Cada usuario puede guardar un ajuste privado sin modificar esta lista." /><Table><thead><tr><th>Elemento</th><th>Tipo</th><th>Unidad</th><th>Costo</th><th>Venta</th><th>Margen</th><th>Desperdicio</th><th></th></tr></thead><tbody>{items.map((item) => { const margin = item.salePrice > 0 ? ((item.salePrice - item.unitCost) / item.salePrice) * 100 : 0; return <tr key={item.id}><td><strong>{item.name}</strong><small>{item.categoryName} · {item.sku || "Sin código"}</small></td><td>{item.itemType === "labor" ? "Mano de obra" : "Material"}</td><td>{item.unitSymbol}</td><td>{formatMoney(item.unitCost)}</td><td>{formatMoney(item.salePrice)}</td><td>{margin.toFixed(1)}%</td><td>{item.wastePercentage}%</td><td><button className="icon-button" onClick={() => onEdit(item)}><Edit3 size={17} /></button></td></tr>; })}</tbody></Table></section>
  </>;
}

function SystemTab({ data, email, onSignOut }: { data: AdminData; email: string; onSignOut: () => Promise<void> }) {
  return <div className="two-column-grid"><section className="data-card system-card"><BookOpen size={26} /><h2>Datos centrales</h2><p>{data.companies.length} empresas, {data.globalItems.length} precios globales y {data.formulas.length} fórmulas.</p><span className="badge badge-active">Supabase conectado</span></section><section className="data-card system-card"><UserCheck size={26} /><h2>Sesión administrativa</h2><p>{email}</p><button className="button button-danger" onClick={() => void onSignOut()}><LogOut size={16} /> Cerrar sesión</button></section></div>;
}

function EditorModal({ editor, setEditor, data, currentUserId, saving, onSave, onClose }: { editor: Editor; setEditor: (editor: Editor) => void; data: AdminData; currentUserId: string; saving: boolean; onSave: () => Promise<void>; onClose: () => void }) {
  const companyOptions = data.companies.map((company) => ({ value: company.id, label: company.name }));
  const title = { user: "Editar usuario", category: "Editar categoría", item: "Editar elemento", globalPrice: "Editar precio global", unit: "Editar unidad", yield: "Editar rendimiento", formula: "Editar cálculo" }[editor.kind];
  const isSelf = editor.kind === "user" && editor.draft.id === currentUserId;
  const globalItem = editor.kind === "globalPrice"
    ? data.globalItems.find((item) => item.id === editor.draft.id)
    : null;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-card" role="dialog" aria-modal="true"><div className="modal-header"><div><h2>{title}</h2><p>Los cambios se guardarán directamente en Supabase.</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div><div className="modal-body">
    {editor.kind === "user" && <div className="form-grid"><TextField label="Nombre completo" value={editor.draft.fullName} onChange={(fullName) => setEditor({ ...editor, draft: { ...editor.draft, fullName } })} /><TextField label="Teléfono" value={editor.draft.phone} onChange={(phone) => setEditor({ ...editor, draft: { ...editor.draft, phone } })} /><SelectField label="Rol" value={editor.draft.role} disabled={isSelf} onChange={(role) => setEditor({ ...editor, draft: { ...editor.draft, role: role as UserRole } })} options={[{ value: "contractor", label: "Contratista" }, { value: "client", label: "Cliente" }, { value: "super_admin", label: "Superadministrador" }]} /><ToggleField label={editor.draft.active ? "Cuenta activa" : editor.draft.approvedAt ? "Cuenta suspendida" : "Pendiente de aprobación"} checked={editor.draft.active} disabled={isSelf} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} />{isSelf && <p className="form-note">Tu propio rol y acceso están protegidos.</p>}</div>}
    {editor.kind === "category" && <div className="form-grid"><SelectField label="Empresa" value={editor.draft.companyId} disabled={Boolean(editor.draft.id)} onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })} options={companyOptions} /><TextField label="Nombre" value={editor.draft.name} onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })} /><TextField label="Descripción" value={editor.draft.description} onChange={(description) => setEditor({ ...editor, draft: { ...editor.draft, description } })} /><ToggleField label="Categoría activa" checked={editor.draft.active} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} /></div>}
    {editor.kind === "item" && (() => { const categories = data.categories.filter((value) => value.companyId === editor.draft.companyId); const units = data.units.filter((value) => value.companyId === editor.draft.companyId); return <div className="form-grid"><SelectField label="Empresa" value={editor.draft.companyId} disabled={Boolean(editor.draft.id)} onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId, categoryId: data.categories.find((value) => value.companyId === companyId)?.id ?? null, unitId: data.units.find((value) => value.companyId === companyId)?.id ?? "" } })} options={companyOptions} /><TextField label="Código / SKU" value={editor.draft.sku} onChange={(sku) => setEditor({ ...editor, draft: { ...editor.draft, sku } })} /><TextField label="Nombre" value={editor.draft.name} onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })} /><SelectField label="Tipo" value={editor.draft.itemType} onChange={(itemType) => setEditor({ ...editor, draft: { ...editor.draft, itemType: itemType as ItemType } })} options={ITEM_TYPES} /><SelectField label="Categoría" value={editor.draft.categoryId ?? ""} onChange={(categoryId) => setEditor({ ...editor, draft: { ...editor.draft, categoryId: categoryId || null } })} options={[{ value: "", label: "Sin categoría" }, ...categories.map((value) => ({ value: value.id, label: value.name }))]} /><SelectField label="Unidad" value={editor.draft.unitId} onChange={(unitId) => setEditor({ ...editor, draft: { ...editor.draft, unitId } })} options={units.map((value) => ({ value: value.id, label: `${value.name} (${value.symbol})` }))} /><TextField label="Costo unitario" type="number" value={String(editor.draft.unitCost)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, unitCost: Number(value) } })} /><TextField label="Precio de venta" type="number" value={String(editor.draft.salePrice)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, salePrice: Number(value) } })} /><TextField label="Desperdicio" type="number" value={String(editor.draft.wastePercentage)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, wastePercentage: Number(value) } })} suffix="%" /><TextField label="Descripción" value={editor.draft.description} onChange={(description) => setEditor({ ...editor, draft: { ...editor.draft, description } })} /><ToggleField label="Elemento activo" checked={editor.draft.active} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} /></div>; })()}
    {editor.kind === "globalPrice" && <div><p className="form-note"><strong>{globalItem?.name ?? "Concepto global"}</strong> · {globalItem?.unitName ?? "Unidad"} ({globalItem?.unitSymbol ?? "und."})</p><div className="form-grid"><TextField label="Costo unitario predeterminado" type="number" value={String(editor.draft.unitCost)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, unitCost: Number(value) } })} /><TextField label="Precio de venta predeterminado" type="number" value={String(editor.draft.salePrice)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, salePrice: Number(value) } })} /><TextField label="Desperdicio predeterminado" type="number" value={String(editor.draft.wastePercentage)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, wastePercentage: Number(value) } })} suffix="%" /></div><p className="form-note">El cambio llegará a todos los usuarios que no tengan un ajuste personal para este concepto.</p></div>}
    {editor.kind === "unit" && <div className="form-grid"><SelectField label="Empresa" value={editor.draft.companyId} disabled={Boolean(editor.draft.id)} onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })} options={companyOptions} /><TextField label="Código" value={editor.draft.code} onChange={(code) => setEditor({ ...editor, draft: { ...editor.draft, code } })} /><TextField label="Nombre" value={editor.draft.name} onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })} /><TextField label="Símbolo" value={editor.draft.symbol} onChange={(symbol) => setEditor({ ...editor, draft: { ...editor.draft, symbol } })} /><SelectField label="Tipo" value={editor.draft.unitType} onChange={(unitType) => setEditor({ ...editor, draft: { ...editor.draft, unitType: unitType as UnitType } })} options={UNIT_TYPES} /><TextField label="Factor" type="number" value={String(editor.draft.conversionFactor)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, conversionFactor: Number(value) } })} /><ToggleField label="Unidad activa" checked={editor.draft.active} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} /></div>}
    {editor.kind === "yield" && (() => { const items = data.items.filter((value) => value.companyId === editor.draft.companyId); const units = data.units.filter((value) => value.companyId === editor.draft.companyId); return <div className="form-grid"><SelectField label="Empresa" value={editor.draft.companyId} disabled={Boolean(editor.draft.id)} onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId, catalogItemId: data.items.find((value) => value.companyId === companyId)?.id ?? "", outputUnitId: data.units.find((value) => value.companyId === companyId)?.id ?? "" } })} options={companyOptions} /><TextField label="Nombre" value={editor.draft.name} onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })} /><SelectField label="Concepto" value={editor.draft.catalogItemId} onChange={(catalogItemId) => setEditor({ ...editor, draft: { ...editor.draft, catalogItemId } })} options={items.map((value) => ({ value: value.id, label: value.name }))} /><SelectField label="Unidad de salida" value={editor.draft.outputUnitId} onChange={(outputUnitId) => setEditor({ ...editor, draft: { ...editor.draft, outputUnitId } })} options={units.map((value) => ({ value: value.id, label: value.name }))} /><TextField label="Producción" type="number" value={String(editor.draft.outputQuantity)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, outputQuantity: Number(value) } })} /><TextField label="Horas" type="number" value={String(editor.draft.laborHours)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, laborHours: Number(value) } })} /><TextField label="Cuadrilla" type="number" value={String(editor.draft.crewSize)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, crewSize: Number(value) } })} /><TextField label="Desperdicio" type="number" value={String(editor.draft.wastePercentage)} onChange={(value) => setEditor({ ...editor, draft: { ...editor.draft, wastePercentage: Number(value) } })} suffix="%" /><TextField label="Notas" value={editor.draft.notes} onChange={(notes) => setEditor({ ...editor, draft: { ...editor.draft, notes } })} /><ToggleField label="Rendimiento activo" checked={editor.draft.active} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} /></div>; })()}
    {editor.kind === "formula" && <div className="formula-editor"><div className="form-grid"><SelectField label="Empresa" value={editor.draft.companyId} disabled={Boolean(editor.draft.id)} onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })} options={companyOptions} /><TextField label="Código" value={editor.draft.code} onChange={(code) => setEditor({ ...editor, draft: { ...editor.draft, code } })} /><TextField label="Nombre" value={editor.draft.name} onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })} /><TextField label="Descripción" value={editor.draft.description} onChange={(description) => setEditor({ ...editor, draft: { ...editor.draft, description } })} /><ToggleField label="Cálculo activo" checked={editor.draft.active} onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })} /></div><div className="parameter-header"><SectionHeader title="Parámetros" subtitle="Valores consumidos por la calculadora." /><button className="button button-secondary" onClick={() => { const parameter: FormulaParameter = { parameterKey: "", label: "", numericValue: 0, unitLabel: "", description: "", active: true, sortOrder: editor.draft.parameters.length * 10 + 10 }; setEditor({ ...editor, draft: { ...editor.draft, parameters: [...editor.draft.parameters, parameter] } }); }}><Plus size={15} /> Parámetro</button></div><div className="parameter-list">{editor.draft.parameters.map((parameter, index) => <div className="parameter-row" key={parameter.id ?? index}><TextField label="Clave" value={parameter.parameterKey} onChange={(value) => setEditor(updateFormulaParameter(editor, index, { parameterKey: value }))} /><TextField label="Etiqueta" value={parameter.label} onChange={(value) => setEditor(updateFormulaParameter(editor, index, { label: value }))} /><TextField label="Valor" type="number" value={String(parameter.numericValue)} onChange={(value) => setEditor(updateFormulaParameter(editor, index, { numericValue: Number(value) }))} /><TextField label="Unidad" value={parameter.unitLabel} onChange={(value) => setEditor(updateFormulaParameter(editor, index, { unitLabel: value }))} /><ToggleField label="Activo" checked={parameter.active} onChange={(active) => setEditor(updateFormulaParameter(editor, index, { active }))} /></div>)}</div></div>}
  </div><div className="modal-footer"><button className="button button-ghost" onClick={onClose}>Cancelar</button><button className="button button-primary" disabled={saving} onClick={() => void onSave()}>{saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />} Guardar cambios</button></div></div></div>;
}

function updateFormulaParameter(editor: Extract<Editor, { kind: "formula" }>, index: number, changes: Partial<FormulaParameter>): Editor {
  return { ...editor, draft: { ...editor.draft, parameters: editor.draft.parameters.map((parameter, position) => position === index ? { ...parameter, ...changes } : parameter) } };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>;
}

function TextField({ label, value, onChange, type = "text", suffix }: { label: string; value: string; onChange: (value: string) => void; type?: "text" | "number"; suffix?: string }) {
  return <Field label={label}><div className="suffix-input"><input type={type} step={type === "number" ? "any" : undefined} value={value} onChange={(event) => onChange(event.target.value)} />{suffix && <span>{suffix}</span>}</div></Field>;
}

function SelectField({ label, value, onChange, options, disabled = false }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; disabled?: boolean }) {
  return <Field label={label}><select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></Field>;
}

function ToggleField({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <label className="toggle-field"><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} /><span className="toggle-track"><span /></span><strong>{label}</strong></label>;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="section-header"><h2>{title}</h2><p>{subtitle}</p></div>;
}

function Table({ children }: { children: ReactNode }) {
  return <div className="table-wrapper"><table className="data-table">{children}</table></div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="empty-state"><CheckCircle2 size={24} /><span>{label}</span></div>;
}
