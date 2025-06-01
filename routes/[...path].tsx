// Forwards:
// route: e.yourdomain.com/*
// reverse_proxy: https://eu.i.posthog.com/*
// host_header: eu.i.posthog.com

import { FreshContext } from "$fresh/server.ts";

/**
 * Note: Syntactically, this is an async fresh component handler.
 * But since Component handlers (which usually return JSX) can bail out of rendering by returning a Response object instead,
 * they can also be used as simple API route handlers, without using the more complex
 * Handler route syntax: https://fresh.deno.dev/docs/concepts/routes#-handler-route
 */
export default async function proxy(req: Request, ctx: FreshContext) {
  const path = ctx.params.path;
  const origin = req.headers.get("Origin") || "*";

  // build the request to forward
  const forwardRequest = new Request(
    `https://eu.i.posthog.com/${path}`,
    {
      ...req,
    },
  );
  forwardRequest.headers.set("Host", "eu.i.posthog.com");

  // forward the request to Posthog
  const response = await fetch(forwardRequest);

  // adjust CORS headers in response
  const headers = response.headers;

  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
  );
  headers.set(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS, GET, PUT, DELETE",
  );

  return response;
}
