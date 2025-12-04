import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base to your repository name for GitHub Pages
  // If your repo is https://github.com/username/travelapp
  // then base should be '/travelapp/'
  base: '/travelapp/',
})
