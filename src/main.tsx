import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Create root element and render app directly
const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);

root.render(<App />);
