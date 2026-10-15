const focusable = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable="true"]',
].join(',');

function canFocus(element) {
  return (
    element.tabIndex >= 0 &&
    !element.matches(':disabled') &&
    element.getClientRects().length > 0 &&
    !element.closest('[inert]')
  );
}

function containFocus(event) {
  if (event.key !== 'Tab') {
    return;
  }
  const dialog = event.currentTarget;
  const targets = [...dialog.querySelectorAll(focusable)].filter(canFocus);
  const first = targets[0];
  const last = targets.at(-1);
  const active = document.activeElement;
  const edge = event.shiftKey ? first : last;
  if (targets.length === 0 || active === edge || !dialog.contains(active) || active === dialog) {
    event.preventDefault();
    const target = (event.shiftKey ? last : first) ?? dialog;
    target.focus();
  }
}

// Native dialog membuat latar inert; putaran eksplisit juga menjaga Tab/Shift+Tab
// di dalam dialog dengan satu tombol, tanpa berpindah ke toolbar browser.
export function openModal(dialog) {
  const opener = document.activeElement;
  if (!dialog.open) {
    dialog.showModal();
  }
  dialog.addEventListener('keydown', containFocus);
  return () => {
    dialog.removeEventListener('keydown', containFocus);
    if (dialog.open) {
      dialog.close();
    }
    const target =
      opener?.isConnected && canFocus(opener) ? opener : document.getElementById('main');
    target?.focus();
  };
}
