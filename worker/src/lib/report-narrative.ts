/**
 * White-paper content layer for the Report PDF (deterministic, no LLM, no PII).
 * Business-language, multi-paragraph copy keyed by stable section ids — turns a
 * one-line finding into a consulting-grade explanation. Numbers are never
 * authored here (they come from the computed result); examples are illustrative.
 */

export interface DeepNarrative {
  concept: string;     // term for the "In plain terms" box
  conceptDef: string;  // plain-language definition
  situation: string;   // the situation today
  businessCase: string; // why it's a business problem (risk / efficiency / advantage)
  flow: [string, string, string, string]; // Input, Process, Output, Impact
  example: string;     // concrete, illustrative
}

const N: Record<string, DeepNarrative> = {
  'governance': {
    concept: 'AI governance',
    conceptDef: 'The simple practice of having someone clearly responsible for how AI is used, and a written rule everyone follows. It is to AI what a budget owner is to spending.',
    situation: 'Today there is no single owner and no written rule for how AI is adopted across your teams. Tools get introduced case by case, and no one has a complete view of what is in use or why.',
    businessCase: 'This is a business problem on three fronts. It raises risk, because ad-hoc decisions are the ones that go wrong unnoticed and are hardest to defend to a regulator or partner. It costs efficiency, because every new tool restarts the same debate instead of following a known path. And it caps your competitive advantage, because enterprise customers increasingly want to see that you govern AI deliberately, not accidentally.',
    flow: ['Teams adopt AI', 'No shared rule or owner', 'Inconsistent, invisible use', 'A clear policy → predictable, defensible adoption'],
    example: 'A 20-person firm named one AI owner and published a single-page policy. New tools now get a quick, documented yes or no — replacing months of silent sprawl with a path everyone trusts.',
  },
  'data': {
    concept: 'Data governance',
    conceptDef: 'Knowing what data you hold, where it came from, and why you are allowed to use it. Good AI starts with data you can trust and account for.',
    situation: 'Sensitive information may be feeding your AI without a clear record of its source, its purpose, or your basis for holding it. There is no simple inventory to point to.',
    businessCase: 'Every AI decision inherits the quality of its data, so an unverified input quietly becomes an unverified outcome — multiplied across thousands of decisions. The exposure is concrete: a data issue here is exactly what a privacy review surfaces first, and the remediation cost rises sharply once it is discovered for you. A clean inventory also pays back in efficiency, because teams stop rediscovering the same questions every project.',
    flow: ['Raw data', 'No inventory or basis', 'Unverified inputs', 'A short inventory → trustworthy, defensible inputs'],
    example: 'A services team listed each dataset’s source and purpose in one sheet — and immediately retired two datasets it no longer needed, shrinking both cost and risk in an afternoon.',
  },
  'security': {
    concept: 'AI security controls',
    conceptDef: 'The basic protections — access limits, logging, testing — that keep your AI systems from being misused or breached. The locks and cameras of your AI estate.',
    situation: 'The core safeguards around your AI systems are thin: fewer of the standard controls (encryption, access control, audit logs, secrets handling, isolation) are in place than we would expect for AI running in production.',
    businessCase: 'Operating AI without these controls is open exposure, not a technical footnote. A single incident converts a quiet gap into a public one, with breach and remediation costs that dwarf the fix. The same controls also remove the manual scramble every security review currently triggers — and, increasingly, enterprise buyers require evidence of them before they will sign, so the gap is a silent deal-blocker.',
    flow: ['AI in production', 'Core controls missing', 'Exposed attack surface', 'Standard controls → contained risk, easier deals'],
    example: 'A startup added access limits and a quarterly review of its AI endpoints — closing precisely the gaps an auditor checks first, and unblocking a stalled enterprise contract.',
  },
  'transparency': {
    concept: 'Explainability & transparency',
    conceptDef: 'Being able to tell people when AI is involved and why it reached a result. If you cannot say why, you cannot defend the decision or earn trust in it.',
    situation: 'When your AI influences a decision, the people affected currently receive no reason, or only a generic one — and there is no record of why a given outcome occurred.',
    businessCase: 'Unexplained decisions cost you in three ways. They invite disputes, because people increasingly expect — and in some sectors are entitled to — a clear reason. They waste time, because your own team cannot tell a correct decision from a lucky one without reconstructing it by hand. And they cost deals, because "can you explain your AI?" is now a procurement question that a confident yes wins.',
    flow: ['AI produces an outcome', 'No reason recorded', 'User sees only the result', 'Clear reasons → fewer disputes, an auditable trail'],
    example: 'A lender that began attaching category-level reason codes to automated declines resolved most customer disputes in a single reply — turning an afternoon of reconstruction into a one-line answer.',
  },
  'human-oversight': {
    concept: 'Human oversight',
    conceptDef: 'Making sure a person can review, pause, or override AI on the decisions that really matter. A safety net for the cases where being wrong is expensive.',
    situation: 'AI outputs can currently drive consequential decisions with no required human checkpoint, and overrides are not captured for review.',
    businessCase: 'The risk is asymmetric: most decisions are routine, but the rare wrong one on a high-stakes case is exactly where you need a human positioned to catch it — and right now no one is. A lightweight review step contains that tail risk, gives you an auditable record of who decided what, and reassures the customers and partners who ask how your AI is supervised.',
    flow: ['AI decides', 'No review step', 'Action taken automatically', 'A named reviewer → pause/override before impact'],
    example: 'A 15-person lender added a two-minute sign-off on automated declines: clear cases move at the same speed, while the edge cases finally get a human safety net.',
  },
  'training-maturity': {
    concept: 'AI literacy & maturity',
    conceptDef: 'Maturity level (1–5) is simply how systematic your AI practice is — from improvised to well-run. Literacy is whether your people know how to use AI safely.',
    situation: 'Staff using AI have not had basic guidance on doing it safely and effectively, and your self-assessed maturity sits at the lower end of the scale.',
    businessCase: 'Most AI incidents are everyday misuse, not exotic attacks — so a little structured guidance prevents a disproportionate share of problems. Beyond risk, it is a fast efficiency win: standardising the prompts and habits people are already inventing removes rework and inconsistency. And a visibly mature practice is a trust signal that wins business.',
    flow: ['Staff use AI', 'No shared guidance', 'Inconsistent, risky use', 'A short training → confident, consistent use'],
    example: 'A team ran one 45-minute "how we use AI here" session and standardised the prompts people had been improvising — lifting quality and cutting rework the same week.',
  },
  'ai-tools': {
    concept: 'AI tool inventory',
    conceptDef: 'A single list of every AI tool in use across the company. You cannot govern, secure, or improve what you cannot see.',
    situation: 'The AI tools in use across your organisation are not fully inventoried, so some operate outside any oversight ("shadow AI").',
    businessCase: 'Unknown tools are where risk concentrates — ungoverned, unsecured, and invisible to a review. A registry converts that blind spot into control, and almost always uncovers duplication you are paying for twice. It is also the foundation every other improvement builds on.',
    flow: ['Tools adopted freely', 'No registry', 'Shadow AI', 'A registry → visibility, control, lower cost'],
    example: 'A company logged every AI tool in one registry and found three doing the same job — consolidating them cut both spend and risk at once.',
  },
  'profile': {
    concept: 'Risk context',
    conceptDef: 'Your sector and AI footprint decide which risks matter most for you — the same gap can be minor for one business and serious for another.',
    situation: 'This context sets how the rest of your results are weighted, so your priorities are tailored rather than generic.',
    businessCase: 'Focusing effort where your specific context makes risk highest is what turns a long list into a short, high-leverage plan — spending attention where it actually protects and differentiates the business.',
    flow: ['Your context', 'Risk weighting', 'Tailored priorities', 'Focus → effort where it counts'],
    example: 'Two firms with the same score received different top priorities, because their sector and data made different risks matter most.',
  },
};

const FALLBACK: DeepNarrative = {
  concept: 'This area',
  conceptDef: 'An aspect of your AI practice with room to strengthen.',
  situation: 'This area scored below where a well-run AI practice would sit.',
  businessCase: 'Closing it reduces risk, removes manual rework, and makes your AI use more dependable and easier to stand behind.',
  flow: ['Current practice', 'A small, well-scoped fix', 'A stronger control', 'Lower risk, more trust'],
  example: 'Teams that tackled this one step at a time saw steady, compounding improvement.',
};

export function getDeepNarrative(sectionKey: string): DeepNarrative {
  return N[sectionKey] ?? FALLBACK;
}
