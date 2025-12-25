// Archivo de configuración de Firebase
// Este archivo se puede usar como alternativa si las variables de entorno no se cargan

// Intentar leer desde variables de entorno primero
let firebaseConfigFromEnv = {
  apiKey: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_API_KEY || "",
  authDomain: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_AUTH_DOMAIN || "",
  projectId: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_PROJECT_ID || "",
  storageBucket: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: typeof process !== 'undefined' && process.env?.GATSBY_FIREBASE_APP_ID || "",
};

// Si las variables de entorno no están disponibles, usar valores por defecto
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// O mejor aún, asegúrate de que las variables de entorno se carguen correctamente
export const getFirebaseConfig = () => {
  // En el navegador, process.env puede no estar disponible
  // Intentar leer desde window.__ENV__ si está disponible (configurado en gatsby-ssr o gatsby-browser)
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
    return (window as any).__FIREBASE_CONFIG__;
  }

  return firebaseConfigFromEnv;
};

