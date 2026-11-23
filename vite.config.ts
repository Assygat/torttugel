import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' — салыстырмалы жолдар. Сайт GitHub Pages-тегі кез келген
// репозиторий атымен (https://<user>.github.io/<repo>/) дұрыс ашылады.
export default defineConfig({
  base: './',
  plugins: [react()],
});
