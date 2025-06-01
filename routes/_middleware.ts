import { FreshContext } from "$fresh/server.ts";

export function handler(req: Request, ctx: FreshContext) {
  if (req.method == "OPTIONS") {
    const origin = req.headers.get("Origin") ?? req.headers.get("origin") ??
      "*";

    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS, GET, PUT, DELETE",
    );
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With",
    );

    headers.set("Access-Control-Allow-Credentials", "true");
    return new Response(null, {
      status: 204,
      headers,
    });
  }

  return ctx.next();
}
