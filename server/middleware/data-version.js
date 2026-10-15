// Versi mengikuti snapshot yang benar-benar dipakai service, bukan hanya pembacaan
// cookie sebelum menunggu write lock. Respons reset/session membawa versi baru langsung.
export function trackDataVersion(request, response) {
  const json = response.json;
  response.json = function sendVersionedJson(payload) {
    const version =
      payload?.dataVersion ?? payload?.session?.workspace?.dataVersion ?? request.auth?.dataVersion;
    if (Number.isInteger(version) && version > 0) {
      this.set('X-Data-Version', String(version));
    }
    return json.call(this, payload);
  };
}
