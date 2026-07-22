export type FormulaCode =
  | "concrete"
  | "masonry"
  | "gypsum"
  | "pvc_ceiling"
  | "paint"
  | "flooring"
  | "electrical"
  | "special_systems"
  | "air_conditioning"
  | "mdf_furniture";

export type BudgetItemType =
  | "material"
  | "labor"
  | "equipment"
  | "service"
  | "subcontract"
  | "manual";

export interface StandardLineItem {
  itemType: BudgetItemType;
  description: string;
  unitName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  subtotal: number;
}

export interface CalculationSummary {
  materialsCost: number;
  laborCost: number;
  totalCost: number;
}

export interface CalculationExecutionResult<TResult = any> {
  formulaCode: string;
  formulaName: string;
  summary: CalculationSummary;
  lineItems: StandardLineItem[];
  rawResult: TResult;
}

export interface CalculatorDefinition<TInput = any, TPrices = any, TResult = any> {
  code: FormulaCode;
  name: string;
  category: string;
  calculate: (input: TInput, prices: TPrices) => TResult;
  toLineItems: (result: TResult, input: TInput, prices: TPrices) => StandardLineItem[];
  extractSummary: (result: TResult) => CalculationSummary;
}

class FormulaEngine {
  private calculators = new Map<FormulaCode, CalculatorDefinition>();

  register<TInput, TPrices, TResult>(
    def: CalculatorDefinition<TInput, TPrices, TResult>
  ): void {
    this.calculators.set(def.code, def);
  }

  get(code: FormulaCode): CalculatorDefinition | undefined {
    return this.calculators.get(code);
  }

  list(): { code: FormulaCode; name: string; category: string }[] {
    return Array.from(this.calculators.values()).map((c) => ({
      code: c.code,
      name: c.name,
      category: c.category
    }));
  }

  execute<TInput = any, TPrices = any, TResult = any>(
    code: FormulaCode,
    input: TInput,
    prices: TPrices
  ): CalculationExecutionResult<TResult> {
    const calc = this.calculators.get(code);
    if (!calc) {
      throw new Error(`Calculadora no registrada: ${code}`);
    }

    const rawResult = calc.calculate(input, prices);
    const summary = calc.extractSummary(rawResult);
    const lineItems = calc.toLineItems(rawResult, input, prices);

    return {
      formulaCode: calc.code,
      formulaName: calc.name,
      summary,
      lineItems,
      rawResult
    };
  }
}

export const calculatorEngine = new FormulaEngine();
