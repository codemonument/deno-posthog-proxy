// Forwards:
// route: e.yourdomain.com/* and e.yourdomain.com/static/*
// reverse_proxy: https://eu.i.posthog.com/* and https://eu-assets.i.posthog.com/*
// host_header: eu.i.posthog.com and eu-assets.i.posthog.com

import { FreshContext } from "$fresh/server.ts";

const API_HOST = "eu.i.posthog.com";
const ASSETS_HOST = "eu-assets.i.posthog.com";

/**
 * Handles all incomming requests to that route.
 * @param req the fetch compatible request object
 * @param ctx the fresh context object
 * Handler route syntax: https://fresh.deno.dev/docs/concepts/routes#-handler-route
 */
export async function handler(req: Request, ctx: FreshContext) {
  const url = new URL(req.url);
  const path = ctx.params.path;
  const origin = req.headers.get("Origin") ?? req.headers.get("origin") ?? "*";

  console.info(`Request on proxy handler`, {
    url,
    path,
    origin: origin === "*" ? "unknown" : origin,
  });

  console.debug(`Got REQUEST from origin: ${origin}`, {
    req,
  });

  const hostname = path.startsWith("static") ? ASSETS_HOST : API_HOST;
  const newUrl = new URL(url);
  newUrl.protocol = "https";
  newUrl.hostname = hostname;
  newUrl.port = "443";
  newUrl.pathname = path;

  const headers = new Headers(req.headers);
  headers.set("Host", hostname);

  // forward the request to Posthog
  const response = await fetch(newUrl, {
    method: req.method,
    headers,
    body: req.body,
    // @bjesuiter: set redirect mode to manual to avoid the case that THIS fresh server calls posthog without an "origin" header
    // => let the browser handle the redirect
    redirect: "manual",
  });

  const newResponseHeaders = new Headers(response.headers);
  newResponseHeaders.set("Access-Control-Allow-Origin", origin);
  newResponseHeaders.set("Access-Control-Allow-Credentials", "true");
  newResponseHeaders.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
  );
  newResponseHeaders.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS, GET, PUT, DELETE",
  );

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newResponseHeaders,
  });

  console.debug(`Forwarded request to ${hostname}, got newResponse`, {
    newResponse,
  });

  return newResponse;
}
