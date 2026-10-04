import { describe, expect, it } from "vitest";
import { validateClientAddress, validateClientContact, validateClientIdentity } from "../client-validation";

describe("client validation", () => {
  it("requires a person name", () => { expect(validateClientIdentity("person", "", "", "", "")).toBeTruthy(); });
  it("requires a business name", () => { expect(validateClientIdentity("business", "", "", "", "")).toBeTruthy(); });
  it("accepts a valid client", () => { expect(validateClientIdentity("person", "Juan", "Pérez", "", "juan@example.com")).toBeNull(); });
  it("rejects an invalid email", () => { expect(validateClientIdentity("person", "Juan", "", "", "correo-invalido")).toBeTruthy(); });
  it("requires a usable address", () => { expect(validateClientAddress("A")).toBeTruthy(); expect(validateClientAddress("Panamá")).toBeNull(); });
  it("validates contacts", () => { expect(validateClientContact("", "")).toBeTruthy(); expect(validateClientContact("María", "maria@example.com")).toBeNull(); });
});