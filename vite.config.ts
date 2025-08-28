import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://beta-api.bluelionclaims.co.uk',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    define: {
      // Set environment variables for the app
      'import.meta.env.VITE_IS_PRODUCTION': JSON.stringify(isProduction),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        isProduction 
          ? 'https://api.bluelionclaims.co.uk'
          : 'https://beta-api.bluelionclaims.co.uk'
      )
    }
  }
})
