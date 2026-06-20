/**
 * Help Center content — Phase H0, localized in B6.2f.
 *
 * The visible wording lives in the i18n `help` namespace (Dict). This module
 * keeps the STRUCTURE (layout, lists, callouts, flow diagrams, tables, icons)
 * and builds the section bodies from the active locale via buildHelpSections().
 *
 * Inline emphasis inside prose is expressed with lightweight markers and
 * rendered by <RichText>:  **bold**  ·  *italic*  ·  `code`.
 * Proper nouns / product names (agent names, category taxonomy) stay literal.
 *
 * If you add a new section: add its content keys to the `help` namespace in
 * every locale, add a builder entry below, and add its id to HELP_SECTION_IDS.
 */

import type { ReactNode } from 'react';
import type { Dict } from '../../lib/locale/i18n/en';
import { Callout } from '../../components/help/Callout';
import { FlowDiagram } from '../../components/help/FlowDiagram';
import { RichText } from '../../components/RichText';

export interface HelpSection {
  id:    string;
  title: string;
  body:  ReactNode;
}

type HelpT = Dict['help'];

/** Stable, locale-independent section ids — order drives the TOC + scroll-spy. */
export const HELP_SECTION_IDS = [
  'getting-started',
  'audit-vs-report',
  'reports-workspaces',
  'filling-the-audit',
  'agents',
  'tokens',
  'billing',
  'diagnostic',
  'roi-calculator',
  'team',
  'settings',
  'settings-analytics',
  'troubleshooting',
  'faq',
] as const;

/* ── Style atoms used inside body JSX ───────────────────── */

const p: React.CSSProperties = { margin: '0 0 12px', fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' };
const ul: React.CSSProperties = { margin: '0 0 12px 20px', padding: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' };
const li: React.CSSProperties = { marginBottom: 4 };
const h3: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '18px 0 8px', textTransform: 'uppercase', letterSpacing: 0.4 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' };

/* Prose paragraph / list item built from a marked string. */
const P  = ({ t }: { t: string }) => <p style={p}><RichText t={t} /></p>;
const Li = ({ t }: { t: string }) => <li style={li}><RichText t={t} /></li>;

/* ── Lightweight visual aids (inline SVG / CSS only — no images, no libs) ── */

const flowWrap: React.CSSProperties = { display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 14px' };
const stepBox: React.CSSProperties = { flex: '1 1 150px', minWidth: 0, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px' };
const stepNum: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 999, background: 'var(--violet)', color: '#fff', fontSize: 11, fontWeight: 700, marginBottom: 6 };
const stepText: React.CSSProperties = { fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.45 };
const chip: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--brand-tint-bg, #EDE9FE)', color: 'var(--violet-text, #7C3AED)', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600 };
const schemeRow: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', margin: '4px 0 14px', flexWrap: 'wrap' };

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ToggleOff = () => (
  <svg width="40" height="22" viewBox="0 0 40 22" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="0.5" y="0.5" width="39" height="21" rx="10.5" fill="var(--surface)" stroke="var(--border-strong, #CBD5E1)" />
    <circle cx="11" cy="11" r="7" fill="var(--text-muted, #64748B)" />
  </svg>
);
const StepFlow = ({ steps }: { steps: string[] }) => (
  <div style={flowWrap}>
    {steps.map((s, i) => (
      <div key={i} style={stepBox}>
        <div style={stepNum}>{i + 1}</div>
        <div style={stepText}>{s}</div>
      </div>
    ))}
  </div>
);

/* Inline icon set (16px, currentColor — no images, no libs). */
const svgProps: React.SVGProps<SVGSVGElement> = {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
};
const IconRocket = () => (<svg {...svgProps}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /></svg>);
const IconAgent = () => (<svg {...svgProps}><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /></svg>);
const IconBilling = () => (<svg {...svgProps}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>);
const IconSettings = () => (<svg {...svgProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>);
const IconAlert = () => (<svg {...svgProps}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>);

/* Section header lede: icon badge + one-line summary. */
const iconBadge: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'var(--brand-tint-bg, #EDE9FE)', color: 'var(--violet-text, #7C3AED)', flexShrink: 0 };
const SectionLede = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, margin: '0 0 14px' }}>
    <span style={iconBadge}>{icon}</span>
    <p style={{ ...p, margin: 0 }}>{children}</p>
  </div>
);

/* "Key takeaways" callout: 2–3 short bullets. */
const Takeaways = ({ heading, items }: { heading: string; items: ReactNode[] }) => (
  <div style={{ background: 'var(--brand-tint-bg, #EDE9FE)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', margin: '4px 0 16px' }}>
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--violet-text, #7C3AED)', marginBottom: 6 }}>{heading}</div>
    <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
      {items.map((it, i) => (<li key={i} style={{ marginBottom: 3 }}>{it}</li>))}
    </ul>
  </div>
);

/* Responsive chip row. */
const Chips = ({ items }: { items: string[] }) => (
  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', margin: '4px 0 14px' }}>
    {items.map((c, i) => (<span key={i} style={chip}>{c}</span>))}
  </div>
);

/* Proper nouns / product taxonomy — stay English, coherent with the Agents
 * catalog which lists them as product names. */
const AGENT_CHIPS = ['Support', 'Sales', 'Finance', 'HR', 'Compliance', 'Marketing', 'Reporting', 'Audit', 'Document', 'Admin'];
const AGENT_NAMES = ['Support Agent', 'Sales Agent', 'Finance Agent', 'HR Agent', 'Compliance Agent', 'Marketing Agent', 'Reporting Agent', 'Audit Agent', 'Document Agent', 'Admin Agent'];

/* ── Builder ─────────────────────────────────────────────── */

export function buildHelpSections(t: HelpT): HelpSection[] {
  const takeawaysHeading = t.header.keyTakeaways;
  const g  = t.gettingStarted;
  const av = t.auditVsReport;
  const rw = t.reportsWorkspaces;
  const fa = t.fillingAudit;
  const ag = t.agents;
  const tk = t.tokens;
  const bl = t.billing;
  const dg = t.diagnostic;
  const roi = t.roiCalculator;
  const tm = t.team;
  const st = t.settings;
  const an = t.analytics;
  const ts = t.troubleshooting;
  const fq = t.faq;

  return [
    {
      id: 'getting-started',
      title: g.title,
      body: (
        <>
          <SectionLede icon={<IconRocket />}>{g.lede}</SectionLede>
          <Takeaways heading={takeawaysHeading} items={[g.take1, g.take2, g.take3]} />
          <h3 style={h3}>{g.firstActionsTitle}</h3>
          <ul style={ul}><Li t={g.fa1} /><Li t={g.fa2} /><Li t={g.fa3} /></ul>
          <h3 style={h3}>{g.leadMagnetsTitle}</h3>
          <ul style={ul}><Li t={g.lm1} /><Li t={g.lm2} /></ul>
          <P t={g.publicLinks} />
          <h3 style={h3}>{g.inviteTitle}</h3>
          <P t={g.inviteBody} />
          <h3 style={h3}>{g.flowTitle}</h3>
          <FlowDiagram steps={[g.flowStep1, g.flowStep2, g.flowStep3, g.flowStep4, g.flowStep5]} caption={g.flowCaption} />
        </>
      ),
    },
    {
      id: 'audit-vs-report',
      title: av.title,
      body: (
        <>
          <h3 style={h3}>{av.inShortTitle}</h3>
          <ul style={ul}><Li t={av.inShort1} /><Li t={av.inShort2} /></ul>
          <Callout variant="info"><RichText t={av.calloutSubmit} /></Callout>
          <h3 style={h3}>{av.whatIsAuditTitle}</h3>
          <ul style={ul}><Li t={av.wa1} /><Li t={av.wa2} /><Li t={av.wa3} /></ul>
          <Callout variant="note"><RichText t={av.calloutEditable} /></Callout>
          <h3 style={h3}>{av.whatIsReportTitle}</h3>
          <ul style={ul}><Li t={av.wr1} /><Li t={av.wr2} /><Li t={av.wr3} /></ul>
          <FlowDiagram steps={[av.flowStep1, av.flowStep2, av.flowStep3, av.flowStep4, av.flowStep5]} caption={av.flowCaption} />
          <Callout variant="note"><RichText t={av.calloutFlow} /></Callout>
          <P t={av.closing} />
        </>
      ),
    },
    {
      id: 'reports-workspaces',
      title: rw.title,
      body: (
        <>
          <P t={rw.p1} />
          <FlowDiagram steps={[rw.flowStep1, rw.flowStep2]} caption={rw.flowCaption} />
          <Callout variant="warning"><RichText t={rw.calloutWarn} /></Callout>
          <Callout variant="note"><RichText t={rw.calloutNote} /></Callout>
        </>
      ),
    },
    {
      id: 'filling-the-audit',
      title: fa.title,
      body: (
        <>
          <P t={fa.p1} />
          <Callout variant="info"><RichText t={fa.calloutInfo} /></Callout>
          <ul style={ul}><Li t={fa.li1} /><Li t={fa.li2} /><Li t={fa.li3} /></ul>
        </>
      ),
    },
    {
      id: 'agents',
      title: ag.title,
      body: (
        <>
          <SectionLede icon={<IconAgent />}>{ag.lede}</SectionLede>
          <Takeaways heading={takeawaysHeading} items={[ag.take1, ag.take2, ag.take3]} />
          <Chips items={AGENT_CHIPS} />
          <h3 style={h3}>{ag.catalogTitle}</h3>
          <ul style={ul}>
            {[ag.cat1, ag.cat2, ag.cat3, ag.cat4, ag.cat5, ag.cat6, ag.cat7, ag.cat8, ag.cat9, ag.cat10].map((desc, i) => (
              <li key={i} style={li}><strong>{AGENT_NAMES[i]}</strong> — <RichText t={desc} /></li>
            ))}
          </ul>
          <h3 style={h3}>{ag.sourceBadgeTitle}</h3>
          <P t={ag.sourceBadgeBody} />
          <h3 style={h3}>{ag.planBadgeTitle}</h3>
          <P t={ag.planBadgeBody} />
          <h3 style={h3}>{ag.getAgentTitle}</h3>
          <P t={ag.getAgentBody} />
        </>
      ),
    },
    {
      id: 'tokens',
      title: tk.title,
      body: (
        <>
          <P t={tk.intro} />
          <h3 style={h3}>{tk.howTitle}</h3>
          <ul style={ul}><Li t={tk.how1} /><Li t={tk.how2} /><Li t={tk.how3} /><Li t={tk.how4} /><Li t={tk.how5} /></ul>
          <h3 style={h3}>{tk.packsTitle}</h3>
          <P t={tk.packsBody} />
          <h3 style={h3}>{tk.balanceTitle}</h3>
          <P t={tk.balanceBody} />
          <h3 style={h3}>{tk.runOutTitle}</h3>
          <P t={tk.runOutBody} />
        </>
      ),
    },
    {
      id: 'billing',
      title: bl.title,
      body: (
        <>
          <SectionLede icon={<IconBilling />}>{bl.lede}</SectionLede>
          <Takeaways heading={takeawaysHeading} items={[bl.take1, bl.take2, bl.take3]} />
          <Chips items={['Free', 'Starter', 'Professional', 'Enterprise']} />
          <h3 style={h3}>{bl.currencyTitle}</h3>
          <P t={bl.currencyBody} />
          <h3 style={h3}>{bl.subscribingTitle}</h3>
          <P t={bl.subscribingBody} />
          <h3 style={h3}>{bl.manageTitle}</h3>
          <P t={bl.manageBody} />
          <h3 style={h3}>{bl.invoicesTitle}</h3>
          <P t={bl.invoicesBody} />
          <h3 style={h3}>{bl.freeTitle}</h3>
          <P t={bl.freeBody} />
        </>
      ),
    },
    {
      id: 'diagnostic',
      title: dg.title,
      body: (
        <>
          <P t={dg.intro} />
          <h3 style={h3}>{dg.accessTitle}</h3>
          <P t={dg.accessBody} />
          <h3 style={h3}>{dg.getTitle}</h3>
          <ul style={ul}><Li t={dg.get1} /><Li t={dg.get2} /><Li t={dg.get3} /><Li t={dg.get4} /></ul>
          <h3 style={h3}>{dg.privacyTitle}</h3>
          <P t={dg.privacyBody} />
        </>
      ),
    },
    {
      id: 'roi-calculator',
      title: roi.title,
      body: (
        <>
          <P t={roi.intro} />
          <h3 style={h3}>{roi.accessTitle}</h3>
          <P t={roi.accessBody} />
          <h3 style={h3}>{roi.inputsTitle}</h3>
          <ul style={ul}><Li t={roi.in1} /><Li t={roi.in2} /><Li t={roi.in3} /><Li t={roi.in4} /></ul>
          <h3 style={h3}>{roi.outputsTitle}</h3>
          <ul style={ul}><Li t={roi.out1} /><Li t={roi.out2} /><Li t={roi.out3} /><Li t={roi.out4} /><Li t={roi.out5} /></ul>
          <h3 style={h3}>{roi.aboutTitle}</h3>
          <P t={roi.aboutBody} />
        </>
      ),
    },
    {
      id: 'team',
      title: tm.title,
      body: (
        <>
          <P t={tm.intro} />
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>{tm.thRole}</th>
                <th style={thStyle}>{tm.thManageWorkspace}</th>
                <th style={thStyle}>{tm.thManageBilling}</th>
                <th style={thStyle}>{tm.thRunAudits}</th>
                <th style={thStyle}>{tm.thViewReports}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={tdStyle}><strong>Owner</strong></td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
              <tr><td style={tdStyle}><strong>Admin</strong></td><td style={tdStyle}>✓</td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
              <tr><td style={tdStyle}><strong>Billing</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>—</td><td style={tdStyle}>—</td></tr>
              <tr><td style={tdStyle}><strong>Member</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
              <tr><td style={tdStyle}><strong>Client</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>{tm.limited}</td></tr>
            </tbody>
          </table>
          <h3 style={h3}>{tm.inviteTitle}</h3>
          <P t={tm.inviteBody} />
          <h3 style={h3}>{tm.rolesTitle}</h3>
          <P t={tm.rolesBody} />
        </>
      ),
    },
    {
      id: 'settings',
      title: st.title,
      body: (
        <>
          <SectionLede icon={<IconSettings />}>{st.lede}</SectionLede>
          <Takeaways heading={takeawaysHeading} items={[st.take1, st.take2, st.take3]} />
          <h3 style={h3}>{st.profileTitle}</h3>
          <P t={st.profileBody} />
          <h3 style={h3}>{st.orgTitle}</h3>
          <P t={st.orgBody} />
          <h3 style={h3}>{st.themeTitle}</h3>
          <P t={st.themeBody} />
          <h3 style={h3}>{st.languageTitle}</h3>
          <P t={st.languageBody} />
          <h3 style={h3}>{st.currencyTitle}</h3>
          <P t={st.currencyBody} />
          <h3 style={h3}>{st.emailTitle}</h3>
          <P t={st.emailBody} />
        </>
      ),
    },
    {
      id: 'settings-analytics',
      title: an.title,
      body: (
        <>
          <P t={an.intro} />
          <div style={schemeRow}>
            <ToggleOff />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}><RichText t={an.offByDefault} /></span>
          </div>
          <h3 style={h3}>{an.collectedTitle}</h3>
          <div style={schemeRow}>
            <span style={{ color: 'var(--violet-text, #7C3AED)', display: 'inline-flex' }}><LockIcon /></span>
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={chip}>{an.chipNoPersonal}</span>
              <span style={chip}>{an.chipNoRecording}</span>
              <span style={chip}>{an.chipNoAds}</span>
            </span>
          </div>
          <P t={an.collectedBody} />
          <h3 style={h3}>{an.optTitle}</h3>
          <StepFlow steps={[an.opt1, an.opt2, an.opt3]} />
          <h3 style={h3}>{an.dntTitle}</h3>
          <P t={an.dntBody} />
          <h3 style={h3}>{an.blockedTitle}</h3>
          <P t={an.blockedBody} />
        </>
      ),
    },
    {
      id: 'troubleshooting',
      title: ts.title,
      body: (
        <>
          <SectionLede icon={<IconAlert />}>{ts.lede}</SectionLede>
          <Takeaways heading={takeawaysHeading} items={[ts.take1, ts.take2, ts.take3]} />
          <h3 style={h3}>{ts.loadTitle}</h3>
          <P t={ts.loadBody} />
          <h3 style={h3}>{ts.signedOutTitle}</h3>
          <P t={ts.signedOutBody} />
          <h3 style={h3}>{ts.balanceTitle}</h3>
          <P t={ts.balanceBody} />
          <h3 style={h3}>{ts.balanceCheckoutTitle}</h3>
          <P t={ts.balanceCheckoutBody} />
          <h3 style={h3}>{ts.captchaTitle}</h3>
          <P t={ts.captchaBody} />
          <h3 style={h3}>{ts.syncTitle}</h3>
          <P t={ts.syncBody} />
          <h3 style={h3}>{ts.inviteTitle}</h3>
          <P t={ts.inviteBody} />
          <h3 style={h3}>{ts.roadmapTitle}</h3>
          <P t={ts.roadmapBody} />
          <h3 style={h3}>{ts.blankTitle}</h3>
          <P t={ts.blankBody} />
          <h3 style={h3}>{ts.emailTitle}</h3>
          <P t={ts.emailBody} />
        </>
      ),
    },
    {
      id: 'faq',
      title: fq.title,
      body: (
        <>
          <h3 style={h3}>{fq.q1}</h3><P t={fq.a1} />
          <h3 style={h3}>{fq.q2}</h3><P t={fq.a2} />
          <h3 style={h3}>{fq.q3}</h3><P t={fq.a3} />
          <h3 style={h3}>{fq.q4}</h3><P t={fq.a4} />
          <h3 style={h3}>{fq.q5}</h3><P t={fq.a5} />
          <h3 style={h3}>{fq.q6}</h3><P t={fq.a6} />
          <h3 style={h3}>{fq.q7}</h3><P t={fq.a7} />
          <h3 style={h3}>{fq.q8}</h3><P t={fq.a8} />
          <h3 style={h3}>{fq.q9}</h3><P t={fq.a9} />
          <h3 style={h3}>{fq.q10}</h3><P t={fq.a10} />
          <h3 style={h3}>{fq.q11}</h3><P t={fq.a11} />
          <h3 style={h3}>{fq.q12}</h3><P t={fq.a12} />
        </>
      ),
    },
  ];
}
