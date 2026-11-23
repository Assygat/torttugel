import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Nunito — қазақ кириллицасын (ә, ғ, қ, ң, ө, ұ, ү, һ, і) толық қолдайтын қаріп.
// Жобаның ішіне жинақталады, сондықтан интернетсіз де дұрыс көрінеді.
import '@fontsource-variable/nunito';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
