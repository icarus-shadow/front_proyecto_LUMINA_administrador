import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PrimeReactProvider } from "@primereact/core";
import Aura from '@primeuix/themes/aura';

const theme = {
    preset: Aura
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <PrimeReactProvider  theme={theme}>
        <App />
      </PrimeReactProvider>
  </StrictMode>,
)
