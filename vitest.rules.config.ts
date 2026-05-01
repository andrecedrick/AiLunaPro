import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/firestore.rules.test.ts'],
    // No setupFiles — avoid firebase mocks from tests/setup.ts
    testTimeout: 30000,
  },
});
