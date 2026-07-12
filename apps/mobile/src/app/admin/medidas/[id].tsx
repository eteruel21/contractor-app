import { type Href, Redirect } from "expo-router";

export default function AdminMeasurementDetailScreen() {
  return <Redirect href={"/admin/medidas" as Href} />;
}
