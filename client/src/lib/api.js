// Pembungkus fetch: selalu JSON, dan error API dibaca dari format { error: {...} }.
export async function getJson(path, { signal } = {}) {
  const response = await fetch(path, { headers: { Accept: 'application/json' }, signal });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.error?.message ?? `Permintaan gagal (${response.status}).`;
    throw new Error(message);
  }
  return body;
}
