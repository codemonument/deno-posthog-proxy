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

  const forwardRequest = new Request(
    `https://eu.i.posthog.com/${path}`,
    {
      ...req,
    },
  );
  forwardRequest.headers.set("Host", "eu.i.posthog.com");

  const response = await fetch(forwardRequest);

  return response;
}
