import { createRoot } from 'react-dom/client'
import './index.css'

// Create root element
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Show initial loader while we check auth
root.render(
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <div className="text-lg font-medium text-gray-700">Loading BlueLion Claims Portal...</div>
    </div>
  </div>
);

// Import and render the actual app
import('./App.tsx').then(({ default: App }) => {
  root.render(<App />);
});
