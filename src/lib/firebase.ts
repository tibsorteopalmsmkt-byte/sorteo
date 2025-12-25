import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from "firebase/auth";

// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase

// Variables para almacenar las instancias (solo se inicializan en el cliente)
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

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

/**
 * Inicializa Firebase solo en el cliente (navegador)
 * Esto evita errores durante el build de Gatsby (SSR)
 */
function initializeFirebase(): void {
  // Solo inicializar en el cliente
  if (typeof window === 'undefined') {
    return;
  }

  // Si ya está inicializado, no hacer nada
  if (app !== null) {
    return;
  }

  const firebaseConfig = {
    apiKey: getEnvVar("GATSBY_FIREBASE_API_KEY"),
    authDomain: getEnvVar("GATSBY_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnvVar("GATSBY_FIREBASE_PROJECT_ID"),
    storageBucket: getEnvVar("GATSBY_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnvVar("GATSBY_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnvVar("GATSBY_FIREBASE_APP_ID"),
  };

  // Inicializar Firebase solo si no está ya inicializado
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  // Inicializar Firestore
  dbInstance = getFirestore(app);

  // Inicializar Auth
  authInstance = getAuth(app);
}

// Función para obtener la instancia de Firestore (inicializa si es necesario)
export function getDb(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error("Firestore solo puede usarse en el cliente");
  }
  if (dbInstance === null) {
    initializeFirebase();
  }
  if (dbInstance === null) {
    throw new Error("No se pudo inicializar Firestore");
  }
  return dbInstance;
}

// Función para obtener la instancia de Auth (inicializa si es necesario)
export function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error("Auth solo puede usarse en el cliente");
  }
  if (authInstance === null) {
    initializeFirebase();
  }
  if (authInstance === null) {
    throw new Error("No se pudo inicializar Auth");
  }
  return authInstance;
}

// Exportar db y auth como getters lazy
// Solo se inicializan cuando se accede a ellos (en el cliente, no durante el build)
// Usamos una función wrapper que se ejecuta solo cuando se llama
function lazyDb(): Firestore {
  return getDb();
}

function lazyAuth(): Auth {
  return getAuthInstance();
}

// Para compatibilidad, exportamos como propiedades que se evalúan lazy
// Nota: Estas se inicializarán solo cuando se usen en el cliente
export const db = (() => {
  if (typeof window !== 'undefined') {
    return getDb();
  }
  // En el servidor, retornar un objeto proxy que lanza error si se usa
  return new Proxy({} as Firestore, {
    get: () => {
      throw new Error("Firebase solo puede usarse en el cliente. Asegúrate de que el código que usa Firebase solo se ejecute en el navegador.");
    }
  });
})() as Firestore;

export const auth = (() => {
  if (typeof window !== 'undefined') {
    return getAuthInstance();
  }
  // En el servidor, retornar un objeto proxy que lanza error si se usa
  return new Proxy({} as Auth, {
    get: () => {
      throw new Error("Firebase solo puede usarse en el cliente. Asegúrate de que el código que usa Firebase solo se ejecute en el navegador.");
    }
  });
})() as Auth;

/**
 * Autentica al usuario de forma anónima
 * Esto permite que las reglas de Firestore verifiquen que hay un usuario autenticado
 */
export async function authenticateAnonymously(): Promise<User> {
  try {
    const authInstance = getAuthInstance();
    const userCredential = await signInAnonymously(authInstance);
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
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return getAuthInstance().currentUser;
  } catch {
    return null;
  }
}

/**
 * Verifica si hay un usuario autenticado
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return getAuthInstance().currentUser !== null;
  } catch {
    return false;
  }
}

/**
 * Escucha cambios en el estado de autenticación
 */
export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op en el servidor
  }
  return onAuthStateChanged(getAuthInstance(), callback);
}

export default app;

