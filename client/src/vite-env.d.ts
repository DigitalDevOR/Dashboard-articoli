/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // altre variabili qui se necessario
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
