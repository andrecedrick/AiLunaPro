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
    const d = suggestForLabel('phone call');
    expect(d).not.toBeNull();
    expect(d!.splits.map(s => s.label)).toEqual(['Inbound calls (support)', 'Outbound calls (prospecting)']);
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

  /*
   * The rule keywords are MATCH TOKENS compared against text the user types, not
   * display copy — so they must work in whatever language the user writes in.
   * They used to carry only the French term for every ambiguity-specific concept
   * ('facture', 'saisie', 'rédaction', 'tournée'…), so an English user typing
   * "invoicing" or "data entry" silently got no suggestion at all. Both languages
   * are asserted below; French must keep working exactly as before.
   */
  describe('English input (previously unmatched)', () => {
    it.each([
      ['replying to emails',  'email'],
      ['weekly meeting',      'meeting'],
      ['social media posts',  'content'],
      ['customer invoicing',  'invoice'],
      ['monthly reporting',   'report'],
      ['cv screening',        'recruit'],
      ['data entry',          'data'],
      ['writing articles',    'writing'],
      ['document translation', 'translate'],
      ['delivery planning',   'logistics'],
    ])('suggests for %s', (label, ruleId) => {
      const d = suggestForLabel(label);
      expect(d, `no suggestion for "${label}"`).not.toBeNull();
      expect(d!.id).toBe(ruleId);
    });
  });

  describe('French input (no regression)', () => {
    it.each([
      ['répondre aux emails',      'email'],
      ['réunion hebdo',            'meeting'],
      ['post réseaux sociaux',     'content'],
      ['facturation clients',      'invoice'],
      ['tri de cv',                'recruit'],
      ['saisie de données',        'data'],
      ['rédaction article blog',   'writing'],
      ['traduction de documents',  'translate'],
      ['planification de tournée', 'logistics'],
    ])('still suggests for %s', (label, ruleId) => {
      const d = suggestForLabel(label);
      expect(d, `no suggestion for "${label}"`).not.toBeNull();
      expect(d!.id).toBe(ruleId);
    });

    it('recruiting still splits into screening vs interview', () => {
      const d = suggestForLabel('recrutement')!;
      expect(d.splits).toHaveLength(2);
    });
  });

  it('returns null for unknown / too-short labels, in either language', () => {
    expect(suggestForLabel('xy')).toBeNull();
    expect(suggestForLabel('painting the fence')).toBeNull();
    expect(suggestForLabel('peindre la cloture')).toBeNull();
  });
});
