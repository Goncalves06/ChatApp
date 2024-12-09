import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence } from "firebase/auth"; // Usando o getAuth para autenticação
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Para o Firebase Storage

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAsbJDuFDSFYROQJY2Kazbek-yxUmaQ2YQ",
  authDomain: "chat-616e6.firebaseapp.com",
  projectId: "chat-616e6",
  storageBucket: "chat-616e6.firebasestorage.app",
  messagingSenderId: "59053790397",
  appId: "1:59053790397:web:36b1a523e090420b1a93d4"
};

// Inicialize o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Firebase Auth com persistência
export const auth = getAuth(app);

export const storage = getStorage(app); // Inicializando o Storage
export const db = getFirestore(app);

// Referências para usuários e salas
export const usersRef = collection(db, "users");
export const roomRef = collection(db, "rooms");
