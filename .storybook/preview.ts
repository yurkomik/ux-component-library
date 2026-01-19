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
    // Using 'padded' instead of 'centered' to prevent vertical jumping
    // We add horizontal centering via decorator below
    layout: 'padded',
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

      // Wrapper provides:
      // - Horizontal centering (items-center on flex container)
      // - Top anchoring (items-start would anchor to left, we use flex-col + items-center)
      // - Padding for breathing room
      // This prevents vertical jumping when component height changes
      return createElement(
        'div',
        {
          className: 'flex flex-col items-center w-full min-h-full pt-8 pb-16',
        },
        createElement(Story)
      )
    },
  ],
}

export default preview
