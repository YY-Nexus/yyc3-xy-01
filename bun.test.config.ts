import { defineConfig } from 'bun'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
    globals: true,
    tsconfig: './tsconfig.test.json',
    coverage: {
      reporter: ['text', 'html'],
      include: ['app/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}', 'lib/**/*.{js,jsx,ts,tsx}', 'hooks/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**'
      ]
    }
  }
})