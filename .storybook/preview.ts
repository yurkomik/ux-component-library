import type { Preview } from '@storybook/react-vite'
import { createElement, useEffect } from 'react'
import '../src/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  globalTypes: {
    darkMode: {
      defaultValue: false,
      toolbar: {
        title: 'Dark Mode',
        icon: 'moon',
        items: [
          { value: false, icon: 'sun', title: 'Light' },
          { value: true, icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = context.globals.darkMode

      // Toggle class on html and body for Tailwind dark mode
      useEffect(() => {
        const root = document.documentElement
        const body = document.body

        if (isDark) {
          root.classList.add('dark')
          body.classList.add('dark')
        } else {
          root.classList.remove('dark')
          body.classList.remove('dark')
        }
      }, [isDark])

      // Simple wrapper - CSS variables handle theming
      return createElement(Story)
    },
  ],
}

export default preview
