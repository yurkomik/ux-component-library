import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    'storybook-addon-pseudo-states',
  ],
  framework: '@storybook/react-vite',
}

export default config
