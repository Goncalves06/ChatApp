// Importa componentes essenciais do React Native para estruturar a interface de usuário e interação
import { View, Text, Pressable, ActivityIndicator } from 'react-native'
// Importa React e hooks para gerenciar estados e efeitos colaterais
import React, { useEffect, useState } from 'react'
// Importa o contexto de autenticação para acessar o estado de login do usuário
import { useAuth } from '../../context/authContext'
// Importa o componente StatusBar para controlar a aparência da barra de status no dispositivo
import { StatusBar } from 'expo-status-bar';
// Importa funções para tornar o layout responsivo em diferentes tamanhos de tela
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
// Importa um componente personalizado que renderiza a lista de chats disponíveis
import ChatList from '../../components/ChatList';
// Importa um componente de carregamento personalizado (não utilizado, mas comentado no código)
import Loading from '../../components/Loading';
// Importa funções do Firebase Firestore para buscar documentos e realizar consultas
import { getDocs, query, where } from 'firebase/firestore';
// Referência à coleção de usuários no Firestore configurada no arquivo firebaseConfig
import { usersRef } from '../../firebaseConfig';

export default function Home() {
    // Desestrutura funções e dados do contexto de autenticação
    // `logout`: Função para deslogar o usuário
    // `user`: Dados do usuário atualmente logado
    const {logout, user} = useAuth();
    
    // Estado local para armazenar a lista de usuários que serão exibidos na lista de chats
    const [users, setUsers] = useState([]);

    // Hook useEffect que é executado quando o componente é montado
    // Verifica se o ID do usuário está disponível e então chama a função para buscar os outros usuários
    useEffect(()=>{
        if(user?.uid)
            getUsers();
    },[])

    // Função assíncrona para buscar os outros usuários no Firestore, exceto o usuário logado
    const getUsers = async ()=>{
        // Cria uma query para buscar todos os usuários cujo 'userId' seja diferente do ID do usuário logado
        const q = query(usersRef, where('userId', '!=', user?.uid));

        // Executa a query no Firestore e obtém os documentos correspondentes
        const querySnapshot = await getDocs(q);
        // Array temporário para armazenar os dados dos usuários
        let data = [];
        // Itera sobre cada documento retornado e extrai os dados
        querySnapshot.forEach(doc=>{
            data.push({...doc.data()});
        });

        // Atualiza o estado com a lista de usuários obtida
        setUsers(data);
    }

  return (
    // View principal que define a estrutura visual da tela Home
    <View className="flex-1 bg-white">
      {/* Configura a barra de status com um tema claro */}
      <StatusBar style="light" />

      {
        // Se a lista de usuários não estiver vazia, renderiza o componente ChatList com a lista de usuários
        users.length>0? (
            <ChatList currentUser={user} users={users} />
        ) : (
            // Caso contrário, exibe um indicador de carregamento enquanto a lista de usuários é buscada
            <View className="flex items-center" style={{top: hp(30)}}>
                {/* Exibe um spinner de carregamento (ActivityIndicator) */}
                <ActivityIndicator size="large" />
                {/* <Loading size={hp(10)} /> */}
                {/* Comentado: Loading é um componente customizado que poderia ser usado para exibir animação de carregamento */}
            </View>
        )
      }
      
    </View>
  )
}