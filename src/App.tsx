import { HealthStatus } from './features/health/HealthStatus';

export function App({ apiUrl }: { apiUrl: string }) {
  return (
    <main>
      <h1>EMPREST.AI</h1>
      <HealthStatus apiUrl={apiUrl} />
    </main>
  );
}
