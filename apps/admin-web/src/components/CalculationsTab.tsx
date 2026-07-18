import { Edit3, Plus } from "lucide-react";
import type { Formula, Unit, CatalogYield } from "../admin-data";
import { SectionHeader, Table } from "./CommonUI";

interface CalculationsTabProps {
  formulas: Formula[];
  units: Unit[];
  yields: CatalogYield[];
  onNewFormula: () => void;
  onNewUnit: () => void;
  onNewYield: () => void;
  onEditFormula: (value: Formula) => void;
  onEditUnit: (value: Unit) => void;
  onEditYield: (value: CatalogYield) => void;
}

export function CalculationsTab({
  formulas,
  units,
  yields,
  onNewFormula,
  onNewUnit,
  onNewYield,
  onEditFormula,
  onEditUnit,
  onEditYield,
}: CalculationsTabProps) {
  return (
    <>
      <section className="data-card">
        <div className="card-toolbar">
          <SectionHeader title="Fórmulas y parámetros" subtitle="Los parámetros activos llegan a las calculadoras." />
          <button className="button button-primary" onClick={onNewFormula}>
            <Plus size={16} /> Cálculo
          </button>
        </div>
        <div className="formula-grid">
          {formulas.map((formula) => (
            <button className="formula-card" key={formula.id} onClick={() => onEditFormula(formula)}>
              <div>
                <strong>{formula.name}</strong>
                <small>{formula.companyName}</small>
              </div>
              <code>{formula.code}</code>
              <span>{formula.parameters.length} parámetros</span>
            </button>
          ))}
        </div>
      </section>
      <div className="two-column-grid">
        <section className="data-card">
          <div className="card-toolbar">
            <SectionHeader title="Unidades" subtitle={`${units.length} unidades`} />
            <button className="button button-secondary" onClick={onNewUnit}>
              <Plus size={16} /> Unidad
            </button>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Unidad</th>
                <th>Tipo</th>
                <th>Factor</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {units.map((unit) => (
                <tr key={unit.id}>
                  <td>
                    <strong>{unit.name}</strong>
                    <small>
                      {unit.symbol} · {unit.companyName}
                    </small>
                  </td>
                  <td>{unit.unitType}</td>
                  <td>{unit.conversionFactor}</td>
                  <td>
                    <button className="icon-button" onClick={() => onEditUnit(unit)}>
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
        <section className="data-card">
          <div className="card-toolbar">
            <SectionHeader title="Rendimientos" subtitle={`${yields.length} rendimientos`} />
            <button className="button button-secondary" onClick={onNewYield}>
              <Plus size={16} /> Rendimiento
            </button>
          </div>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Producción</th>
                <th>Horas</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {yields.map((value) => (
                <tr key={value.id}>
                  <td>
                    <strong>{value.name}</strong>
                    <small>{value.companyName}</small>
                  </td>
                  <td>
                    {value.outputQuantity} {value.outputUnitSymbol}
                  </td>
                  <td>{value.laborHours} h</td>
                  <td>
                    <button className="icon-button" onClick={() => onEditYield(value)}>
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>
      </div>
    </>
  );
}
