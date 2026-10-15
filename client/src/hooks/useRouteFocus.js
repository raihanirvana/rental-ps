import { useEffect, useRef } from 'react';

// Setiap pindah halaman: judul dokumen diperbarui dan fokus dipindah ke <main> agar
// pembaca layar mulai dari konten baru. Muat awal tidak dipindah sehingga Tab pertama
// tetap ke skip link dan header.
export function useRouteFocus(title, pathname) {
  const previousPath = useRef(pathname);
  useEffect(() => {
    document.title = `${title} · Sesi Play`;
  }, [title]);
  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }
    previousPath.current = pathname;
    if (!window.location.hash) {
      document.getElementById('main')?.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }, [pathname]);
}
