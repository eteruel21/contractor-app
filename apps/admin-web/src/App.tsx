import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, Loader2, Lock, Mail, RefreshCw } from "lucide-react";

import {
  adjustPrices,
  type AdminData,
  type CatalogItem,
  type Category,
  type Formula,
  type GlobalCatalogItem,
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
  type CatalogYield,
  type UserDraft,
  type CategoryDraft,
  type ItemDraft,
  type GlobalCatalogItemDraft,
  type UnitDraft,
  type YieldDraft,
  type FormulaDraft,
} from "./admin-data";
import {
  type AdminSession,
  loginAdmin,
  logoutAdmin,
  restoreAdminSession,
} from "./api";
import { errorMessage } from "./utils/helpers";
import {
  FullScreenLoader,
  AlertBanner,
  SuccessBanner,
  Field,
} from "./components/CommonUI";
import { Sidebar, type Tab } from "./components/Sidebar";
import { DashboardTab } from "./components/DashboardTab";
import { UsersTab } from "./components/UsersTab";
import { CatalogTab } from "./components/CatalogTab";
import { CalculationsTab } from "./components/CalculationsTab";
import { PricingTab } from "./components/PricingTab";
import { SystemTab } from "./components/SystemTab";
import { EditorModal, type Editor } from "./components/EditorModal";

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

function globalCatalogItemDraft(item: GlobalCatalogItem): GlobalCatalogItemDraft {
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
  const [session, setSession] = useState<AdminSession | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  const isAuthorized = Boolean(
    session?.user.active && session.user.role === "super_admin"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem("admin_active_tab");
    return (saved as Tab) || "dashboard";
  });

  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  const [data, setData] = useState<AdminData>(EMPTY_DATA);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);

  const [priceType, setPriceType] = useState<ItemType | "all">("all");
  const [priceTarget, setPriceTarget] = useState<"unit_cost" | "sale_price">("sale_price");
  const [pricePercentage, setPricePercentage] = useState("5");
  const [priceNotes, setPriceNotes] = useState("");
  const [adjustingPrices, setAdjustingPrices] = useState(false);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      try {
        const nextSession = await restoreAdminSession();

        if (!active) return;

        setSession(nextSession);
        setAuthError(null);
      } catch (error) {
        if (!active) return;

        setSession(null);
        setAuthError(errorMessage(error));
      } finally {
        if (active) {
          setSessionLoading(false);
        }
      }
    }

    void restoreSession();

    return () => {
      active = false;
    };
  }, []);

  const loadData = useCallback(async () => {
    if (!isAuthorized) return;
    setLoadingData(true);
    setDataError(null);
    try {
      const nextData = await loadAdminData();
      setData(nextData);
      setDataError(
        nextData.warnings.length > 0 ? nextData.warnings.join(" ") : null
      );
    } catch (error) {
      setDataError(errorMessage(error));
    } finally {
      setLoadingData(false);
    }
  }, [isAuthorized]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pendingUsers = useMemo(
    () => data.users.filter((user) => !user.active && !user.approvedAt),
    [data.users]
  );
  const normalizedSearch = search.trim().toLowerCase();
  const visibleUsers = data.users.filter((user) =>
    [user.fullName, user.phone, user.companyName, user.role]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );
  const visibleItems = data.items.filter((item) =>
    [item.sku, item.name, item.categoryName, item.companyName]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSearch)
  );

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    setAuthLoading(true);
    setAuthError(null);

    try {
      const nextSession = await loginAdmin(email, password);

      setSession(nextSession);
      setPassword("");
    } catch (error) {
      setSession(null);
      setAuthError(errorMessage(error));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await logoutAdmin();
    } finally {
      setSession(null);
      setData(EMPTY_DATA);
    }
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
      } else if (editor.kind === "unit") await saveUnit(editor.draft);
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
      .filter(
        (item) => item.active && (priceType === "all" || item.itemType === priceType)
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
      draft: {
        id: "",
        companyId: data.companies[0]?.id ?? "",
        name: "",
        description: "",
        active: true,
      },
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

  if (sessionLoading) {
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
            <div className="icon-input">
              <Mail size={18} />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          </Field>
          <Field label="Contraseña">
            <div className="icon-input">
              <Lock size={18} />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingUsersCount={pendingUsers.length}
        email={session.user.email}
        onSignOut={handleSignOut}
      />

      <main className="main-content">
        <header className="header">
          <div className="title-container">
            <h1>{titles[activeTab][0]}</h1>
            <p>{titles[activeTab][1]}</p>
          </div>
          <button className="button button-secondary" onClick={() => void loadData()} disabled={loadingData}>
            <RefreshCw className={loadingData ? "spin" : ""} size={17} /> Actualizar
          </button>
        </header>

        {dataError && <AlertBanner message={dataError} onClose={() => setDataError(null)} />}
        {success && <SuccessBanner message={success} />}

        {loadingData ? (
          <div className="content-loader">
            <Loader2 className="spin" size={34} />
            <span>Sincronizando con PostgreSQL...</span>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardTab
                data={data}
                pendingUsers={pendingUsers}
                onEdit={(user) => setEditor({ kind: "user", draft: userDraft(user) })}
                onToggle={toggleUser}
              />
            )}
            {activeTab === "users" && (
              <UsersTab
                users={visibleUsers}
                search={search}
                setSearch={setSearch}
                currentUserId={session.user.id}
                saving={saving}
                onEdit={(user) => setEditor({ kind: "user", draft: userDraft(user) })}
                onToggle={toggleUser}
              />
            )}
            {activeTab === "catalog" && (
              <CatalogTab
                categories={data.categories}
                items={visibleItems}
                search={search}
                setSearch={setSearch}
                onNewCategory={newCategory}
                onNewItem={newItem}
                onEditCategory={(category) => setEditor({ kind: "category", draft: categoryDraft(category) })}
                onEditItem={(item) => setEditor({ kind: "item", draft: itemDraft(item) })}
              />
            )}
            {activeTab === "calculations" && (
              <CalculationsTab
                formulas={data.formulas}
                units={data.units}
                yields={data.yields}
                onNewFormula={newFormula}
                onNewUnit={newUnit}
                onNewYield={newYield}
                onEditFormula={(formula) => setEditor({ kind: "formula", draft: formulaDraft(formula) })}
                onEditUnit={(unit) => setEditor({ kind: "unit", draft: unitDraft(unit) })}
                onEditYield={(value) => setEditor({ kind: "yield", draft: yieldDraft(value) })}
              />
            )}
            {activeTab === "pricing" && (
              <PricingTab
                data={data}
                itemType={priceType}
                setItemType={setPriceType}
                target={priceTarget}
                setTarget={setPriceTarget}
                percentage={pricePercentage}
                setPercentage={setPricePercentage}
                notes={priceNotes}
                setNotes={setPriceNotes}
                adjusting={adjustingPrices}
                onSubmit={handlePriceAdjustment}
                onEdit={(item) => setEditor({ kind: "globalPrice", draft: globalCatalogItemDraft(item) })}
                onReload={loadData}
              />
            )}
            {activeTab === "system" && (
              <SystemTab data={data} email={session.user.email ?? ""} onSignOut={handleSignOut} />
            )}
          </>
        )}
      </main>

      {editor && (
        <EditorModal
          editor={editor}
          setEditor={setEditor}
          data={data}
          currentUserId={session.user.id}
          saving={saving}
          onSave={submitEditor}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}
