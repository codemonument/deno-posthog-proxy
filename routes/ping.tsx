export default function Health() {
  return (
    <div>
      <p>Posthog Proxy is running!</p>
      <p>Response Timestamp: {new Date().toISOString()}</p>
    </div>
  );
}
