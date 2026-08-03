import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { BoardThemeProvider } from './contexts/BoardThemeContext.tsx';
import { PipProvider } from './contexts/PipContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <BoardThemeProvider>
        <PipProvider>
          <App />
        </PipProvider>
      </BoardThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
