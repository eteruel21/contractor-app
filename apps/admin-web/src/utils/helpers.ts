import type { PlatformUser, UserRole } from "../admin-data";

export function errorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "No fue posible completar la operación.";
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-PA", { dateStyle: "medium" }).format(new Date(value));
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("es-PA", {
    style: "currency",
    currency: "PAB",
  }).format(value);
}

export function roleLabel(role: UserRole): string {
  if (role === "super_admin") return "Superadministrador";
  if (role === "client") return "Cliente";
  return "Contratista";
}

export function statusFor(user: Pick<PlatformUser, "active" | "approvedAt">) {
  if (user.active) return { label: "Activo", className: "badge-active" };
  if (user.approvedAt) return { label: "Suspendido", className: "badge-suspended" };
  return { label: "Pendiente", className: "badge-pending" };
}
