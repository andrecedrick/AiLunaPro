import { describe, it, expect } from 'vitest';
import { TASK_CATALOG, suggestForLabel } from '../../src/lib/worksheet/taskCatalog';
import { taskVerdict, WHO_VALUES, RULES_VALUES, ENERGY_VALUES } from '../../src/lib/worksheet/auditWorksheet';

describe('Task catalog integrity', () => {
  it('every catalog task uses valid enum values', () => {
    for (const g of TASK_CATALOG) {
      expect(g.tasks.length).toBeGreaterThan(0);
      for (const t of g.tasks) {
        expect(t.label.trim().length).toBeGreaterThan(0);
        expect(WHO_VALUES).toContain(t.who);
        expect(RULES_VALUES).toContain(t.rules);
        expect(ENERGY_VALUES).toContain(t.energy);
        // Every catalog task must produce a verdict (no crash).
        expect(['keep', 'rethink', 'automate', 'delegate']).toContain(taskVerdict(t.who, t.rules, t.energy));
      }
    }
  });
});

describe('Task disambiguation', () => {
  it('flags ambiguous phone-call tasks with inbound/outbound splits', () => {
    const d = suggestForLabel('appel téléphonique');
    expect(d).not.toBeNull();
    expect(d!.splits.map(s => s.label)).toEqual(['Appels entrants (support)', 'Appels sortants (prospection)']);
    // The two splits get DIFFERENT verdicts — the whole point.
    const v0 = taskVerdict(d!.splits[0].who, d!.splits[0].rules, d!.splits[0].energy);
    const v1 = taskVerdict(d!.splits[1].who, d!.splits[1].rules, d!.splits[1].energy);
    expect(v0).not.toBe(v1);
  });

  it('matches regardless of accents/case', () => {
    expect(suggestForLabel('APPEL')).not.toBeNull();
    expect(suggestForLabel('reunion equipe')).not.toBeNull();
    expect(suggestForLabel('Réunion équipe')).not.toBeNull();
  });

  it('recognizes emails, meetings, content, invoices', () => {
    expect(suggestForLabel('répondre aux emails')).not.toBeNull();
    expect(suggestForLabel('réunion hebdo')).not.toBeNull();
    expect(suggestForLabel('post réseaux sociaux')).not.toBeNull();
    expect(suggestForLabel('facturation clients')).not.toBeNull();
  });

  it('returns null for unknown / too-short labels', () => {
    expect(suggestForLabel('xy')).toBeNull();
    expect(suggestForLabel('peindre la clôture')).toBeNull();
  });
});
