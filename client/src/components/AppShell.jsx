import { useSession } from '../hooks/useSession.js';
import { AppHeader } from './AppHeader.jsx';
import { DemoBar } from './DemoBar.jsx';
import { Notice } from './Notice.jsx';

export function AppShell({ currentPath, children }) {
  const { session, notice, dismissNotice } = useSession();
  return (
    <>
      <AppHeader session={session} currentPath={currentPath} />
      <DemoBar session={session} />
      <main id="main" tabIndex={-1} className="wrap page">
        {notice ? (
          <div className="page-notice">
            <Notice tone={notice.tone} onDismiss={dismissNotice}>
              {notice.message}
            </Notice>
          </div>
        ) : null}
        {children}
      </main>
    </>
  );
}
