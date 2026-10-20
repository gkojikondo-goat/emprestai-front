export type Health = { status: 'ok'; database: 'up' };

export async function fetchHealth(apiUrl: string): Promise<Health> {
  const response = await fetch(`${apiUrl}/v1/health`);
  if (!response.ok) {
    throw new Error(`A API respondeu com erro ${response.status}.`);
  }
  return (await response.json()) as Health;
}
