import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase

// Intentar obtener las variables de múltiples formas (para compatibilidad)
const getEnvVar = (key: string): string => {
  // Primero intentar desde window.__FIREBASE_CONFIG__ (inyectado en gatsby-ssr.ts)
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_CONFIG__) {
    const config = (window as any).__FIREBASE_CONFIG__;
    const keyMap: Record<string, keyof typeof config> = {
      'GATSBY_FIREBASE_API_KEY': 'apiKey',
      'GATSBY_FIREBASE_AUTH_DOMAIN': 'authDomain',
      'GATSBY_FIREBASE_PROJECT_ID': 'projectId',
      'GATSBY_FIREBASE_STORAGE_BUCKET': 'storageBucket',
      'GATSBY_FIREBASE_MESSAGING_SENDER_ID': 'messagingSenderId',
      'GATSBY_FIREBASE_APP_ID': 'appId',
    };
    const mappedKey = keyMap[key];
    if (mappedKey && config[mappedKey]) {
      return config[mappedKey];
    }
  }
  
  // Luego intentar desde process.env (Gatsby expone variables GATSBY_*)
  const value = process.env[key] || 
                (typeof window !== 'undefined' && (window as any).__ENV__?.[key]) ||
                "";
  return value;
};

const firebaseConfig = {
  apiKey: getEnvVar("GATSBY_FIREBASE_API_KEY"),
  authDomain: getEnvVar("GATSBY_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("GATSBY_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("GATSBY_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("GATSBY_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("GATSBY_FIREBASE_APP_ID"),
};

// Inicializar Firebase solo si no está ya inicializado
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Inicializar Firestore
export const db: Firestore = getFirestore(app);

// Inicializar Auth
export const auth: Auth = getAuth(app);

/**
 * Autentica al usuario de forma anónima
 * Esto permite que las reglas de Firestore verifiquen que hay un usuario autenticado
 */
export async function authenticateAnonymously(): Promise<User> {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Error en autenticación anónima:", error);
    throw error;
  }
}

/**
 * Obtiene el usuario actual autenticado
 */
export function getCurrentUser(): User | null {
  return auth.currentUser;
}

/**
 * Verifica si hay un usuario autenticado
 */
export function isAuthenticated(): boolean {
  return auth.currentUser !== null;
}

/**
 * Escucha cambios en el estado de autenticación
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export default app;

