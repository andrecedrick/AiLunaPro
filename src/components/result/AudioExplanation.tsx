/**
 * AudioExplanation — J11 (Web Speech API, client-side TTS).
 *
 * Spoken summary of the audit result. Fully client-side via
 * window.speechSynthesis — NO network, NO endpoint, NO audio storage, NO PII
 * transmitted. Disclaimer is always spoken first (script built by
 * buildSpeechScript). Never autoplays — user-initiated only.
 *
 * Robustness:
 *   - Feature-detect; if unsupported, render a small note instead of controls.
 *   - Chunk per sentence (workaround for the ~15s Chrome utterance cutoff).
 *   - Cancel speech on unmount and when the user navigates away.
 */

import { useEffect, useRef, useState } from 'react';
import type { AuditResult } from '../../types/scoring';
import { buildSpeechScript } from '../../lib/audio/buildSpeechScript';

type PlayState = 'idle' | 'playing' | 'paused';

const SUPPORTED =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance !== 'undefined';

export function AudioExplanation({ result }: { result: AuditResult }) {
  const [state, setState] = useState<PlayState>('idle');
  // Index of the sentence currently/last spoken (for chunked playback).
  const idxRef = useRef(0);
  const sentencesRef = useRef<string[]>([]);

  // Cancel any in-flight speech on unmount (covers route changes too).
  useEffect(() => {
    return () => {
      if (SUPPORTED) window.speechSynthesis.cancel();
    };
  }, []);

  if (!SUPPORTED) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--card-radius)',
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        Audio summary isn’t supported in this browser.
      </div>
    );
  }

  const speakFrom = (start: number) => {
    const sentences = sentencesRef.current;
    if (start >= sentences.length) {
      setState('idle');
      idxRef.current = 0;
      return;
    }
    idxRef.current = start;
    const u = new SpeechSynthesisUtterance(sentences[start]);
    u.lang = 'en-US';
    u.onend = () => {
      // Advance only if we're still in playing state (not stopped/paused).
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
      speakFrom(start + 1);
    };
    u.onerror = () => setState('idle');
    window.speechSynthesis.speak(u);
  };

  const handlePlay = () => {
    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }
    // Fresh start — build script, cancel anything stale, speak from 0.
    window.speechSynthesis.cancel();
    sentencesRef.current = buildSpeechScript(result);
    setState('playing');
    speakFrom(0);
  };

  const handlePause = () => {
    if (state !== 'playing') return;
    window.speechSynthesis.pause();
    setState('paused');
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    idxRef.current = 0;
    setState('idle');
  };

  const btn = (label: string, onClick: () => void, primary = false) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: primary ? '1.5px solid var(--violet)' : '1.5px solid var(--border)',
        background: primary ? 'transparent' : 'var(--surface)',
        color: primary ? 'var(--violet-text)' : 'var(--text-secondary)',
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--card-radius)',
        boxShadow: 'var(--card-shadow)',
        padding: '14px 18px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
          🔊 Audio summary <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>(beta · ~2–3 min)</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
          Spoken by your browser. The disclaimer is read first. Quality varies by device.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {state !== 'playing' ? btn(state === 'paused' ? '▶ Resume' : '▶ Play', handlePlay, true) : btn('⏸ Pause', handlePause)}
        {state !== 'idle' && btn('⏹ Stop', handleStop)}
      </div>
    </div>
  );
}
