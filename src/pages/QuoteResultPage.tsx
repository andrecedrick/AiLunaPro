/**
 * QuoteResultPage — post-accept confirmation.
 *
 * Reached two ways: (a) after a client accepts in-app (QuoteRequestPage
 * navigates here), and (b) the "Accept proposal" / "Request changes" buttons in
 * the quote email (ACCEPT_URL / DISCUSS_URL → #/quote/result?action=accept|discuss).
 * Public + chromeless (rendered inside CampaignChrome); reads only the hash, so
 * it works for an unauthenticated recipient. No data fetch, no side effects.
 */

import { useRoute } from '../context/RouteContext';
import { useLocale } from '../context/LocaleContext';
import { primaryBtnStyle } from '../components/ui-tools';

function hashAction(): 'accept' | 'discuss' {
  const h = typeof window !== 'undefined' ? window.location.hash : '';
  return /[?&]action=discuss/i.test(h) ? 'discuss' : 'accept';
}

export function QuoteResultPage() {
  const { navigate } = useRoute();
  const A = useLocale().publicTools.quote.accepted;
  const isDiscuss = hashAction() === 'discuss';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '56px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 14 }} aria-hidden>{isDiscuss ? '💬' : '✅'}</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
        {isDiscuss ? A.discussTitle : A.title}
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 8px' }}>
        {isDiscuss ? A.discussBody : A.prepared}
      </p>
      {!isDiscuss && (
        <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 26px' }}>{A.adminConfirm}</p>
      )}
      <button type="button" onClick={() => navigate({ name: 'quote' })} style={{ ...primaryBtnStyle(), marginTop: isDiscuss ? 22 : 0 }}>
        {A.back}
      </button>
    </div>
  );
}
