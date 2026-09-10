/// <reference path="../worker-configuration.d.ts" />

import { httpServerHandler } from "cloudflare:node";

import { buildApp } from "./app.js";
import {
  configureHyperdriveDatabase
} from "./db/pool.js";

type CloudflareNodeServer =
  Parameters<typeof httpServerHandler>[0];

type CloudflareHttpHandler =
  ReturnType<typeof httpServerHandler>;

type CloudflareHttpFetch =
  NonNullable<CloudflareHttpHandler["fetch"]>;

type CloudflareHttpRequest =
  Parameters<CloudflareHttpFetch>[0];

let handlerPromise:
  Promise<CloudflareHttpHandler> | undefined;

async function getHandler():
  Promise<CloudflareHttpHandler> {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const app = await buildApp();

      await app.ready();

      return httpServerHandler(
        app.server as unknown as CloudflareNodeServer
      );
    })().catch((error) => {
      handlerPromise = undefined;
      throw error;
    });
  }

  return handlerPromise;
}

export default {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext
  ): Promise<Response> {
    configureHyperdriveDatabase(
      env.HYPERDRIVE.connectionString
    );

    const handler = await getHandler();

    if (!handler.fetch) {
      throw new Error(
        "El adaptador HTTP de Cloudflare no expuso fetch."
      );
    }

    return handler.fetch(
      request as unknown as CloudflareHttpRequest,
      env,
      context
    );
  }
} satisfies ExportedHandler<Env>;
