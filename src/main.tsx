import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { Provider } from 'react-redux'
import { store } from './services/redux/store'
import { PrimeReactProvider } from "primereact/api";
import "primereact/resources/themes/lara-dark-blue/theme.css";
import "primereact/resources/primereact.min.css";
import { AlertProvider } from "./components/AlertSystem.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AlertProvider>
        <PrimeReactProvider>
          <App />
        </PrimeReactProvider>
      </AlertProvider>
    </Provider>
  </StrictMode>,
)
