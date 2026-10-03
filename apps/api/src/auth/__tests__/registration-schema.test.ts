import {
  describe,
  expect,
  it,
} from "vitest";

import {
  registerSchema,
} from "../schemas.js";

const VALID_REGISTRATION = {
  fullName: "Usuario de Prueba",
  firstName: "Usuario",
  lastName: "Prueba",
  phone: "+507 6000-0000",
  email: "usuario@example.com",
  password: "Password123!",
  role: "client" as const,
  province: "Panamá",
  district: "Panamá",
  corregimiento: "Bella Vista",
  termsAccepted: true as const,
  notificationsOptIn: false,
  registrationDevice:
    "Navegador Web",
  captchaToken:
    "turnstile-token",
};

describe(
  "registerSchema",
  () => {
    it(
      "acepta un registro válido",
      () => {
        expect(
          registerSchema.safeParse(
            VALID_REGISTRATION,
          ).success,
        ).toBe(true);
      },
    );

    it(
      "rechaza teléfono ausente",
      () => {
        const {
          phone: _phone,
          ...withoutPhone
        } = VALID_REGISTRATION;

        expect(
          registerSchema.safeParse(
            withoutPhone,
          ).success,
        ).toBe(false);
      },
    );

    it(
      "rechaza teléfono corto",
      () => {
        expect(
          registerSchema.safeParse({
            ...VALID_REGISTRATION,
            phone: "123456",
          }).success,
        ).toBe(false);
      },
    );

    it(
      "rechaza teléfono demasiado largo",
      () => {
        expect(
          registerSchema.safeParse({
            ...VALID_REGISTRATION,
            phone:
              "+123 456 789 012 345 6",
          }).success,
        ).toBe(false);
      },
    );

    it(
      "rechaza password menor de 8",
      () => {
        expect(
          registerSchema.safeParse({
            ...VALID_REGISTRATION,
            password: "1234567",
          }).success,
        ).toBe(false);
      },
    );

    it(
      "rechaza password mayor de 72",
      () => {
        expect(
          registerSchema.safeParse({
            ...VALID_REGISTRATION,
            password:
              "A".repeat(73),
          }).success,
        ).toBe(false);
      },
    );
  },
);