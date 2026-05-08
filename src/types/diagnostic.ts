/**
 * Diagnostic Express types — Phase K1A.
 */

export type Bucket = 'low' | 'medium' | 'high';

export interface DiagnosticResult {
  id:                  string;
  score:               number;       // 0–100
  bucket:              Bucket;
  recommendedAgentIds: string[];     // 3 agent slugs
}
