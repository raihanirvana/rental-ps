// Rupiah integer. Tarif per jam × durasi; durasi selalu kelipatan 60 menit sehingga bulat.
export function quoteTotal(hourlyRate, durationMinutes) {
  return (hourlyRate * durationMinutes) / 60;
}
