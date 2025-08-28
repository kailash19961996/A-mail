import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    define: {
      // Set environment variables for the app
      'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(isProduction)
    }
  }
})
