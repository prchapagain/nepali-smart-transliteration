import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nepali-smart-transliteration/', // required for GitHub Pages
})
