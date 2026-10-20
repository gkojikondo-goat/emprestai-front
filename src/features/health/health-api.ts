export type Health = { status: 'ok'; database: 'up' };

export class HealthError extends Error {}

async function readProblemDetail(response: Response): Promise<string | undefined> {
  if (!response.headers.get('content-type')?.includes('problem+json')) {
    return undefined;
  }
  try {
    const body = (await response.json()) as { detail?: unknown };
    return typeof body.detail === 'string' ? body.detail : undefined;
  } catch {
    return undefined;
  }
}

export async function fetchHealth(apiUrl: string): Promise<Health> {
  let response: Response;
  try {
    response = await fetch(`${apiUrl}/v1/health`);
  } catch {
    throw new HealthError(
      'Não foi possível conectar à API. Verifique se ela está no ar.',
    );
  }
  if (!response.ok) {
    const detail = await readProblemDetail(response);
    throw new HealthError(
      detail ?? `A API respondeu com erro ${response.status}.`,
    );
  }
  return (await response.json()) as Health;
}
