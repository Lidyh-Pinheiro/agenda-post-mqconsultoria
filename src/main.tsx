
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root and render App component which contains the SettingsProvider
createRoot(document.getElementById("root")!).render(<App />);
