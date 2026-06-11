import { describe, it, expect, beforeEach } from 'vitest';
import {
  readBuilderStep, saveBuilderStep, readBuilderTicks, saveBuilderTicks, tickKey,
} from '../../src/lib/systemBuilder/builderState';

/* B3 — System Builder local progress: localStorage-only, deterministic,
 * malformed-data safe. */

beforeEach(() => { try { localStorage.clear(); } catch { /* noop */ } });

describe('builder step persistence', () => {
  it('defaults to 0 and round-trips', () => {
    expect(readBuilderStep()).toBe(0);
    saveBuilderStep(3);
    expect(readBuilderStep()).toBe(3);
  });
  it('is safe on garbage values', () => {
    localStorage.setItem('ailunapro.sysbuilder.v1.step', 'not-a-number');
    expect(readBuilderStep()).toBe(0);
    localStorage.setItem('ailunapro.sysbuilder.v1.step', '-4');
    expect(readBuilderStep()).toBe(0);
  });
});

describe('checklist ticks persistence', () => {
  it('round-trips ticks and keeps only true entries', () => {
    saveBuilderTicks({ [tickKey('purpose', 0)]: true, [tickKey('data', 2)]: true });
    const t = readBuilderTicks();
    expect(t['purpose:0']).toBe(true);
    expect(t['data:2']).toBe(true);
    expect(Object.keys(t)).toHaveLength(2);
  });
  it('is safe on malformed stored JSON', () => {
    localStorage.setItem('ailunapro.sysbuilder.v1.ticks', '{broken');
    expect(readBuilderTicks()).toEqual({});
    localStorage.setItem('ailunapro.sysbuilder.v1.ticks', '[1,2]');
    expect(readBuilderTicks()).toEqual({});
  });
});
