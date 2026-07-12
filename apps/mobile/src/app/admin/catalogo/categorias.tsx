import { type Href, Redirect } from "expo-router";

export default function AdminCatalogRedirect() {
  return <Redirect href={"/catalogo" as Href} />;
}