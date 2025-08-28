import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Create root element
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

// Render the app directly (no dynamic import to prevent AuthContext recreation)
root.render(<App />);
