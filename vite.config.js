import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')
  
  console.log('Loaded environment variables:', Object.keys(env).filter(key => key.startsWith('VITE_')))
  
  return {
    plugins: [tailwindcss(), react()],
    // Pass env variables to the client
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    },
    server: {
      host: '0.0.0.0', // Listen on all network interfaces
      port: 5173, // Default Vite port
    }
  }
})
