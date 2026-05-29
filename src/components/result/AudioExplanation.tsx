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
import { LANGUAGE_LABELS } from '../../lib/preferences';

type PlayState = 'idle' | 'playing' | 'paused';

const SUPPORTED =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance !== 'undefined';

/** v1 spoken-language options. Only sets utterance.lang — NO translation.
 *  Labels reuse the allowlisted LANGUAGE_LABELS (single source; native spelling
 *  with accents lives only in lib/preferences.ts). */
const LANG_OPTIONS: { code: string; label: string }[] = [
  { code: 'en-US', label: LANGUAGE_LABELS.en },
  { code: 'fr-FR', label: LANGUAGE_LABELS.fr },
  { code: 'es-ES', label: LANGUAGE_LABELS.es },
  { code: 'de-DE', label: LANGUAGE_LABELS.de },
  { code: 'it-IT', label: LANGUAGE_LABELS.it },
  { code: 'pt-PT', label: LANGUAGE_LABELS.pt },
];

/** Per-language rate/pitch presets to soften robotic cadence. */
const LANG_TUNING: Record<string, { rate: number; pitch: number }> = {
  en: { rate: 0.95, pitch: 1.0 },
  fr: { rate: 0.90, pitch: 1.02 },
  es: { rate: 0.90, pitch: 1.02 },
  it: { rate: 0.90, pitch: 1.02 },
  pt: { rate: 0.90, pitch: 1.02 },
  de: { rate: 0.92, pitch: 1.0 },
};
function tuningFor(lang: string): { rate: number; pitch: number } {
  return LANG_TUNING[lang.slice(0, 2).toLowerCase()] ?? { rate: 0.95, pitch: 1.0 };
}

/** Voices whose lang matches the 2-letter prefix of `lang`. */
function voicesForLang(lang: string): SpeechSynthesisVoice[] {
  if (!SUPPORTED) return [];
  const p = lang.slice(0, 2).toLowerCase();
  return window.speechSynthesis.getVoices().filter(v => v.lang.slice(0, 2).toLowerCase() === p);
}

/** Quality score for a voice name — higher = more natural. Aggressive ranking. */
function voiceScore(name: string): number {
  const n = name.toLowerCase();
  let s = 0;
  if (/neural/.test(n)) s += 100;
  if (/natural/.test(n)) s += 90;
  if (/premium|enhanced/.test(n)) s += 80;
  if (/siri/.test(n)) s += 60;
  if (/google/.test(n)) s += 50;
  if (/microsoft/.test(n)) s += 40;
  // Penalise known robotic engines.
  if (/espeak|robot|compact|pico/.test(n)) s -= 50;
  return s;
}

/** Auto-pick: highest-scored voice; ties → first. */
function pickDefaultVoice(list: SpeechSynthesisVoice[]): string {
  if (list.length === 0) return '';
  const best = [...list].sort((a, b) => voiceScore(b.name) - voiceScore(a.name))[0];
  return best.voiceURI;
}

/** Match navigator.language to an option (by 2-letter prefix); else en-US. */
function defaultLang(): string {
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en-US';
  const prefix = (nav || 'en').slice(0, 2).toLowerCase();
  const hit = LANG_OPTIONS.find(o => o.code.slice(0, 2).toLowerCase() === prefix);
  return hit ? hit.code : 'en-US';
}

export function AudioExplanation({ result }: { result: AuditResult }) {
  const [state, setState] = useState<PlayState>('idle');
  const [lang, setLang] = useState<string>(() => (SUPPORTED ? defaultLang() : 'en-US'));
  // Index of the sentence currently/last spoken (for chunked playback).
  const idxRef = useRef(0);
  const sentencesRef = useRef<string[]>([]);
  const langRef = useRef(lang);
  langRef.current = lang;

  // Voices for the selected language + the chosen voiceURI. Voices load async,
  // so recompute on lang change AND on onvoiceschanged.
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => voicesForLang(lang));
  const [voiceURI, setVoiceURI] = useState<string>('');
  const voiceURIRef = useRef('');
  voiceURIRef.current = voiceURI;
  const voiceMissing = voices.length === 0;

  useEffect(() => {
    if (!SUPPORTED) return;
    const refresh = () => {
      // Sort best-first so the dropdown surfaces natural voices at the top.
      const list = voicesForLang(lang).sort((a, b) => voiceScore(b.name) - voiceScore(a.name));
      setVoices(list);
      // Keep current selection if still valid for this lang; else auto-pick.
      setVoiceURI(prev => (list.some(v => v.voiceURI === prev) ? prev : pickDefaultVoice(list)));
    };
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [lang]);

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

  // Build a tuned utterance (lang preset + chosen voice). Shared by playback
  // and the "Test voice" button.
  const makeUtterance = (text: string): SpeechSynthesisUtterance => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = langRef.current;
    const t = tuningFor(langRef.current);
    u.rate = t.rate;
    u.pitch = t.pitch;
    u.volume = 1.0;
    if (voiceURIRef.current) {
      const v = window.speechSynthesis.getVoices().find(vv => vv.voiceURI === voiceURIRef.current);
      if (v) u.voice = v;
    }
    return u;
  };

  // ~280ms micro-pause between sentences for a less rushed, more natural cadence.
  const SECTION_PAUSE_MS = 280;

  const speakFrom = (start: number) => {
    const sentences = sentencesRef.current;
    if (start >= sentences.length) {
      setState('idle');
      idxRef.current = 0;
      return;
    }
    idxRef.current = start;
    const u = makeUtterance(sentences[start]);
    u.onend = () => {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return;
      // Micro-pause before the next sentence (deterministic, no meaning change).
      window.setTimeout(() => {
        // Only continue if still playing (not stopped/paused meanwhile).
        if (idxRef.current === start) speakFrom(start + 1);
      }, SECTION_PAUSE_MS);
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

  // Test voice — speak a single demo sentence with current lang/voice/tuning.
  // Does not affect the main playback state machine.
  const handleTest = () => {
    if (state === 'playing' || state === 'paused') return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(makeUtterance('This is a sample of the selected voice.'));
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
        {voiceMissing && (
          <div style={{ fontSize: 11, color: 'var(--yellow-text)', marginTop: 4, lineHeight: 1.4 }}>
            A voice for this language may be unavailable on this device; playback may use a default voice.
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Language selector — sets utterance.lang only (no translation). */}
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          aria-label="Audio language"
          style={{
            padding: '8px 10px',
            borderRadius: 8,
            border: '1.5px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          {LANG_OPTIONS.map(o => (
            <option key={o.code} value={o.code}>{o.label}</option>
          ))}
        </select>
        {/* Voice selector — only shown when voices for the language exist. */}
        {voices.length > 0 && (
          <select
            value={voiceURI}
            onChange={e => setVoiceURI(e.target.value)}
            aria-label="Audio voice"
            style={{
              padding: '8px 10px',
              borderRadius: 8,
              border: '1.5px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              maxWidth: 180,
            }}
          >
            {voices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
            ))}
          </select>
        )}
        {state === 'idle' && btn('🔈 Test voice', handleTest)}
        {state !== 'playing' ? btn(state === 'paused' ? '▶ Resume' : '▶ Play', handlePlay, true) : btn('⏸ Pause', handlePause)}
        {state !== 'idle' && btn('⏹ Stop', handleStop)}
      </div>
    </div>
  );
}
