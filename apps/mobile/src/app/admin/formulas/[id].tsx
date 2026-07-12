import { type Href, Redirect } from "expo-router";

export default function AdminFormulaDetailScreen() {
  return <Redirect href={"/admin/formulas" as Href} />;
}
