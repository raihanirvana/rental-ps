import { HowItWorks } from '../components/landing/HowItWorks.jsx';
import { Hero } from '../components/landing/Hero.jsx';
import { LandingFooter } from '../components/landing/LandingFooter.jsx';
import { LandingHeader } from '../components/landing/LandingHeader.jsx';
import { ServiceStrip } from '../components/landing/ServiceStrip.jsx';
import { UnitOffers } from '../components/landing/UnitOffers.jsx';
import { useCatalog } from '../hooks/useCatalog.js';
import { useDemoStart } from '../hooks/useDemoStart.js';
import { useSession } from '../hooks/useSession.js';

// Landing anonim hanya membaca katalog; workspace dibuat saat CTA ditekan.
export function LandingPage() {
  const { session, notice, dismissNotice } = useSession();
  const demo = useDemoStart();
  const catalogKey = session
    ? `${session.role}:${session.startedAt}:${session.workspace.dataVersion}`
    : 'public';
  const catalog = useCatalog(catalogKey);
  const businessName = catalog.catalog?.business.businessName ?? 'Sesi Play';
  return (
    <div className="wrap">
      <LandingHeader session={session} demo={demo} />
      <main id="main" tabIndex={-1}>
        <Hero demo={demo} notice={notice} onDismissNotice={dismissNotice} />
        <ServiceStrip rules={catalog.catalog?.rules} />
        <UnitOffers catalog={catalog} demo={demo} />
        <HowItWorks />
      </main>
      <LandingFooter businessName={businessName} demo={demo} />
    </div>
  );
}
