export default function Health(request: Request) {
  console.info(`Request on health handler`, {
    url: request.url,
    path: request.url.split("/").pop(),
    origin: request.headers.get("Origin") ?? request.headers.get("origin") ??
      "not defined",
  });

  return (
    <div>
      <p>Posthog Proxy is running!</p>
      <p>Response Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
