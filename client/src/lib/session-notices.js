import { roleNames } from './routes.js';

export const sessionNotices = {
  expired: {
    kind: 'expired',
    tone: 'info',
    message: 'Ruang demo sudah berakhir. Mulai demo baru untuk mencoba lagi.',
  },
  invalid: {
    tone: 'info',
    message: 'Sesi demo tidak lagi berlaku. Mulai demo lagi untuk melanjutkan.',
  },
  signedOut: {
    tone: 'success',
    message: 'Kamu sudah keluar. Data ruang demo tadi sudah dihapus.',
  },
};

export function noticeForUnauthorized(error) {
  return error.code === 'SESSION_EXPIRED' ? sessionNotices.expired : sessionNotices.invalid;
}

// Ganti peran adalah simulasi di workspace yang sama, bukan login sungguhan.
export function roleSwitchNotice(role) {
  return {
    tone: 'info',
    message:
      `Kamu sekarang melihat sisi ${roleNames[role]} di ruang demo yang sama. ` +
      'Ini simulasi peran; booking dan data contoh tetap milik ruang demomu.',
  };
}
