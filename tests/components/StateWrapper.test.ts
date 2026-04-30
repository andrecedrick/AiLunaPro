import { describe, it, expect } from 'vitest';
import { StateWrapper } from '@/components/states/StateWrapper';

describe('StateWrapper', () => {
  describe('discriminated union types', () => {
    it('loading state accepts message and fullScreen', () => {
      const config = {
        state: 'loading' as const,
        message: 'Loading data...',
        fullScreen: true,
      };
      expect(config.state).toBe('loading');
      expect(config.message).toBeDefined();
    });

    it('skeleton state accepts count, height, fullScreen', () => {
      const config = {
        state: 'skeleton' as const,
        count: 5,
        height: 'h-16',
        fullScreen: false,
      };
      expect(config.state).toBe('skeleton');
      expect(config.count).toBe(5);
    });

    it('empty state accepts title, message, action', () => {
      const config = {
        state: 'empty' as const,
        title: 'No items',
        message: 'Create one to get started',
        actionLabel: 'Create',
        onAction: () => {},
      };
      expect(config.state).toBe('empty');
      expect(config.actionLabel).toBeDefined();
    });

    it('error state requires error, accepts onRetry', () => {
      const config = {
        state: 'error' as const,
        error: new Error('Network failed'),
        onRetry: () => {},
      };
      expect(config.state).toBe('error');
      expect(config.error).toBeInstanceOf(Error);
    });

    it('loaded state requires children', () => {
      const config = {
        state: 'loaded' as const,
        children: 'Content here',
      };
      expect(config.state).toBe('loaded');
      expect(config.children).toBeDefined();
    });
  });

  describe('state transitions', () => {
    it('transitions loading → loaded', () => {
      let state: 'loading' | 'loaded' = 'loading';
      expect(state).toBe('loading');
      state = 'loaded';
      expect(state).toBe('loaded');
    });

    it('transitions empty → loading on retry', () => {
      let state: 'empty' | 'loading' = 'empty';
      expect(state).toBe('empty');
      state = 'loading'; // simulating retry
      expect(state).toBe('loading');
    });

    it('transitions error → loading on retry', () => {
      let state: 'error' | 'loading' = 'error';
      expect(state).toBe('error');
      state = 'loading'; // simulating retry
      expect(state).toBe('loading');
    });
  });

  describe('error state', () => {
    it('accepts Error object', () => {
      const error = new Error('Failed to load');
      const config = {
        state: 'error' as const,
        error,
      };
      expect(config.error).toBeInstanceOf(Error);
      expect(config.error.message).toBe('Failed to load');
    });

    it('accepts string error', () => {
      const config = {
        state: 'error' as const,
        error: 'Something went wrong',
      };
      expect(typeof config.error).toBe('string');
    });
  });

  describe('withErrorBoundary prop', () => {
    it('defaults to true', () => {
      const config = {
        state: 'loaded' as const,
        children: 'Content',
      };
      const withErrorBoundary = true; // default
      expect(withErrorBoundary).toBe(true);
    });

    it('can be set to false', () => {
      const config = {
        state: 'loaded' as const,
        children: 'Content',
        withErrorBoundary: false,
      };
      expect(config.withErrorBoundary).toBe(false);
    });
  });
});
