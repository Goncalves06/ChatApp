import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";  // Import AsyncStorage

// Criação do contexto de autenticação
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para o usuário autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticação
  const [loading, setLoading] = useState(true); // Estado de carregamento

  // Verifica mudanças no estado de autenticação
  useEffect(() => {
    // Limpar AsyncStorage sempre que o app iniciar
    AsyncStorage.clear();

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        updateUserData(currentUser.uid);
        setIsAuthenticated(true);
        setUser(currentUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false); // Carregamento concluído
    });

    return () => unsub(); // Remove o observador ao desmontar
  }, []);

  // Atualiza os dados do usuário com informações do Firestore
  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUser((prevUser) => ({
          ...prevUser,
          username: data.username,
          profileUrl: data.profileUrl,
          userId: data.userId
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar dados do usuário no Firestore:", error);
    }
  };

  // Função de login
  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Limpar o AsyncStorage após login bem-sucedido
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      const msg = parseFirebaseError(error);
      return { success: false, msg };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      await signOut(auth);
      // Limpar o AsyncStorage após logout
      await AsyncStorage.clear();
      return { success: true };
    } catch (error) {
      return { success: false, msg: error.message, error };
    }
  };

  // Função de registro
  const register = async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      const { user: newUser } = response;

      await setDoc(doc(db, "users", newUser.uid), {
        username,
        profileUrl,
        userId: newUser.uid
      });

      return { success: true, data: newUser };
    } catch (error) {
      const msg = parseFirebaseError(error);
      return { success: false, msg };
    }
  };

  // Função utilitária para interpretar erros do Firebase
  const parseFirebaseError = (error) => {
    let msg = error.message;
    if (msg.includes("(auth/invalid-email)")) msg = "E-mail inválido";
    if (msg.includes("(auth/email-already-in-use)")) msg = "Esse e-mail já está em uso";
    if (msg.includes("(auth/wrong-password)")) msg = "Senha incorreta";
    if (msg.includes("(auth/user-not-found)")) msg = "Usuário não encontrado";
    return msg;
  };

  // Provedor do contexto
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para acessar o contexto de autenticação
export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContextProvider");
  }

  return value;
};
