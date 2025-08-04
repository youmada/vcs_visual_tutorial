/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
    base: "/vcs_visual_tutorial/",
    test: {
        globals: true,
        environment: 'jsdom', // DOMが必要なら
        include: ['src/**/*.test.ts'],
        coverage: {
            reporter: ['text', 'html'],
        },
    },
})