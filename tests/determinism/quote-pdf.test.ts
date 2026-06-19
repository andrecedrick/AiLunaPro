import { describe, it, expect } from 'vitest';
import { buildQuotePdf, fold, type QuotePdfInput } from '../../worker/src/lib/quote-pdf';

/*
 * Q3 — Quote PDF: deterministic bytes + Latin-accent folding.
 *
 * The shared PdfBuilder is ASCII-only (asciiSanitize DROPS non-ASCII), so the
 * quote PDF folds Latin-1 accents to ASCII first. We verify byte-identical
 * output for identical input and that accented Latin text keeps its letters.
 */

const INPUT: QuotePdfInput = {
  createdAt:            '2026-06-19T00:00:00.000Z',
  docTitle:            'Devis du projet',
  projectName:         'Agent IA contextuel (MVP)',
  clientName:          'Acme SARL',
  quoteId:             'q-abc123',
  labelClient:         'Préparé pour',
  labelDate:           'Date',
  labelValid:          "Valable jusqu'au",
  labelRef:            'Référence',
  execHeading:         'Résumé du projet',
  execSummary:         'Cette proposition présente un agent IA contextuel adapté à vos objectifs.',
  summary:             "Automatiser le support client. Connecter l'IA au CRM.",
  solutionHeading:     'Solution proposée',
  solutionLabel:       'Agent IA contextuel (MVP)',
  solutionDescription: 'Un agent IA sur mesure qui automatise vos objectifs et se connecte à vos outils.',
  scopeHeading:        'Périmètre',
  scope:               ['Atelier de découverte', 'Conception de la solution'],
  pricingHeading:      'Investissement estimé',
  rangeText:           '≈ €27,600 – ≈ €73,600',
  justificationHeading:'Comment cette estimation est calculée',
  justification:       ['Basé sur les références de marché 2026.', 'Reflète la complexité contextuelle du projet.'],
  paymentHeading:      'Paiement',
  paymentNote:         'Paiement par virement bancaire sur facture.',
  timelineHeading:     'Calendrier indicatif',
  timeline:            ['Découverte et conception — 1–2 semaines', 'Développement et intégration — 4–8 semaines'],
  disclaimer:          'Estimation indicative et non contractuelle.',
};

describe('Quote PDF — determinism', () => {
  it('is byte-identical for identical input', () => {
    const a = buildQuotePdf(INPUT);
    const b = buildQuotePdf(INPUT);
    expect(a.length).toBe(b.length);
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
  });

  it('emits a non-trivial PDF starting with %PDF-', () => {
    const bytes = buildQuotePdf(INPUT);
    expect(bytes.length).toBeGreaterThan(800);
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
  });

  it('different input → different bytes', () => {
    const a = buildQuotePdf(INPUT);
    const b = buildQuotePdf({ ...INPUT, rangeText: '$3,000 - $10,000' });
    expect(Buffer.from(a).equals(Buffer.from(b))).toBe(false);
  });

  it('renders even when the summary is empty (RU/ZH fallback path)', () => {
    const bytes = buildQuotePdf({ ...INPUT, summary: '' });
    expect(bytes.length).toBeGreaterThan(800);
    expect(String.fromCharCode(...bytes.slice(0, 5))).toBe('%PDF-');
  });
});

describe('Quote PDF — Latin accent folding', () => {
  it('folds accents to ASCII without dropping letters', () => {
    expect(fold('Évaluer la faisabilité')).toBe('Evaluer la faisabilite');
    expect(fold('Conexión Português Größe')).toBe('Conexion Portugues Grosse');
  });

  it('expands currency/approx symbols', () => {
    expect(fold('€27,600 ≈ x')).toBe('EUR 27,600 x');
    expect(fold('a – b — c')).toBe('a - b - c');
  });
});
