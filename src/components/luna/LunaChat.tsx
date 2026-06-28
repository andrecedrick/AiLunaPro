/**
 * LunaChat — Luna chat UI (S3 Phase 2 + L1).
 *
 * Each user message is answered by the Claude-backed /api/luna/chat (askLunaAI),
 * with the deterministic answerLuna() as the fallback on any failure. Replies
 * are rendered through RichText (so **bold** product terms style nicely, never
 * literal markdown) and may carry one in-app deep-link action. The reply is
 * requested in the user's app language. No storage; no PII leaves the browser.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { answerLuna } from '../../lib/luna/answer';
import { askLunaAI } from '../../lib/luna/lunaChatClient';
import { usePreferences } from '../../context/PreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useSessionValue } from '../../context/SessionValueContext';
import { ActionValueHint } from '../tokens/ActionValueHint';
import { RichText } from '../RichText';
import type { LunaAction } from '../../lib/luna/guidance';
import type { Route } from '../../types/audit';

interface Msg { role: 'user' | 'luna'; text: string; actions?: LunaAction[]; upsell?: { balance: number; required: number } }

/** Idempotency key per message (safe-retry token charge); jsdom-safe fallback. */
function newId(): string {
  try { return crypto.randomUUID(); } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
}

const GREETING: Msg = {
  role: 'luna',
  text: "Hi — I'm Luna. Ask me how to do something in the app, like \"how do I start an audit?\" or \"where are my reports?\"",
  actions: [],
};

/** Action pill — design-system styled with a subtle hover lift. `primary` makes
 *  it a filled CTA (used for the token upsell); otherwise an outline deep-link. */
function ActionPill({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  const [hover, setHover] = useState(false);
  const background = primary
    ? (hover ? '#6d28d9' : 'var(--violet)')
    : (hover ? 'var(--violet)' : 'rgba(124,58,237,0.06)');
  const color = primary || hover ? '#fff' : 'var(--violet-text)';
  return (
    <button
      type="button" onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, marginRight: 8,
        padding: primary ? '9px 16px' : '8px 14px', borderRadius: 999, cursor: 'pointer',
        border: primary ? 'none' : '1px solid var(--violet)',
        fontFamily: 'var(--font-body)', fontWeight: primary ? 700 : 600, fontSize: 12.5,
        background, color,
        boxShadow: primary ? '0 4px 12px rgba(124,58,237,0.25)' : 'none',
        transform: hover ? 'translateY(-1px)' : 'none',
        transition: 'background 0.15s ease, color 0.15s ease, transform 0.15s ease',
      }}
    >
      {label} <span aria-hidden style={{ fontWeight: 800 }}>→</span>
    </button>
  );
}

export function LunaChat({ routeName, onNavigate, onNeedTokens }: {
  routeName: Route['name'];
  onNavigate: (r: Route) => void;
  onNeedTokens?: (info: { balance: number; required: number }) => void;
}) {
  const { language } = usePreferences();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const { recordAction } = useSessionValue();
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }); }, [messages, pending]);

  const send = async () => {
    const q = input.trim();
    if (!q || pending) return;
    setInput('');
    // History BEFORE this turn (state closure is pre-append); strip is server-side too.
    const history = messages.map(m => ({ role: (m.role === 'luna' ? 'assistant' : 'user') as 'assistant' | 'user', text: m.text }));
    setMessages(m => [...m, { role: 'user', text: q }]);
    setPending(true);

    let reply: Msg;
    try {
      const r = await askLunaAI({
        message: q, routeName, history, lang: language,
        orgId: session?.orgId ?? '', eventId: newId(),
      });
      if (r.needTokens) {
        // Free quota exhausted + insufficient tokens → in-chat upsell bubble with a
        // primary CTA (opens the token modal on click). Cost/balance bolded by RichText.
        const { balance, required } = r.needTokens;
        reply = {
          role: 'luna',
          text: `You've used your **3 free** Luna messages today. Each message now costs **${required} tokens** — your balance is **${balance}**. Top up to keep chatting with me.`,
          upsell: r.needTokens,
        };
      } else if (r.fallback || !r.text) {
        const a = answerLuna(q, routeName);
        reply = { role: 'luna', text: a.text, actions: a.actions };
      } else {
        reply = {
          role: 'luna',
          text: r.text,
          // Server already validated route against the allowlist (all param-less routes).
          actions: r.action ? [{ label: r.action.label, route: { name: r.action.route } as Route }] : [],
        };
        // Part 4: a real Luna answer was delivered. Value-only (free-tier 3/day
        // uncertain client-side, so we never overstate tokens spent).
        recordAction('luna.message', { charged: false });
      }
    } catch {
      const a = answerLuna(q, routeName);
      reply = { role: 'luna', text: a.text, actions: a.actions };
    }
    setMessages(m => [...m, reply]);
    setPending(false);
  };

  const bubble = (role: 'user' | 'luna'): CSSProperties => ({
    maxWidth: '85%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    padding: '9px 13px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
    background: role === 'user' ? 'var(--violet)' : 'var(--surface-2, var(--surface))',
    color: role === 'user' ? '#fff' : 'var(--text-primary)',
    border: role === 'user' ? 'none' : '1px solid var(--border)',
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: '52vh', paddingRight: 2 }}>
        {messages.map((m, i) => (
          <div key={i} style={bubble(m.role)}>
            <div><RichText t={m.text} /></div>
            {m.role === 'luna' && m.actions && m.actions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {m.actions.map(a => (
                  <ActionPill key={a.label} label={a.label} onClick={() => onNavigate(a.route)} />
                ))}
              </div>
            )}
            {m.role === 'luna' && m.upsell && (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                <ActionPill primary label="Get more tokens" onClick={() => onNeedTokens?.(m.upsell!)} />
              </div>
            )}
          </div>
        ))}
        {pending && (
          <div style={{ ...bubble('luna'), color: 'var(--text-muted)' }} aria-label="Luna is typing">…</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
          rows={2}
          placeholder="Ask Luna…"
          aria-label="Ask Luna"
          style={{
            flex: 1, resize: 'none', padding: '9px 12px', fontSize: 13.5, fontFamily: 'inherit',
            border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface-2)',
            color: 'var(--text-primary)', boxSizing: 'border-box', minHeight: 40,
          }}
        />
        <button
          type="button" onClick={() => void send()} disabled={input.trim().length === 0 || pending} aria-label="Send"
          style={{
            padding: '10px 16px', borderRadius: 10, border: 'none', cursor: input.trim() && !pending ? 'pointer' : 'not-allowed',
            background: input.trim() && !pending ? 'var(--brand-gradient)' : 'var(--surface-2)', color: input.trim() && !pending ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 13,
          }}
        >→</button>
      </div>
      <ActionValueHint action="luna.message" style={{ display: 'block', marginTop: 6 }} />
    </div>
  );
}
