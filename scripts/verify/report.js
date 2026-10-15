// Pencatat hasil: setiap pemeriksaan mencetak LULUS/GAGAL dengan detail nyata.
export function createReport() {
  const results = [];
  function check(name, ok, detail = '') {
    results.push({ name, ok: Boolean(ok), detail });
    console.log(`${ok ? 'LULUS' : 'GAGAL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  }
  function note(name, detail) {
    console.log(`CATAT  ${name} — ${detail}`);
  }
  function summary() {
    const failed = results.filter((result) => !result.ok);
    console.log(`\n${results.length - failed.length}/${results.length} pemeriksaan lulus.`);
    return failed.length === 0;
  }
  return { check, note, summary };
}

export function section(title) {
  console.log(`\n== ${title}`);
}
