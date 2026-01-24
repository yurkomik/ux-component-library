import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

export default mergeConfig(viteConfig, defineConfig({
  plugins: [
    storybookTest({
      configDir: '.storybook',
      // storybookScript: 'storybook', // Removing this to prevent conflicts in UI mode
    })
  ],
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        { browser: 'chromium' }
      ]
    },
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
}))
