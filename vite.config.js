import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// Definicja konfiguracji Vite
export default defineConfig({
  plugins: [vue()], // Użycie pluginu Vue

  // Konfiguracja aliasów
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias '@' wskazujący na katalog 'src'
    },
  },

  // Opcje budowania
  build: {
    sourcemap: true, // Ustawienie sourcemap dla debugowania
    rollupOptions: {
      // Wyklucz moduły Node.js niekompatybilne z przeglądarką
      external: ['fs', 'path', 'net', 'os', 'crypto'],
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Obsługa mieszanych modułów ESM i CommonJS
    },
  },

  // Ustawienia serwera developerskiego
  server: {
    port: 3000, // Port dla dev server
    strictPort: true, // Jeśli port jest zajęty, nie próbuj innego
    watch: {
      usePolling: true, // Użycie polling, szczególnie przydatne na systemach z problemami FS
      interval: 1000, // Odpytuj co sekundę
    },
  },

  // Optymalizacja dla zależności
  optimizeDeps: {
    include: ['vue', 'primevue', 'axios', 'vue-router'], // Pre-bundling określonych paczek
  },

  // Rozszerzenie limitu pamięci dla procesu budowania
  esbuild: {
    target: 'esnext', // Cel kompilacji
  },
});
