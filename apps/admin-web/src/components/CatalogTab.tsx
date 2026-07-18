import { Edit3, Plus } from "lucide-react";
import type { Category, CatalogItem } from "../admin-data";
import { SectionHeader, Table } from "./CommonUI";
import { formatMoney } from "../utils/helpers";

interface CatalogTabProps {
  categories: Category[];
  items: CatalogItem[];
  search: string;
  setSearch: (value: string) => void;
  onNewCategory: () => void;
  onNewItem: () => void;
  onEditCategory: (value: Category) => void;
  onEditItem: (value: CatalogItem) => void;
}

export function CatalogTab({
  categories,
  items,
  search,
  setSearch,
  onNewCategory,
  onNewItem,
  onEditCategory,
  onEditItem,
}: CatalogTabProps) {
  return (
    <>
      <section className="data-card">
        <div className="card-toolbar">
          <SectionHeader title="Categorías" subtitle={`${categories.length} categorías`} />
          <button className="button button-secondary" onClick={onNewCategory}>
            <Plus size={16} /> Categoría
          </button>
        </div>
        <div className="card-grid">
          {categories.map((category) => (
            <button className="mini-card" key={category.id} onClick={() => onEditCategory(category)}>
              <div>
                <strong>{category.name}</strong>
                <small>{category.companyName}</small>
              </div>
              <span className={`badge ${category.active ? "badge-active" : "badge-suspended"}`}>
                {category.active ? "Activa" : "Inactiva"}
              </span>
            </button>
          ))}
        </div>
      </section>
      <section className="data-card">
        <div className="card-toolbar">
          <SectionHeader title="Elementos del catálogo" subtitle={`${items.length} resultados`} />
          <div className="toolbar-actions">
            <input
              className="search-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar concepto..."
            />
            <button className="button button-primary" onClick={onNewItem}>
              <Plus size={16} /> Elemento
            </button>
          </div>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Elemento</th>
              <th>Empresa</th>
              <th>Unidad</th>
              <th>Costo</th>
              <th>Venta</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <code>{item.sku || "—"}</code>
                </td>
                <td>
                  <strong>{item.name}</strong>
                  <small>{item.categoryName}</small>
                </td>
                <td>{item.companyName}</td>
                <td>{item.unitSymbol}</td>
                <td>{formatMoney(item.unitCost)}</td>
                <td>{formatMoney(item.salePrice)}</td>
                <td>
                  <button className="icon-button" onClick={() => onEditItem(item)}>
                    <Edit3 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </>
  );
}
