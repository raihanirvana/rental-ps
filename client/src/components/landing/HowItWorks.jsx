const steps = [
  ['Pilih unit dan jam', 'Cek tanggal dan durasi yang pas untukmu.'],
  ['Konfirmasi booking', 'Isi nama, lalu simpan nomor reservasimu.'],
  ['Datang dan main', 'Tunjukkan reservasi. Bayarnya di tempat.'],
];

export function HowItWorks() {
  return (
    <section id="cara-booking" className="how-section" aria-labelledby="how-title">
      <h2 id="how-title">Beres sebelum berangkat.</h2>
      <ol className="how-steps">
        {steps.map(([title, text], index) => (
          <li key={title} className="how-step">
            <span className="step-number" aria-hidden="true">
              {index + 1}
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
