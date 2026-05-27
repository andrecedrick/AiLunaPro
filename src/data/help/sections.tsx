/**
 * Help Center static content — Phase H0.
 *
 * English-only. User-facing wording. No developer-facing internals
 * (no env var names, no curl commands, no inspect/CLI references).
 *
 * If you add a new section, also add it to TOC (auto-generated from
 * this array). Section ids must be lowercase kebab.
 */

import type { ReactNode } from 'react';
import { Callout } from '../../components/help/Callout';
import { FlowDiagram } from '../../components/help/FlowDiagram';

export interface HelpSection {
  id:    string;
  title: string;
  body:  ReactNode;
}

/* ── Style atoms used inside body JSX ───────────────────── */

const p: React.CSSProperties = { margin: '0 0 12px', fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' };
const ul: React.CSSProperties = { margin: '0 0 12px 20px', padding: 0, fontSize: 14, lineHeight: 1.65, color: 'var(--text-secondary)' };
const li: React.CSSProperties = { marginBottom: 4 };
const h3: React.CSSProperties = { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '18px 0 8px', textTransform: 'uppercase', letterSpacing: 0.4 };
const codeStyle: React.CSSProperties = { background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4, fontSize: 12, fontFamily: 'monospace', color: 'var(--text-primary)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', fontWeight: 700 };
const tdStyle: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' };

const Code = ({ children }: { children: ReactNode }) => <code style={codeStyle}>{children}</code>;

/* ── Sections ───────────────────────────────────────────── */

export const HELP_SECTIONS: readonly HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    body: (
      <>
        <p style={p}>
          AiLunaPro is a compliance and AI-transformation suite for organizations adopting AI.
          It combines audits, an AI registry, agent recommendations, ROI estimates, and a
          token-based usage model in one workspace.
        </p>
        <h3 style={h3}>Your first three actions</h3>
        <ul style={ul}>
          <li style={li}>Open the dashboard and review your current AI maturity score.</li>
          <li style={li}>Run a New Audit from the sidebar to capture your AI usage and risks.</li>
          <li style={li}>Browse the Agents catalog to see which AiLunaPro agents fit your workflow.</li>
        </ul>
        <h3 style={h3}>Public lead-magnets</h3>
        <ul style={ul}>
          <li style={li}>Diagnostic Express — a free 8-question AI maturity assessment, no account required.</li>
          <li style={li}>ROI Calculator — estimate the time and money your team can save with AiLunaPro agents.</li>
        </ul>
        <p style={p}>
          You can find both at <Code>#/diagnostic</Code> and <Code>#/roi-calculator</Code>.
          Share these links with colleagues — they do not require login.
        </p>
        <h3 style={h3}>Inviting teammates</h3>
        <p style={p}>
          Owners and admins can invite teammates from the Team page in the sidebar.
          Each invitee receives a link valid for 7 days. Roles are assigned at invitation time.
        </p>
        <h3 style={h3}>How it flows</h3>
        <FlowDiagram
          steps={['New Audit', 'Submit Audit', 'Audit saved + score', 'Generate report', 'Reports list']}
          caption="From audit to a shareable report snapshot"
        />
      </>
    ),
  },

  {
    id: 'audit-vs-report',
    title: 'Audit vs Report',
    body: (
      <>
        <h3 style={h3}>In short</h3>
        <ul style={ul}>
          <li style={li}>An <strong>Audit</strong> captures your answers and computes your score.</li>
          <li style={li}>A <strong>Report</strong> is a <strong>snapshot</strong> of an audit, created intentionally to share or archive.</li>
        </ul>
        <Callout variant="info">
          <strong>Submitting saves your audit + score.</strong> A <strong>Report</strong> is a
          snapshot, created only when you click <strong>Generate report</strong>.
        </Callout>
        <h3 style={h3}>What is an Audit?</h3>
        <ul style={ul}>
          <li style={li}>Your answers to structured questions.</li>
          <li style={li}>Your compliance / maturity score.</li>
          <li style={li}>A dynamic analysis that can evolve with scoring rules.</li>
        </ul>
        <Callout variant="note">An audit remains editable until you generate a report.</Callout>
        <h3 style={h3}>What is a Report?</h3>
        <ul style={ul}>
          <li style={li}>A frozen snapshot at a specific point in time.</li>
          <li style={li}>Created only when clicking <strong>Generate report</strong>.</li>
          <li style={li}>Stable even if you run new audits later. Exportable and shareable, listed under <strong>Reports</strong> for the active workspace.</li>
        </ul>
        <FlowDiagram
          steps={['Submit Audit', 'Audit saved', 'Generate report?', 'Report snapshot', 'Reports list']}
          caption="A report is created only on Generate report"
        />
        <Callout variant="note">
          <strong>Submit Audit</strong> → saves audit + score. <strong>Generate report</strong> → creates a snapshot visible in <em>Reports</em>.
        </Callout>
        <p style={p}><em>Coming soon:</em> optional auto-report on submit, and an audit history view distinct from reports.</p>
      </>
    ),
  },

  {
    id: 'reports-workspaces',
    title: 'Reports & Workspaces',
    body: (
      <>
        <p style={p}>
          Reports are <strong>per workspace</strong>, not global. The Reports list shows only
          the reports of the <strong>active</strong> workspace.
        </p>
        <FlowDiagram
          steps={['Workspace A → its reports', 'Workspace B → its reports']}
          caption="Each workspace keeps its own reports"
        />
        <Callout variant="warning">
          Don't see an old report? It likely belongs to <strong>another workspace</strong>.
          Switch workspace from the selector at the top of the sidebar.
        </Callout>
        <Callout variant="note">
          The dashboard date filter does <strong>not</strong> affect the Reports list.
        </Callout>
      </>
    ),
  },

  {
    id: 'filling-the-audit',
    title: 'How to fill the audit properly',
    body: (
      <>
        <p style={p}>
          Good inputs make a credible audit. Take a minute to answer honestly — the result
          reflects what you put in.
        </p>
        <Callout variant="info">
          The <strong>“Describe…”</strong> free-text fields add context. Your <strong>score comes
          from the structured (choice) questions</strong>, not the free text. Use clear, real,
          readable information for a credible report.
        </Callout>
        <ul style={ul}>
          <li style={li}>Answer every structured question — they drive the score and findings.</li>
          <li style={li}>Use the free-text fields for real context (owners, tools, processes), not placeholder text.</li>
          <li style={li}>Re-run the audit as your practices evolve to track progress.</li>
        </ul>
      </>
    ),
  },

  {
    id: 'agents',
    title: 'AI Agents',
    body: (
      <>
        <p style={p}>
          The AiLunaPro Agents catalog lists ten ready-to-use AI agents covering common
          business workflows. Each agent has a description, expected ROI, recommended
          minimum plan, and a direct link to get started.
        </p>
        <h3 style={h3}>Catalog (10 agents)</h3>
        <ul style={ul}>
          <li style={li}><strong>Support Agent</strong> — automate customer responses and reduce support workload.</li>
          <li style={li}><strong>Sales Agent</strong> — qualify prospects and prepare commercial follow-ups.</li>
          <li style={li}><strong>Finance Agent</strong> — assist with invoices, quotes, and collections.</li>
          <li style={li}><strong>HR Agent</strong> — assist HR teams with screening, summaries, and documentation.</li>
          <li style={li}><strong>Compliance Agent</strong> — help structure AI compliance, risks, and registries.</li>
          <li style={li}><strong>Marketing Agent</strong> — generate content, campaigns, and marketing ideas.</li>
          <li style={li}><strong>Reporting Agent</strong> — create summaries, dashboards, and decision reports.</li>
          <li style={li}><strong>Audit Agent</strong> — support AI audit, maturity assessment, and action plans.</li>
          <li style={li}><strong>Document Agent</strong> — classify, summarize, and extract information from documents.</li>
          <li style={li}><strong>Admin Agent</strong> — automate daily administrative work.</li>
        </ul>
        <h3 style={h3}>Source badge</h3>
        <p style={p}>
          Agents are tagged <strong>AiLunaPro</strong> when they are first-party. Future
          versions will surface external alternatives with their own badge.
        </p>
        <h3 style={h3}>Plan badge</h3>
        <p style={p}>
          Each card shows a minimum plan badge (Starter+, Professional+, Enterprise+). It indicates the
          recommended subscription tier for typical usage.
        </p>
        <h3 style={h3}>Get this agent</h3>
        <p style={p}>
          Click the "Get this agent" button to start onboarding. Agents are not yet purchasable
          directly inside AiLunaPro — the link takes you through the standard sign-up flow.
        </p>
      </>
    ),
  },

  {
    id: 'tokens',
    title: 'Tokens',
    body: (
      <>
        <p style={p}>
          Tokens are the unit of AI consumption inside AiLunaPro. Every audit, recommendation,
          or agent call uses tokens from your workspace's monthly allocation.
        </p>
        <h3 style={h3}>How tokens work</h3>
        <ul style={ul}>
          <li style={li}>Your subscription includes a monthly token allocation that fits the plan.</li>
          <li style={li}>Each cycle, your balance refreshes. A small rollover (capped at one monthly allocation) carries over to avoid losing unused tokens.</li>
          <li style={li}>If your balance runs low, you can buy a top-up pack at any time.</li>
          <li style={li}>Top-up tokens are added to your balance and never expire.</li>
          <li style={li}>Top-ups complement your subscription — they do not replace it.</li>
        </ul>
        <h3 style={h3}>Top-up packs</h3>
        <p style={p}>
          Three packs are available: Starter (+5,000 tokens), Pro (+25,000 tokens), Max
          (+100,000 tokens). Token packs are currently billed in USD.
        </p>
        <h3 style={h3}>Where to view your balance</h3>
        <p style={p}>
          The token badge in the topbar shows your current balance and monthly allocation.
          Click it to open the Tokens page for full usage history and to buy a top-up.
        </p>
        <h3 style={h3}>When tokens run out</h3>
        <p style={p}>
          AI actions that need more tokens than your balance show a clear "not enough tokens"
          message and a link to buy a top-up. Owners, admins, and billing managers can buy
          packs. Members can view balances but cannot buy.
        </p>
      </>
    ),
  },

  {
    id: 'billing',
    title: 'Billing',
    body: (
      <>
        <p style={p}>
          AiLunaPro offers Free, Starter, Professional, and Enterprise subscription plans.
          Plans differ by token allocation, audit volume, and team capabilities.
        </p>
        <h3 style={h3}>Currency</h3>
        <p style={p}>
          Billing and token packs are currently in USD. The sidebar currency selector is
          a display preference only. It does not change Stripe checkout currency or token
          pack pricing yet. Multi-currency billing is planned for a future release.
        </p>
        <h3 style={h3}>Subscribing</h3>
        <p style={p}>
          From the Billing page, owners and admins can pick a plan and complete checkout
          via Stripe. The subscription activates immediately on successful payment and
          your token allocation updates automatically.
        </p>
        <h3 style={h3}>Managing your subscription</h3>
        <p style={p}>
          The "Manage subscription" button opens the Stripe Customer Portal where you can
          update your payment method, change plan, view invoices, or cancel. Cancellation
          takes effect at the end of the current period.
        </p>
        <h3 style={h3}>Invoices</h3>
        <p style={p}>
          Invoices appear on the Billing page after each renewal. Click View or PDF to
          download a copy.
        </p>
        <h3 style={h3}>Free plan</h3>
        <p style={p}>
          The Free plan gives limited audit access and 100 tokens per month. Use it to
          explore the product before subscribing.
        </p>
      </>
    ),
  },

  {
    id: 'diagnostic',
    title: 'Diagnostic Express',
    body: (
      <>
        <p style={p}>
          Diagnostic Express is a free, 8-question assessment that gives you an AI maturity
          score from 0 to 100, along with a short list of recommended AiLunaPro agents.
        </p>
        <h3 style={h3}>Where to access it</h3>
        <p style={p}>
          Open <Code>#/diagnostic</Code> in your browser. No login required. Takes about
          two minutes. You can share the link with colleagues.
        </p>
        <h3 style={h3}>What you get</h3>
        <ul style={ul}>
          <li style={li}>A normalized score from 0 to 100.</li>
          <li style={li}>A maturity bucket: Emerging, Developing, or Advanced.</li>
          <li style={li}>Three recommended agents adapted to your stage.</li>
          <li style={li}>A direct link to create your free AiLunaPro account.</li>
        </ul>
        <h3 style={h3}>Privacy</h3>
        <p style={p}>
          Submitted answers and your email are stored only to generate your diagnostic and
          to follow up about relevant AI services. You can request deletion at any time.
        </p>
      </>
    ),
  },

  {
    id: 'roi-calculator',
    title: 'ROI Calculator',
    body: (
      <>
        <p style={p}>
          The ROI Calculator estimates how much time and money your team can save by
          adopting AiLunaPro AI agents for a specific workflow.
        </p>
        <h3 style={h3}>Where to access it</h3>
        <p style={p}>
          Open <Code>#/roi-calculator</Code> in your browser. No login required. Takes
          about one minute.
        </p>
        <h3 style={h3}>Inputs</h3>
        <ul style={ul}>
          <li style={li}>Team size (1 to 10,000).</li>
          <li style={li}>Monthly hours your team spends on repetitive work.</li>
          <li style={li}>Average hourly cost in USD (defaults to 50).</li>
          <li style={li}>Target workflow (one of nine: support, sales, finance, documents, reporting, admin, compliance, marketing, hr).</li>
        </ul>
        <h3 style={h3}>Outputs</h3>
        <ul style={ul}>
          <li style={li}>Estimated monthly cost saved (USD).</li>
          <li style={li}>Estimated yearly cost saved (USD).</li>
          <li style={li}>Estimated time saved per month (hours).</li>
          <li style={li}>Estimated payback period in months.</li>
          <li style={li}>Two recommended AiLunaPro agents for the chosen workflow.</li>
        </ul>
        <h3 style={h3}>About the estimate</h3>
        <p style={p}>
          The result is based on the information you provide and conservative automation
          assumptions. Actual savings may vary. Payback uses a placeholder agent cost of
          $99/month until agent pricing is finalized.
        </p>
      </>
    ),
  },

  {
    id: 'team',
    title: 'Team and Roles',
    body: (
      <>
        <p style={p}>
          AiLunaPro supports five roles per workspace. Each role has a specific scope:
        </p>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Manage workspace</th>
              <th style={thStyle}>Manage billing</th>
              <th style={thStyle}>Run audits</th>
              <th style={thStyle}>View reports</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={tdStyle}><strong>Owner</strong></td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
            <tr><td style={tdStyle}><strong>Admin</strong></td><td style={tdStyle}>✓</td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
            <tr><td style={tdStyle}><strong>Billing</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>—</td><td style={tdStyle}>—</td></tr>
            <tr><td style={tdStyle}><strong>Member</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>✓</td><td style={tdStyle}>✓</td></tr>
            <tr><td style={tdStyle}><strong>Client</strong></td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>—</td><td style={tdStyle}>limited</td></tr>
          </tbody>
        </table>
        <h3 style={h3}>Inviting teammates</h3>
        <p style={p}>
          Owners and admins open the Team page, click Invite, enter the email address, and
          choose a role. The invitee receives a link valid for 7 days. If a link expires
          or is lost, owners and admins can regenerate it.
        </p>
        <h3 style={h3}>Changing roles</h3>
        <p style={p}>
          Owners and admins can change a teammate's role from the Team page. Members can
          be temporarily disabled (no access) and re-enabled later, or removed from the
          workspace.
        </p>
      </>
    ),
  },

  {
    id: 'settings',
    title: 'Settings',
    body: (
      <>
        <h3 style={h3}>Profile</h3>
        <p style={p}>Update your display name and email address from Settings → Profile.</p>
        <h3 style={h3}>Organization</h3>
        <p style={p}>Owners can rename the organization from Settings → Organization.</p>
        <h3 style={h3}>Theme</h3>
        <p style={p}>Switch between light and dark mode from Settings → Preferences. Your choice persists across sessions.</p>
        <h3 style={h3}>Language</h3>
        <p style={p}>
          The language selector in the sidebar and in Settings is a preference only. The
          application currently displays in English. Full multi-language support is planned
          for a future release.
        </p>
        <h3 style={h3}>Currency</h3>
        <p style={p}>
          The currency selector in the sidebar and in Settings is a display preference only.
          Billing and token pack pricing remain in USD until multi-currency billing is
          implemented.
        </p>
        <h3 style={h3}>Email notifications</h3>
        <p style={p}>
          Choose which emails you want to receive: weekly compliance digest, report-ready
          notifications, and team activity. Settings → Preferences → Email notifications.
        </p>
      </>
    ),
  },

  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    body: (
      <>
        <h3 style={h3}>The page won't load</h3>
        <p style={p}>
          The service may be temporarily unavailable. Refresh the page. If the issue
          continues, contact your workspace owner or AiLunaPro support.
        </p>
        <h3 style={h3}>You're signed out unexpectedly</h3>
        <p style={p}>
          Your session may have expired. Sign in again. If you keep getting signed out,
          contact your workspace owner.
        </p>
        <h3 style={h3}>Token balance looks incorrect</h3>
        <p style={p}>
          Refresh the page first. If your balance still looks wrong after a refresh,
          contact your workspace owner or AiLunaPro support.
        </p>
        <h3 style={h3}>Token balance didn't update after checkout</h3>
        <p style={p}>
          Wait a moment and refresh the page. Token credits arrive within a few seconds
          of a successful payment. If the balance still does not update, contact your
          workspace owner or AiLunaPro support.
        </p>
        <h3 style={h3}>Captcha keeps failing on the public forms</h3>
        <p style={p}>
          Reload the page and complete the captcha again. If the issue persists, try a
          different browser or contact AiLunaPro support.
        </p>
        <h3 style={h3}>Subscription sync failed</h3>
        <p style={p}>
          On the Billing success page, click Retry sync. If the failure persists, contact
          AiLunaPro support and include your Stripe receipt.
        </p>
        <h3 style={h3}>Invitation link doesn't work</h3>
        <p style={p}>
          Invitations expire after 7 days. Ask your workspace owner or admin to regenerate
          the invite from the Team page.
        </p>
        <h3 style={h3}>Blank screen, "Oops", or broken layout?</h3>
        <p style={p}>
          This is almost always a browser <strong>ad-blocker or privacy extension</strong>{' '}
          (or a corporate/VPN/DNS filter) blocking the app's scripts, styles, or data
          requests — you may see <strong>ERR_BLOCKED_BY_CLIENT</strong> in the console.
          Fix it by allowing <strong>audit.ailunapro.com</strong> and{' '}
          <strong>*.googleapis.com</strong> in your blocker, or open the app in a clean
          browser profile with no extensions, then reload.
        </p>
        <h3 style={h3}>Didn't get the verification or password reset email?</h3>
        <p style={p}>
          Verification and password reset emails are sent by Firebase from{' '}
          <strong>noreply@audit-ai-cc9e2.firebaseapp.com</strong>. Check your{' '}
          <strong>spam / promotions</strong> folder first. You can resend the verification
          email from <strong>Settings → Profile</strong>, or request a new reset link from
          the <strong>Forgot password</strong> page. After verifying, sign out and back in
          so your account reflects the verified status. (Team invitations are separate and
          sent via AiLunaPro's email provider.)
        </p>
      </>
    ),
  },

  {
    id: 'faq',
    title: 'FAQ',
    body: (
      <>
        <h3 style={h3}>Why don't I see my old reports?</h3>
        <p style={p}>
          Reports are <strong>per workspace</strong>. An older report likely belongs to a
          different workspace — switch workspace from the selector at the top of the sidebar.
          The dashboard date filter does not affect the Reports list.
        </p>
        <h3 style={h3}>Why is Reports empty?</h3>
        <p style={p}>
          A submitted audit alone does not create a report. Open a submitted audit and click
          <strong> Generate report</strong> to create a snapshot — it then appears under Reports.
        </p>
        <h3 style={h3}>Does random text affect my score?</h3>
        <p style={p}>
          No. The score comes from the structured (choice) questions. Free-text “Describe…”
          fields add context only — but clear, real input makes your report credible.
        </p>
        <h3 style={h3}>What is saved, and when?</h3>
        <p style={p}>
          <strong>Submit Audit</strong> saves your answers + score. <strong>Generate report</strong>
          creates a separate, shareable snapshot. See “Audit vs Report” above.
        </p>
        <h3 style={h3}>Is my data secure?</h3>
        <p style={p}>
          AiLunaPro uses authenticated access, role-based permissions, Firestore security
          rules, and server-side writes for sensitive operations. Token amounts, billing
          actions, and team changes are validated by the server.
        </p>
        <h3 style={h3}>Can I delete my data?</h3>
        <p style={p}>
          Yes. Contact your workspace owner or AiLunaPro support to request deletion of
          your account or your workspace data.
        </p>
        <h3 style={h3}>Why are token packs in USD?</h3>
        <p style={p}>
          AiLunaPro is rolling out multi-currency support in stages. Subscriptions support
          multiple currencies via Stripe. Token packs will become multi-currency in a
          future release.
        </p>
        <h3 style={h3}>What does the currency selector do?</h3>
        <p style={p}>
          It is a display preference only. It does not change Stripe checkout currency or
          token pack pricing yet.
        </p>
        <h3 style={h3}>What does the language selector do?</h3>
        <p style={p}>
          It stores your preferred language. Full UI translation is in progress and will
          ship in a future release.
        </p>
        <h3 style={h3}>How do I contact support?</h3>
        <p style={p}>
          For account, billing, or technical questions, contact your workspace owner first.
          For issues that need our help, contact AiLunaPro support directly.
        </p>
        <h3 style={h3}>Are agents purchased inside AiLunaPro yet?</h3>
        <p style={p}>
          Not yet. The Agents catalog lists recommended AI agents. Selecting "Get this
          agent" takes you through the standard onboarding flow. Direct in-app purchase
          is planned for a later phase.
        </p>
        <h3 style={h3}>Is the ROI estimate guaranteed?</h3>
        <p style={p}>
          No. The ROI Calculator gives a conservative estimate based on the information
          you provide. Actual savings depend on your workflow, integration quality, and
          adoption.
        </p>
      </>
    ),
  },
];
