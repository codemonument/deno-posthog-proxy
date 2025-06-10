import { proxy } from "./src/proxy-req-to-posthog.ts";

Deno.serve((req, _info) => {
  const urlString = req.url;
  const url = new URL(urlString);
  const path = url.pathname;

  console.info(`Received request to "${urlString}" with`, {
    path,
    origin: req.headers.get("Origin") ?? req.headers.get("origin") ??
      "not defined",
  });

  switch (path) {
    case "/health":
      return new Response("OK at" + new Date().toISOString(), { status: 200 });
    case "/ping":
      return new Response("PONG at " + new Date().toISOString(), {
        status: 200,
      });
    default:
      return proxy(req);
  }
});
