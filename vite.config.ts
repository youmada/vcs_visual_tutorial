/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom', // DOMが必要なら
        include: ['src/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'html'],
        },
    },
})