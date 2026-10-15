const kindTitles = { PS4: 'PlayStation 4', PS5: 'PlayStation 5' };
const countWords = ['Nol', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima'];

function joinNames(names) {
  return names.length > 1 ? `${names.slice(0, -1).join(', ')} dan ${names.at(-1)}` : names[0];
}

function describeGroup(kind, units) {
  const rates = units.map((unit) => unit.hourlyRate);
  const count = countWords[units.length] ?? String(units.length);
  return {
    kind,
    title: kindTitles[kind],
    summary: `${count} unit: ${joinNames(units.map((unit) => unit.name))}.`,
    minRate: Math.min(...rates),
    sameRate: rates.every((rate) => rate === rates[0]),
  };
}

// Ringkas unit aktif dari katalog server per jenis untuk perbandingan PS4/PS5.
export function groupUnitsByKind(units) {
  return ['PS4', 'PS5']
    .map((kind) => [kind, units.filter((unit) => unit.kind === kind && unit.isActive)])
    .filter(([, list]) => list.length > 0)
    .map(([kind, list]) => describeGroup(kind, list));
}
