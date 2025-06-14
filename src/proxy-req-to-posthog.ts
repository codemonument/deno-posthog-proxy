const API_HOST = "eu.i.posthog.com";
const ASSETS_HOST = "eu-assets.i.posthog.com";

const workingPaths = [
  "/static/array.js",
  "/array/phc_Q4RDyPoaIdeiEVIXMoBXZXUSjMQd5TQWlABIFGwS5YY/config.js",
];

export async function proxy(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname;
  const origin = req.headers.get("Origin") ?? req.headers.get("origin") ?? "*";

  const isWorkingPath = workingPaths.some((workingPath) =>
    path === workingPath
  );

  if (!isWorkingPath) {
    console.debug(`Got unverified proxy request from origin: ${origin}`, {
      req,
    });
  }

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
    // redirect: "manual",
  });

  const newResponseHeaders = new Headers(response.headers);
  newResponseHeaders.set("Access-Control-Allow-Origin", origin);

  // Try to not restrict headers or methods
  // newResponseHeaders.set(
  //   "Access-Control-Allow-Headers",
  //   "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With, x-csrftoken",
  // );
  // newResponseHeaders.set(
  //   "Access-Control-Allow-Methods",
  //   "GET, HEAD, POST, OPTIONS, PUT, DELETE, PATCH",
  // );

  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newResponseHeaders,
  });

  if (isWorkingPath) {
    console.info(`Forwarded request to "${newUrl.href}"
      from "${origin}" 
      for "${url.href}" 
      got ${response.status} ${response.statusText}
      `);
  } else {
    console.debug(
      `Forwarded request to "${newUrl.href}"
       from "${origin}" 
       for "${url.href}", got`,
      {
        newResponse,
      },
    );
  }

  return newResponse;
}
