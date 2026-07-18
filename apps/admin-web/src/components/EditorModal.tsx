import { Loader2, Plus, Save, X } from "lucide-react";
import type {
  AdminData,
  CategoryDraft,
  FormulaDraft,
  FormulaParameter,
  GlobalCatalogItemDraft,
  ItemDraft,
  ItemType,
  UnitDraft,
  UnitType,
  UserDraft,
  UserRole,
  YieldDraft,
} from "../admin-data";
import { SectionHeader, SelectField, TextField, ToggleField } from "./CommonUI";

export type Editor =
  | { kind: "user"; draft: UserDraft }
  | { kind: "category"; draft: CategoryDraft }
  | { kind: "item"; draft: ItemDraft }
  | { kind: "globalPrice"; draft: GlobalCatalogItemDraft }
  | { kind: "unit"; draft: UnitDraft }
  | { kind: "yield"; draft: YieldDraft }
  | { kind: "formula"; draft: FormulaDraft };

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

function updateFormulaParameter(
  editor: Extract<Editor, { kind: "formula" }>,
  index: number,
  changes: Partial<FormulaParameter>
): Editor {
  return {
    ...editor,
    draft: {
      ...editor.draft,
      parameters: editor.draft.parameters.map((parameter, position) =>
        position === index ? { ...parameter, ...changes } : parameter
      ),
    },
  };
}

interface EditorModalProps {
  editor: Editor;
  setEditor: (editor: Editor) => void;
  data: AdminData;
  currentUserId: string;
  saving: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
}

export function EditorModal({
  editor,
  setEditor,
  data,
  currentUserId,
  saving,
  onSave,
  onClose,
}: EditorModalProps) {
  const companyOptions = data.companies.map((company) => ({
    value: company.id,
    label: company.name,
  }));

  const title = {
    user: "Editar usuario",
    category: "Editar categoría",
    item: "Editar elemento",
    globalPrice: "Editar precio global",
    unit: "Editar unidad",
    yield: "Editar rendimiento",
    formula: "Editar cálculo",
  }[editor.kind];

  const isSelf = editor.kind === "user" && editor.draft.id === currentUserId;
  const globalItem =
    editor.kind === "globalPrice"
      ? data.globalItems.find((item) => item.id === editor.draft.id)
      : null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <h2>{title}</h2>
            <p>Los cambios se guardarán en PostgreSQL mediante la API.</p>
          </div>
          <button className="icon-button" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        <div className="modal-body">
          {editor.kind === "user" && (
            <div className="form-grid">
              <TextField
                label="Nombre completo"
                value={editor.draft.fullName}
                onChange={(fullName) => setEditor({ ...editor, draft: { ...editor.draft, fullName } })}
              />
              <TextField
                label="Teléfono"
                value={editor.draft.phone}
                onChange={(phone) => setEditor({ ...editor, draft: { ...editor.draft, phone } })}
              />
              <SelectField
                label="Rol"
                value={editor.draft.role}
                disabled={isSelf}
                onChange={(role) =>
                  setEditor({ ...editor, draft: { ...editor.draft, role: role as UserRole } })
                }
                options={[
                  { value: "contractor", label: "Contratista" },
                  { value: "client", label: "Cliente" },
                  { value: "super_admin", label: "Superadministrador" },
                ]}
              />
              <ToggleField
                label={
                  editor.draft.active
                    ? "Cuenta activa"
                    : editor.draft.approvedAt
                      ? "Cuenta suspendida"
                      : "Pendiente de aprobación"
                }
                checked={editor.draft.active}
                disabled={isSelf}
                onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
              />
              {isSelf && <p className="form-note">Tu propio rol y acceso están protegidos.</p>}
            </div>
          )}
          {editor.kind === "category" && (
            <div className="form-grid">
              <SelectField
                label="Empresa"
                value={editor.draft.companyId}
                disabled={Boolean(editor.draft.id)}
                onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })}
                options={companyOptions}
              />
              <TextField
                label="Nombre"
                value={editor.draft.name}
                onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })}
              />
              <TextField
                label="Descripción"
                value={editor.draft.description}
                onChange={(description) =>
                  setEditor({ ...editor, draft: { ...editor.draft, description } })
                }
              />
              <ToggleField
                label="Categoría activa"
                checked={editor.draft.active}
                onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
              />
            </div>
          )}
          {editor.kind === "item" &&
            (() => {
              const categories = data.categories.filter(
                (value) => value.companyId === editor.draft.companyId
              );
              const units = data.units.filter((value) => value.companyId === editor.draft.companyId);
              return (
                <div className="form-grid">
                  <SelectField
                    label="Empresa"
                    value={editor.draft.companyId}
                    disabled={Boolean(editor.draft.id)}
                    onChange={(companyId) =>
                      setEditor({
                        ...editor,
                        draft: {
                          ...editor.draft,
                          companyId,
                          categoryId:
                            data.categories.find((value) => value.companyId === companyId)?.id ?? null,
                          unitId: data.units.find((value) => value.companyId === companyId)?.id ?? "",
                        },
                      })
                    }
                    options={companyOptions}
                  />
                  <TextField
                    label="Código / SKU"
                    value={editor.draft.sku}
                    onChange={(sku) => setEditor({ ...editor, draft: { ...editor.draft, sku } })}
                  />
                  <TextField
                    label="Nombre"
                    value={editor.draft.name}
                    onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })}
                  />
                  <SelectField
                    label="Tipo"
                    value={editor.draft.itemType}
                    onChange={(itemType) =>
                      setEditor({ ...editor, draft: { ...editor.draft, itemType: itemType as ItemType } })
                    }
                    options={ITEM_TYPES}
                  />
                  <SelectField
                    label="Categoría"
                    value={editor.draft.categoryId ?? ""}
                    onChange={(categoryId) =>
                      setEditor({ ...editor, draft: { ...editor.draft, categoryId: categoryId || null } })
                    }
                    options={[
                      { value: "", label: "Sin categoría" },
                      ...categories.map((value) => ({ value: value.id, label: value.name })),
                    ]}
                  />
                  <SelectField
                    label="Unidad"
                    value={editor.draft.unitId}
                    onChange={(unitId) => setEditor({ ...editor, draft: { ...editor.draft, unitId } })}
                    options={units.map((value) => ({
                      value: value.id,
                      label: `${value.name} (${value.symbol})`,
                    }))}
                  />
                  <TextField
                    label="Costo unitario"
                    type="number"
                    value={String(editor.draft.unitCost)}
                    onChange={(value) =>
                      setEditor({ ...editor, draft: { ...editor.draft, unitCost: Number(value) } })
                    }
                  />
                  <TextField
                    label="Precio de venta"
                    type="number"
                    value={String(editor.draft.salePrice)}
                    onChange={(value) =>
                      setEditor({ ...editor, draft: { ...editor.draft, salePrice: Number(value) } })
                    }
                  />
                  <TextField
                    label="Desperdicio"
                    type="number"
                    value={String(editor.draft.wastePercentage)}
                    onChange={(value) =>
                      setEditor({
                        ...editor,
                        draft: { ...editor.draft, wastePercentage: Number(value) },
                      })
                    }
                    suffix="%"
                  />
                  <TextField
                    label="Descripción"
                    value={editor.draft.description}
                    onChange={(description) =>
                      setEditor({ ...editor, draft: { ...editor.draft, description } })
                    }
                  />
                  <ToggleField
                    label="Elemento activo"
                    checked={editor.draft.active}
                    onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
                  />
                </div>
              );
            })()}
          {editor.kind === "globalPrice" && (
            <div>
              <p className="form-note">
                <strong>{globalItem?.name ?? "Concepto global"}</strong> ·{" "}
                {globalItem?.unitName ?? "Unidad"} ({globalItem?.unitSymbol ?? "und."})
              </p>
              <div className="form-grid">
                <TextField
                  label="Costo predeterminado"
                  type="number"
                  value={String(editor.draft.unitCost)}
                  onChange={(value) =>
                    setEditor({ ...editor, draft: { ...editor.draft, unitCost: Number(value) } })
                  }
                />
                <TextField
                  label="Precio de venta predeterminado"
                  type="number"
                  value={String(editor.draft.salePrice)}
                  onChange={(value) =>
                    setEditor({ ...editor, draft: { ...editor.draft, salePrice: Number(value) } })
                  }
                />
                <TextField
                  label="Desperdicio predeterminado"
                  type="number"
                  value={String(editor.draft.wastePercentage)}
                  onChange={(value) =>
                    setEditor({
                      ...editor,
                      draft: { ...editor.draft, wastePercentage: Number(value) },
                    })
                  }
                  suffix="%"
                />
              </div>
              <p className="form-note">
                El cambio llegará a todos los usuarios que no tengan un ajuste personal para este
                concepto.
              </p>
            </div>
          )}
          {editor.kind === "unit" && (
            <div className="form-grid">
              <SelectField
                label="Empresa"
                value={editor.draft.companyId}
                disabled={Boolean(editor.draft.id)}
                onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })}
                options={companyOptions}
              />
              <TextField
                label="Código"
                value={editor.draft.code}
                onChange={(code) => setEditor({ ...editor, draft: { ...editor.draft, code } })}
              />
              <TextField
                label="Nombre"
                value={editor.draft.name}
                onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })}
              />
              <TextField
                label="Símbolo"
                value={editor.draft.symbol}
                onChange={(symbol) => setEditor({ ...editor, draft: { ...editor.draft, symbol } })}
              />
              <SelectField
                label="Tipo"
                value={editor.draft.unitType}
                onChange={(unitType) =>
                  setEditor({ ...editor, draft: { ...editor.draft, unitType: unitType as UnitType } })
                }
                options={UNIT_TYPES}
              />
              <TextField
                label="Factor"
                type="number"
                value={String(editor.draft.conversionFactor)}
                onChange={(value) =>
                  setEditor({ ...editor, draft: { ...editor.draft, conversionFactor: Number(value) } })
                }
              />
              <ToggleField
                label="Unidad activa"
                checked={editor.draft.active}
                onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
              />
            </div>
          )}
          {editor.kind === "yield" &&
            (() => {
              const items = data.items.filter((value) => value.companyId === editor.draft.companyId);
              const units = data.units.filter((value) => value.companyId === editor.draft.companyId);
              return (
                <div className="form-grid">
                  <SelectField
                    label="Empresa"
                    value={editor.draft.companyId}
                    disabled={Boolean(editor.draft.id)}
                    onChange={(companyId) =>
                      setEditor({
                        ...editor,
                        draft: {
                          ...editor.draft,
                          companyId,
                          catalogItemId: data.items.find((value) => value.companyId === companyId)?.id ?? "",
                          outputUnitId: data.units.find((value) => value.companyId === companyId)?.id ?? "",
                        },
                      })
                    }
                    options={companyOptions}
                  />
                  <TextField
                    label="Nombre"
                    value={editor.draft.name}
                    onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })}
                  />
                  <SelectField
                    label="Concepto"
                    value={editor.draft.catalogItemId}
                    onChange={(catalogItemId) =>
                      setEditor({ ...editor, draft: { ...editor.draft, catalogItemId } })
                    }
                    options={items.map((value) => ({ value: value.id, label: value.name }))}
                  />
                  <SelectField
                    label="Unidad de salida"
                    value={editor.draft.outputUnitId}
                    onChange={(outputUnitId) =>
                      setEditor({ ...editor, draft: { ...editor.draft, outputUnitId } })
                    }
                    options={units.map((value) => ({ value: value.id, label: value.name }))}
                  />
                  <TextField
                    label="Producción"
                    type="number"
                    value={String(editor.draft.outputQuantity)}
                    onChange={(value) =>
                      setEditor({
                        ...editor,
                        draft: { ...editor.draft, outputQuantity: Number(value) },
                      })
                    }
                  />
                  <TextField
                    label="Horas"
                    type="number"
                    value={String(editor.draft.laborHours)}
                    onChange={(value) =>
                      setEditor({ ...editor, draft: { ...editor.draft, laborHours: Number(value) } })
                    }
                  />
                  <TextField
                    label="Cuadrilla"
                    type="number"
                    value={String(editor.draft.crewSize)}
                    onChange={(value) =>
                      setEditor({ ...editor, draft: { ...editor.draft, crewSize: Number(value) } })
                    }
                  />
                  <TextField
                    label="Desperdicio"
                    type="number"
                    value={String(editor.draft.wastePercentage)}
                    onChange={(value) =>
                      setEditor({
                        ...editor,
                        draft: { ...editor.draft, wastePercentage: Number(value) },
                      })
                    }
                    suffix="%"
                  />
                  <TextField
                    label="Notas"
                    value={editor.draft.notes}
                    onChange={(notes) => setEditor({ ...editor, draft: { ...editor.draft, notes } })}
                  />
                  <ToggleField
                    label="Rendimiento activo"
                    checked={editor.draft.active}
                    onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
                  />
                </div>
              );
            })()}
          {editor.kind === "formula" && (
            <div className="formula-editor">
              <div className="form-grid">
                <SelectField
                  label="Empresa"
                  value={editor.draft.companyId}
                  disabled={Boolean(editor.draft.id)}
                  onChange={(companyId) => setEditor({ ...editor, draft: { ...editor.draft, companyId } })}
                  options={companyOptions}
                />
                <TextField
                  label="Código"
                  value={editor.draft.code}
                  onChange={(code) => setEditor({ ...editor, draft: { ...editor.draft, code } })}
                />
                <TextField
                  label="Nombre"
                  value={editor.draft.name}
                  onChange={(name) => setEditor({ ...editor, draft: { ...editor.draft, name } })}
                />
                <TextField
                  label="Descripción"
                  value={editor.draft.description}
                  onChange={(description) =>
                    setEditor({ ...editor, draft: { ...editor.draft, description } })
                  }
                />
                <ToggleField
                  label="Cálculo activo"
                  checked={editor.draft.active}
                  onChange={(active) => setEditor({ ...editor, draft: { ...editor.draft, active } })}
                />
              </div>
              <div className="parameter-header">
                <SectionHeader title="Parámetros" subtitle="Valores consumidos por la calculadora." />
                <button
                  className="button button-secondary"
                  onClick={() => {
                    const parameter: FormulaParameter = {
                      parameterKey: "",
                      label: "",
                      numericValue: 0,
                      unitLabel: "",
                      description: "",
                      active: true,
                      sortOrder: editor.draft.parameters.length * 10 + 10,
                    };
                    setEditor({
                      ...editor,
                      draft: { ...editor.draft, parameters: [...editor.draft.parameters, parameter] },
                    });
                  }}
                >
                  <Plus size={15} /> Parámetro
                </button>
              </div>
              <div className="parameter-list">
                {editor.draft.parameters.map((parameter, index) => (
                  <div className="parameter-row" key={parameter.id ?? index}>
                    <TextField
                      label="Clave"
                      value={parameter.parameterKey}
                      onChange={(value) => setEditor(updateFormulaParameter(editor, index, { parameterKey: value }))}
                    />
                    <TextField
                      label="Etiqueta"
                      value={parameter.label}
                      onChange={(value) => setEditor(updateFormulaParameter(editor, index, { label: value }))}
                    />
                    <TextField
                      label="Valor"
                      type="number"
                      value={String(parameter.numericValue)}
                      onChange={(value) => setEditor(updateFormulaParameter(editor, index, { numericValue: Number(value) }))}
                    />
                    <TextField
                      label="Unidad"
                      value={parameter.unitLabel}
                      onChange={(value) => setEditor(updateFormulaParameter(editor, index, { unitLabel: value }))}
                    />
                    <ToggleField
                      label="Activo"
                      checked={parameter.active}
                      onChange={(active) => setEditor(updateFormulaParameter(editor, index, { active }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="button button-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="button button-primary" disabled={saving} onClick={() => void onSave()}>
            {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />} Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
