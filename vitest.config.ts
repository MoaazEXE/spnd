import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    include: ['src/core/**/*.test.ts', 'src/lib/**/*.test.ts', 'src/data/**/*.test.ts'],
  },
})
