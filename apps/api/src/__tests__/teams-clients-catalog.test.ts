import assert from "node:assert/strict";
import test from "node:test";

import {
  createInvitationSchema,
  acceptInvitationSchema,
  updateMemberStatusSchema,
  updateMemberRoleSchema,
  auditLogQuerySchema
} from "../companies/schemas.js";

import {
  createContactSchema,
  updateContactSchema
} from "../clients/schemas.js";

import {
  catalogItemQuerySchema
} from "../catalog/schemas.js";

const companyId = "00000000-0000-4000-8000-000000000001";
const clientId = "00000000-0000-4000-8000-000000000002";

// T-110 — Crear invitaciones de equipo
test("T-110: valida esquemas de creación y aceptación de invitaciones", () => {
  assert.equal(
    createInvitationSchema.safeParse({
      email: "nuevo_miembro@ejemplo.com",
      role: "admin"
    }).success,
    true
  );

  assert.equal(
    createInvitationSchema.safeParse({
      email: "correo_invalido",
      role: "admin"
    }).success,
    false
  );

  assert.equal(
    createInvitationSchema.safeParse({
      email: "miembro@ejemplo.com",
      role: "superheroe" // rol no permitido
    }).success,
    false
  );

  assert.equal(
    acceptInvitationSchema.safeParse({
      token: "tok_123456789"
    }).success,
    true
  );

  assert.equal(
    acceptInvitationSchema.safeParse({
      token: ""
    }).success,
    false
  );
});

// T-111 — Crear administración de miembros
test("T-111: valida esquemas de cambio de estado de miembro", () => {
  assert.equal(
    updateMemberStatusSchema.safeParse({
      active: false
    }).success,
    true
  );

  assert.equal(
    updateMemberStatusSchema.safeParse({
      active: true
    }).success,
    true
  );

  assert.equal(
    updateMemberStatusSchema.safeParse({
      active: "invalid"
    }).success,
    false
  );
});

// T-112 — Permitir cambio controlado de roles
test("T-112: permite asignar roles válidos de empresa", () => {
  const validRoles = [
    "owner",
    "admin",
    "estimator",
    "sales",
    "supervisor",
    "member",
    "accountant",
    "guest"
  ];

  for (const role of validRoles) {
    assert.equal(
      updateMemberRoleSchema.safeParse({ role }).success,
      true
    );
  }

  assert.equal(
    updateMemberRoleSchema.safeParse({ role: "hacker" }).success,
    false
  );
});

// T-113 — Implementar varios contactos por cliente
test("T-113: valida esquemas de contactos adicionales de cliente", () => {
  assert.equal(
    createContactSchema.safeParse({
      companyId,
      name: "Juan Pérez",
      position: "Gerente de Proyectos",
      email: "juan@constructora.com",
      phone: "+507 6000-0000",
      isPrimary: true
    }).success,
    true
  );

  assert.equal(
    createContactSchema.safeParse({
      companyId,
      name: "A" // nombre muy corto
    }).success,
    false
  );

  assert.equal(
    updateContactSchema.safeParse({
      companyId,
      position: "Director de Operaciones",
      isPrimary: false
    }).success,
    true
  );
});

// T-114 — Añadir auditoría de acciones administrativas
test("T-114: valida parámetros de consulta para logs de auditoría", () => {
  const result = auditLogQuerySchema.safeParse({
    page: "2",
    limit: "50",
    action: "MEMBER_ROLE_UPDATED"
  });

  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.page, 2);
    assert.equal(result.data.limit, 50);
    assert.equal(result.data.action, "MEMBER_ROLE_UPDATED");
  }
});

// T-115 & T-116 — Paginación y Búsqueda de Catálogo en el servidor
test("T-115 & T-116: valida la query del catálogo con paginación y búsqueda", () => {
  const parsed = catalogItemQuerySchema.safeParse({
    page: "1",
    limit: "15",
    q: "cemento",
    categoryName: "Materiales"
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.page, 1);
    assert.equal(parsed.data.limit, 15);
    assert.equal(parsed.data.q, "cemento");
    assert.equal(parsed.data.categoryName, "Materiales");
  }
});
