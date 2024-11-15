/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    include: ['tests/api/**/*.test.ts'],
    exclude: ['tests/api/**/_*.test.ts'],
    globals: true
  }
})
