import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  History,
  Loader2,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import {
  saveGlobalCatalogPricing,
  type AdminData,
  type GlobalCatalogItem,
  type ItemType,
} from "../admin-data";
import { Field, SectionHeader, SelectField, Table, TextField } from "./CommonUI";
import { formatMoney } from "../utils/helpers";

interface PricingTabProps {
  data: AdminData;
  itemType: ItemType | "all";
  setItemType: (value: ItemType | "all") => void;
  target: "unit_cost" | "sale_price";
  setTarget: (value: "unit_cost" | "sale_price") => void;
  percentage: string;
  setPercentage: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
  adjusting: boolean;
  onSubmit: (event: FormEvent) => Promise<void>;
  onEdit: (item: GlobalCatalogItem) => void;
  onReload: () => Promise<void>;
}

export function PricingTab({
  data,
  itemType,
  setItemType,
  target,
  setTarget,
  percentage,
  setPercentage,
  notes,
  setNotes,
  adjusting,
  onSubmit,
  onEdit,
  onReload,
}: PricingTabProps) {
  const [pricingSearch, setPricingSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [inlineEdit, setInlineEdit] = useState<{
    id: string;
    field: "unitCost" | "salePrice";
    value: string;
  } | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const PAGE_SIZE = 50;

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of data.globalItems) {
      if (item.categoryName) set.add(item.categoryName);
    }
    return Array.from(set).sort();
  }, [data.globalItems]);

  const allFiltered = useMemo(() => {
    const term = pricingSearch.trim().toLowerCase();
    return data.globalItems.filter((item) => {
      if (itemType !== "all" && item.itemType !== itemType) return false;
      if (categoryFilter !== "all" && item.categoryName !== categoryFilter) return false;
      if (
        term &&
        ![item.name, item.sku, item.categoryName, item.unitSymbol]
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
        return false;
      return true;
    });
  }, [data.globalItems, itemType, categoryFilter, pricingSearch]);

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = allFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [pricingSearch, categoryFilter, itemType]);

  const typeLabel = (type: string) => {
    const map: Record<string, string> = {
      material: "Material",
      labor: "Mano de obra",
      service: "Servicio",
      equipment: "Equipo",
      subcontract: "Subcontrato",
    };
    return map[type] ?? type;
  };

  const typeClass = (type: string) => `type-label type-label--${type}`;

  async function handleInlineSave() {
    if (!inlineEdit) return;
    const item = data.globalItems.find((i) => i.id === inlineEdit.id);
    if (!item) return;
    const numericValue = Number(inlineEdit.value.replace(",", "."));
    if (!Number.isFinite(numericValue) || numericValue < 0) return;
    setInlineSaving(true);
    try {
      await saveGlobalCatalogPricing({
        id: item.id,
        unitCost: inlineEdit.field === "unitCost" ? numericValue : item.unitCost,
        salePrice: inlineEdit.field === "salePrice" ? numericValue : item.salePrice,
        wastePercentage: item.wastePercentage,
      });
      setInlineEdit(null);
      void onReload();
    } catch {
      // silently keep the inline editor open on failure
    } finally {
      setInlineSaving(false);
    }
  }

  const activeCount = allFiltered.filter((item) => item.active).length;
  const startIndex = (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, allFiltered.length);

  return (
    <>
      {/* Ajuste masivo */}
      <form className="data-card" onSubmit={onSubmit}>
        <div className="card-toolbar">
          <SectionHeader
            title="Ajuste masivo global"
            subtitle={`Aplicará a ${activeCount} elementos activos filtrados y será el nuevo valor predeterminado.`}
          />
          <span className="history-pill">
            <History size={15} /> {data.priceHistoryCount} cambios
          </span>
        </div>
        <div className="form-grid four-columns">
          <SelectField
            label="Conceptos"
            value={itemType}
            onChange={(value) => setItemType(value as ItemType | "all")}
            options={[
              { value: "all", label: "Todos los tipos" },
              { value: "service", label: "Servicios" },
              { value: "material", label: "Materiales" },
              { value: "labor", label: "Mano de obra" },
              { value: "equipment", label: "Equipo" },
              { value: "subcontract", label: "Subcontratos" },
            ]}
          />
          <SelectField
            label="Campo"
            value={target}
            onChange={(value) => setTarget(value as "unit_cost" | "sale_price")}
            options={[
              { value: "unit_cost", label: "Costo unitario" },
              { value: "sale_price", label: "Precio de venta" },
            ]}
          />
          <TextField label="Porcentaje" type="number" value={percentage} onChange={setPercentage} suffix="%" />
          <TextField label="Nota" value={notes} onChange={setNotes} />
        </div>
        <button className="button button-primary" disabled={adjusting}>
          {adjusting ? <Loader2 className="spin" size={17} /> : <SlidersHorizontal size={17} />}{" "}
          Aplicar ajuste
        </button>
      </form>

      {/* Catálogo maestro con filtros */}
      <section className="data-card">
        <SectionHeader
          title="Catálogo maestro"
          subtitle="Precios oficiales de la Contraloría General de Panamá. Haz clic en un precio para editarlo directamente."
        />

        <div className="pricing-filters">
          <div className="search-field">
            <Field label="Buscar">
              <div className="suffix-input">
                <input
                  type="text"
                  placeholder="Nombre, código SKU o categoría…"
                  value={pricingSearch}
                  onChange={(e) => setPricingSearch(e.target.value)}
                />
                <span>
                  <Search size={15} />
                </span>
              </div>
            </Field>
          </div>
          <div className="category-field">
            <SelectField
              label="Categoría"
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: `Todas (${categories.length})` },
                ...categories.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>
          <div className="type-field">
            <SelectField
              label="Tipo"
              value={itemType}
              onChange={(value) => setItemType(value as ItemType | "all")}
              options={[
                { value: "all", label: "Todos" },
                { value: "service", label: "Servicio" },
                { value: "material", label: "Material" },
                { value: "labor", label: "Mano de obra" },
                { value: "equipment", label: "Equipo" },
                { value: "subcontract", label: "Subcontrato" },
              ]}
            />
          </div>
        </div>

        <div className="pricing-result-count">
          <span>
            Mostrando {allFiltered.length > 0 ? `${startIndex}–${endIndex}` : "0"} de {allFiltered.length}{" "}
            partidas
          </span>
          {allFiltered.length !== data.globalItems.length && (
            <span>{data.globalItems.length} totales</span>
          )}
        </div>

        <Table>
          <thead>
            <tr>
              <th>Elemento</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Unidad</th>
              <th>Costo</th>
              <th>Venta</th>
              <th>Margen</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => {
              const margin =
                item.salePrice > 0 ? ((item.salePrice - item.unitCost) / item.salePrice) * 100 : 0;
              const isExpanded = expandedId === item.id;
              return (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <small>{item.sku || "Sin código"}</small>
                    {item.description && (
                      <>
                        <button
                          className="item-description-toggle"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                        </button>
                        {isExpanded && (
                          <div className="item-description-box">{item.description}</div>
                        )}
                      </>
                    )}
                  </td>
                  <td>
                    <span className={typeClass(item.itemType)}>{typeLabel(item.itemType)}</span>
                  </td>
                  <td>
                    <span className="category-chip">{item.categoryName}</span>
                  </td>
                  <td>{item.unitSymbol}</td>
                  <td>
                    {inlineEdit?.id === item.id && inlineEdit.field === "unitCost" ? (
                      <span className="editable-cell">
                        <input
                          type="number"
                          step="any"
                          autoFocus
                          value={inlineEdit.value}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          onBlur={() => void handleInlineSave()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleInlineSave();
                            if (e.key === "Escape") setInlineEdit(null);
                          }}
                          disabled={inlineSaving}
                        />
                      </span>
                    ) : (
                      <span
                        className="editable-cell"
                        onClick={() =>
                          setInlineEdit({
                            id: item.id,
                            field: "unitCost",
                            value: String(item.unitCost),
                          })
                        }
                        title="Clic para editar"
                      >
                        {formatMoney(item.unitCost)}
                      </span>
                    )}
                  </td>
                  <td>
                    {inlineEdit?.id === item.id && inlineEdit.field === "salePrice" ? (
                      <span className="editable-cell">
                        <input
                          type="number"
                          step="any"
                          autoFocus
                          value={inlineEdit.value}
                          onChange={(e) => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                          onBlur={() => void handleInlineSave()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void handleInlineSave();
                            if (e.key === "Escape") setInlineEdit(null);
                          }}
                          disabled={inlineSaving}
                        />
                      </span>
                    ) : (
                      <span
                        className="editable-cell"
                        onClick={() =>
                          setInlineEdit({
                            id: item.id,
                            field: "salePrice",
                            value: String(item.salePrice),
                          })
                        }
                        title="Clic para editar"
                      >
                        {formatMoney(item.salePrice)}
                      </span>
                    )}
                  </td>
                  <td>{margin.toFixed(1)}%</td>
                  <td>
                    <button
                      className="icon-button"
                      onClick={() => onEdit(item)}
                      title="Editar todos los campos"
                    >
                      <Edit3 size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="pagination">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (safePage <= 4) {
                pageNum = i + 1;
              } else if (safePage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = safePage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  className={pageNum === safePage ? "active" : ""}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <span className="page-info">
              {safePage} / {totalPages}
            </span>
            <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </section>
    </>
  );
}
