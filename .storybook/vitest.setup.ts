import { beforeAll } from 'vitest'
import { setProjectAnnotations } from '@storybook/react'
import * as projectAnnotations from './preview'

// This enables your Storybook decorators and other global configuration 
// to be applied when running stories as tests
const annotations = setProjectAnnotations([projectAnnotations])

// Run Storybook's beforeAll hook
beforeAll(annotations.beforeAll)
