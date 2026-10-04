import type { ClientType } from "@/types/client";

export function validateClientIdentity(clientType: ClientType, firstName: string, lastName: string, businessName: string, email: string): string | null {
  const name = clientType === "business" ? businessName.trim() : `${firstName} ${lastName}`.trim();
  if (name.length < 2) return clientType === "business" ? "Introduce el nombre de la empresa cliente." : "Introduce el nombre del cliente.";
  const normalizedEmail = email.trim();
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Introduce un correo electrónico válido.";
  return null;
}

export function validateClientAddress(address: string): string | null {
  const value = address.trim();
  if (value.length < 3) return "Introduce una dirección de al menos 3 caracteres.";
  return null;
}

export function validateClientContact(name: string, email: string): string | null {
  if (name.trim().length < 2) return "Introduce el nombre del contacto.";
  const normalizedEmail = email.trim();
  if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return "Introduce un correo electrónico válido para el contacto.";
  return null;
}