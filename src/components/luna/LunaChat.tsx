/**
 * LunaChat — S3 Phase 1 (deterministic chat, NO LLM).
 *
 * A simple chat layout inside the Luna panel. Each user message is answered
 * client-side by answerLuna() — a deterministic keyword match over the product's
 * guidance/help topics. No backend call, no storage, no PII leaves the browser.
 * Luna replies can carry in-app deep-link actions (reusing the guidance routes).
 *
 * Phase 2 will replace answerLuna() with a Claude-backed endpoint; the UI here
 * stays the same.
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { answerLuna } from '../../lib/luna/answer';
import type { LunaAction } from '../../lib/luna/guidance';
import type { Route } from '../../types/audit';

interface Msg { role: 'user' | 'luna'; text: string; actions?: LunaAction[] }

const GREETING: Msg = {
  role: 'luna',
  text: "Hi — I'm Luna. Ask me how to do something in the app, like \"how do I start an audit?\" or \"where are my reports?\"",
  actions: [],
};

export function LunaChat({ routeName, onNavigate }: { routeName: Route['name']; onNavigate: (r: Route) => void }) {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    const ans = answerLuna(q, routeName);
    setMessages(m => [...m, { role: 'user', text: q }, { role: 'luna', text: ans.text, actions: ans.actions }]);
    setInput('');
  };

  const bubble = (role: 'user' | 'luna'): CSSProperties => ({
    maxWidth: '85%',
    alignSelf: role === 'user' ? 'flex-end' : 'flex-start',
    padding: '9px 13px', borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
    background: role === 'user' ? 'var(--violet)' : 'var(--surface-2, var(--surface))',
    color: role === 'user' ? '#fff' : 'var(--text-primary)',
    border: role === 'user' ? 'none' : '1px solid var(--border)',
  });
  const actionBtn: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 6, marginRight: 6,
    padding: '6px 12px', borderRadius: 9, cursor: 'pointer',
    background: 'transparent', border: '1px solid var(--violet)', color: 'var(--violet-text)',
    fontWeight: 600, fontSize: 12.5, fontFamily: 'var(--font-body)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0 }}>
      {/* Messages */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: '52vh', paddingRight: 2 }}>
        {messages.map((m, i) => (
          <div key={i} style={bubble(m.role)}>
            <div>{m.text}</div>
            {m.role === 'luna' && m.actions && m.actions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {m.actions.map(a => (
                  <button key={a.label} type="button" style={actionBtn} onClick={() => onNavigate(a.route)}>
                    {a.label} <span aria-hidden style={{ fontWeight: 800 }}>→</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
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
          type="button" onClick={send} disabled={input.trim().length === 0} aria-label="Send"
          style={{
            padding: '10px 16px', borderRadius: 10, border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
            background: input.trim() ? 'var(--violet)' : 'var(--surface-2)', color: input.trim() ? '#fff' : 'var(--text-muted)',
            fontWeight: 700, fontSize: 13,
          }}
        >→</button>
      </div>
    </div>
  );
}
