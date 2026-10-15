import { useAccountActions } from '../hooks/useAccountActions.js';
import { roleNames } from '../lib/routes.js';
import { LogoutDialog } from './LogoutDialog.jsx';
import { ErrorNotice } from './Notice.jsx';

function SwitchRoleButton({ account }) {
  return (
    <button
      type="button"
      className="button button--quiet button--small"
      onClick={account.switchRole}
      disabled={account.busy !== null}
    >
      {account.busy === 'switch' ? 'Mengganti peran…' : `Coba sebagai ${roleNames[account.target]}`}
    </button>
  );
}

export function AccountActions({ session }) {
  const account = useAccountActions();
  return (
    <div className="account-actions">
      <span className="pill role-label">{session.roleLabel} demo</span>
      <SwitchRoleButton account={account} />
      <button
        type="button"
        className="button button--white button--small"
        onClick={() => account.setConfirmingLogout(true)}
        disabled={account.busy !== null}
      >
        Keluar demo
      </button>
      {account.error && !account.confirmingLogout ? <ErrorNotice error={account.error} /> : null}
      <LogoutDialog account={account} />
    </div>
  );
}
