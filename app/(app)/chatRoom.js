// Importações de componentes essenciais do React Native para construção de interfaces e interação do usuário
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native'
// Importa o React e alguns hooks: useEffect, useRef, useState para gerenciar o estado e os ciclos de vida dos componentes
import React, { useEffect, useRef, useState } from 'react'
// Importa hooks do 'expo-router' para pegar parâmetros de navegação e manipular rotas
import { useLocalSearchParams, useRouter } from 'expo-router'
// Importa o componente StatusBar para controlar a barra de status do dispositivo
import { StatusBar } from 'expo-status-bar';
// Importa componentes personalizados usados na tela de chat
import ChatRoomHeader from '../../components/ChatRoomHeader'; // Cabeçalho personalizado da sala de chat
import MessageList from '../../components/MessageList'; // Componente para listar mensagens
// Importa utilitários para tornar o layout responsivo, adaptando-se a diferentes tamanhos de tela
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
// Importa o ícone 'send' da biblioteca Feather Icons, utilizado no botão de envio de mensagem
import { Feather } from '@expo/vector-icons';
// Componente que ajusta a interface do teclado
import CustomKeyboardView from '../../components/CustomKeyboardView';
// Importa o contexto de autenticação para acessar informações do usuário logado
import { useAuth } from '../../context/authContext';
// Importa uma função utilitária que retorna um ID de sala único com base nos usuários envolvidos
import { getRoomId } from '../../utils/common';
// Importações do Firebase Firestore para lidar com banco de dados e manipular documentos e coleções
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
// Importa a configuração do Firebase para acessar o banco de dados Firestore
import { db } from '../../firebaseConfig';

export default function ChatRoom() {
    // Pega os parâmetros de navegação, neste caso, o usuário com quem o chat está acontecendo
    const item = useLocalSearchParams(); // segundo usuário
    // Acessa o usuário logado através do contexto de autenticação
    const {user} = useAuth(); // usuário logado
    const router = useRouter(); // Hook que permite navegação programática
    // Estado para armazenar as mensagens do chat
    const [messages, setMessages] = useState([]);
    // Referências para armazenar o texto da mensagem, o campo de input, e a lista de mensagens
    const textRef = useRef(''); // Armazena o conteúdo digitado pelo usuário
    const inputRef = useRef(null); // Referência para o campo de input (caixa de texto)
    const scrollViewRef = useRef(null); // Referência para a ScrollView (lista de mensagens)

    // useEffect que é executado ao carregar o componente, inicializando o chat e configurando o listener para novas mensagens
    useEffect(()=>{
        createRoomIfNotExists(); // Cria a sala de chat se ela não existir

        // Gera um ID único para a sala com base no ID dos dois usuários
        let roomId = getRoomId(user?.userId, item?.userId);
        // Refere-se ao documento da sala no Firestore
        const docRef = doc(db, "rooms", roomId);
        // Refere-se à coleção de mensagens dentro dessa sala
        const messagesRef = collection(docRef, "messages");
        // Cria uma query para ordenar as mensagens por data de criação (ascendente)
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        // Listener em tempo real para atualizações na coleção de mensagens
        let unsub = onSnapshot(q, (snapshot)=>{
            // Mapeia os documentos retornados para extrair os dados de cada mensagem
            let allMessages = snapshot.docs.map(doc=>{
                return doc.data();
            });
            // Atualiza o estado com as novas mensagens
            setMessages([...allMessages]);
        });

        // Adiciona um listener para eventos de exibição do teclado, e atualiza a lista de mensagens
        const KeyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow', updateScrollView
        )

        // Cleanup: remove o listener de mensagens e do teclado ao desmontar o componente
        return ()=>{
            unsub();
            KeyboardDidShowListener.remove();
        }

    },[]);

    // useEffect que é executado sempre que há uma mudança na lista de mensagens para atualizar a ScrollView
    useEffect(()=>{
        updateScrollView();
    },[messages])

    // Função que rola a lista de mensagens para o final quando uma nova mensagem é adicionada ou o teclado aparece
    const updateScrollView = ()=>{
        setTimeout(()=>{
            scrollViewRef?.current?.scrollToEnd({animated: true}) // Rola a lista de mensagens até o fim
        },100)
    }

    // Função que cria a sala de chat no Firestore se ela ainda não existir
    const createRoomIfNotExists = async ()=>{
        // Gera um ID único para a sala com base nos dois usuários
        let roomId = getRoomId(user?.userId, item?.userId);
        // Cria um documento na coleção "rooms" com o ID da sala e a data de criação
        await setDoc(doc(db, "rooms", roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date()) 
        });
    }

    // Função para enviar uma nova mensagem
    const hanldeSendMessage = async ()=>{
        // Pega o conteúdo da mensagem e remove espaços desnecessários
        let message = textRef.current.trim();
        if(!message) return; // Se a mensagem estiver vazia, a função é encerrada
        try{
            // Gera o ID da sala
            let roomId = getRoomId(user?.userId, item?.userId);
            // Refere-se ao documento da sala no Firestore
            const docRef = doc(db, 'rooms', roomId);
            // Refere-se à coleção de mensagens dessa sala
            const messagesRef = collection(docRef, "messages");
            // Limpa o campo de texto
            textRef.current = "";
            if(inputRef) inputRef?.current?.clear();
            // Adiciona a nova mensagem à coleção de mensagens no Firestore
            const newDoc = await addDoc(messagesRef, {
                userId: user?.userId, // ID do usuário que enviou a mensagem
                text: message, // Conteúdo da mensagem
                profileUrl: user?.profileUrl, // URL da foto de perfil do usuário
                senderName: user?.username, // Nome do remetente
                createdAt: Timestamp.fromDate(new Date()) // Data de envio da mensagem
            });

            // console.log('new message id: ', newDoc.id); // (Comentado) Log para verificar o ID da nova mensagem
        }catch(err){
            // Mostra um alerta caso ocorra algum erro ao enviar a mensagem
            Alert.alert('Message', err.message);
        }
    }

    return (
    // CustomKeyboardView é um componente que ajusta a interface quando o teclado é mostrado
    <CustomKeyboardView inChat={true}>
        {/* View principal que define a estrutura visual da tela de chat */}
        <View className="flex-1 bg-white">
            {/* Configura a barra de status com um tema escuro */}
            <StatusBar style="dark" />
            {/* Componente de cabeçalho personalizado da sala de chat */}
            <ChatRoomHeader user={item} router={router} />
            <View className="h-3 border-b border-neutral-300" /> {/* Linha separadora */}
            <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
            <View className="flex-1">
                {/* Componente que renderiza a lista de mensagens */}
                <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
            </View>
            <View style={{marginBottom: hp(2.7)}} className="pt-2">
                {/* Caixa de entrada de mensagem */}
                <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
                    {/* Campo de input para digitar mensagens */}
                    <TextInput 
                        ref={inputRef}
                        onChangeText={value=> textRef.current = value} // Atualiza o conteúdo da mensagem conforme o usuário digita
                        placeholder='Type message...' // Placeholder para o campo de texto
                        placeholderTextColor={'gray'}
                        style={{fontSize: hp(2)}}
                        className="flex-1 mr-2"
                    />
                    {/* Botão para enviar a mensagem */}
                    <TouchableOpacity onPress={hanldeSendMessage} className="bg-neutral-200 p-2 mr-[1px] rounded-full">
                        {/* Ícone de envio da mensagem */}
                        <Feather name="send" size={hp(2.7)} color="#737373" />
                    </TouchableOpacity>
                </View>
            </View>
            </View>
        </View>
    </CustomKeyboardView>
    )
}
