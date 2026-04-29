import { describe, it, expect, beforeEach } from 'vitest';
import { computeAuditResult } from '@/utils/scoring';
import type { AuditAnswers } from '@/types/api';

describe('Audit Scoring - computeAuditResult', () => {
  let answers: AuditAnswers;

  beforeEach(() => {
    answers = {
      q1: 'yes',
      q2: 'yes',
      q3: 'yes',
      q4: 'yes',
      q5: 'yes',
    };
  });

  describe('Score Calculation', () => {
    it('returns 100% for all yes answers', () => {
      const result = computeAuditResult(answers);
      expect(result.score).toBe(100);
    });

    it('returns 0% for all no answers', () => {
      const testAnswers: AuditAnswers = {
        q1: 'no',
        q2: 'no',
        q3: 'no',
        q4: 'no',
        q5: 'no',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.score).toBe(0);
    });

    it('calculates mixed scores correctly', () => {
      const testAnswers: AuditAnswers = {
        q1: 'yes',
        q2: 'yes',
        q3: 'no',
        q4: 'no',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.score).toBe(60);
    });

    it('treats partial answers as no', () => {
      const testAnswers: AuditAnswers = {
        q1: 'yes',
        q2: 'partial',
        q3: 'yes',
        q4: 'partial',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.score).toBe(60);
    });
  });

  describe('Risk Assessment', () => {
    it('returns critical risk for 0-20% score', () => {
      const testAnswers: AuditAnswers = {
        q1: 'no',
        q2: 'no',
        q3: 'no',
        q4: 'no',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.riskLevel).toBe('critical');
    });

    it('returns high risk for 21-40% score', () => {
      const testAnswers: AuditAnswers = {
        q1: 'no',
        q2: 'no',
        q3: 'no',
        q4: 'yes',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.riskLevel).toBe('high');
    });

    it('returns medium risk for 41-60% score', () => {
      const testAnswers: AuditAnswers = {
        q1: 'no',
        q2: 'yes',
        q3: 'yes',
        q4: 'yes',
        q5: 'no',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.riskLevel).toBe('medium');
    });

    it('returns low risk for 61-80% score', () => {
      const testAnswers: AuditAnswers = {
        q1: 'yes',
        q2: 'yes',
        q3: 'yes',
        q4: 'no',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.riskLevel).toBe('low');
    });

    it('returns minimal risk for 81-100% score', () => {
      const testAnswers: AuditAnswers = {
        q1: 'yes',
        q2: 'yes',
        q3: 'yes',
        q4: 'yes',
        q5: 'yes',
      };
      const result = computeAuditResult(testAnswers);
      expect(result.riskLevel).toBe('minimal');
    });
  });

  describe('Result Object Structure', () => {
    it('returns object with score and riskLevel', () => {
      const result = computeAuditResult(answers);
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('riskLevel');
      expect(typeof result.score).toBe('number');
      expect(typeof result.riskLevel).toBe('string');
    });

    it('score is within valid range', () => {
      const result = computeAuditResult(answers);
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('riskLevel is one of valid levels', () => {
      const result = computeAuditResult(answers);
      const validLevels = ['critical', 'high', 'medium', 'low', 'minimal'];
      expect(validLevels).toContain(result.riskLevel);
    });
  });
});
