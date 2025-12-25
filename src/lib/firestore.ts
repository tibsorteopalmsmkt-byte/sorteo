import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, authenticateAnonymously, isAuthenticated } from "./firebase";

export interface SorteoData {
  winners: Array<{
    username: string;
    code: string;
  }>;
  alternates: Array<{
    username: string;
    code: string;
  }>;
  totalParticipants: number;
  createdAt: Timestamp;
}

/**
 * Guarda los ganadores y suplentes en Firestore
 * @param winners Array de ganadores
 * @param alternates Array de suplentes
 * @param totalParticipants Número total de participantes únicos
 * @returns ID del documento creado
 */
export async function saveSorteoResults(
  winners: Array<{ username: string; code: string }>,
  alternates: Array<{ username: string; code: string }>,
  totalParticipants: number
): Promise<string> {
  // Verificar que la base de datos esté inicializada
  if (!db) {
    const error = new Error("Firestore no está inicializado. Verifica la configuración de Firebase.");
    throw error;
  }

  // Autenticar si no está autenticado (requerido para reglas estrictas)
  if (!isAuthenticated()) {
    await authenticateAnonymously();
  }

  try {
    const sorteoData: SorteoData = {
      winners,
      alternates,
      totalParticipants,
      createdAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(collection(db, "sorteos"), sorteoData);
    return docRef.id;
  } catch (error) {
    console.error("Error al guardar sorteo en Firestore:", error);
    throw error;
  }
}

