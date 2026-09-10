import type { FastifyRequest } from "fastify";
import { afterEach, describe, expect, it } from "vitest";
import { env } from "../../config/env.js";
import { getClientIp } from "../client-ip.js";

const mutableEnv = env as unknown as { NODE_ENV: string };
const originalNodeEnv = mutableEnv.NODE_ENV;

function requestWith(
  headers: Record<string, string>,
  ip = "127.0.0.1"
): FastifyRequest {
  return { headers, ip } as unknown as FastifyRequest;
}

afterEach(() => {
  mutableEnv.NODE_ENV = originalNodeEnv;
});

describe("getClientIp", () => {
  it("usa CF-Connecting-IP en producción", () => {
    mutableEnv.NODE_ENV = "production";
    const request = requestWith(
      {
        "cf-connecting-ip": "203.0.113.25",
        "x-forwarded-for": "198.51.100.99"
      },
      "127.0.0.1"
    );

    expect(getClientIp(request)).toBe("203.0.113.25");
  });

  it("ignora X-Forwarded-For si falta CF-Connecting-IP", () => {
    mutableEnv.NODE_ENV = "production";
    const request = requestWith(
      { "x-forwarded-for": "198.51.100.99" },
      "127.0.0.1"
    );

    expect(getClientIp(request)).toBe("127.0.0.1");
  });

  it("rechaza CF-Connecting-IP malformado", () => {
    mutableEnv.NODE_ENV = "production";
    const request = requestWith(
      { "cf-connecting-ip": "not-an-ip" },
      "127.0.0.1"
    );

    expect(getClientIp(request)).toBe("127.0.0.1");
  });

  it("ignora CF-Connecting-IP fuera de producción y staging", () => {
    mutableEnv.NODE_ENV = "test";
    const request = requestWith(
      { "cf-connecting-ip": "203.0.113.25" },
      "127.0.0.1"
    );

    expect(getClientIp(request)).toBe("127.0.0.1");
  });
});
