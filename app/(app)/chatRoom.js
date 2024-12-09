import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Keyboard } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageList from '../../components/MessageList';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Feather, MaterialIcons } from 'react-native-vector-icons';
import CustomKeyboardView from '../../components/CustomKeyboardView';
import { useAuth } from '../../context/authContext';
import { getRoomId } from '../../utils/common';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, getDocs } from 'firebase/firestore';
import { db, storage } from '../../firebaseConfig';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ChatRoom() {
    const item = useLocalSearchParams();
    const { user } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const textRef = useRef('');
    const inputRef = useRef(null);
    const scrollViewRef = useRef(null);
    const typingTimeout = useRef(null); // Temporizador para digitação

    useEffect(() => {
        createRoomIfNotExists();

        let roomId = getRoomId(user?.userId, item?.userId);
        const docRef = doc(db, "rooms", roomId);
        const messagesRef = collection(docRef, "messages");
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubMessages = onSnapshot(q, (snapshot) => {
            const allMessages = snapshot.docs.map(doc => doc.data());
            setMessages([...allMessages]);
        });

        // Monitorar estado de digitação do outro usuário
        const typingRef = doc(db, 'rooms', roomId, 'typing', item?.userId);
        const unsubTyping = onSnapshot(typingRef, (docSnapshot) => {
            if (docSnapshot.exists()) {
                setIsOtherTyping(docSnapshot.data().isTyping);
            }
        });

        const KeyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            updateScrollView
        );

        return () => {
            unsubMessages();
            unsubTyping();
            KeyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        updateScrollView();
    }, [messages]);

    const updateScrollView = () => {
        setTimeout(() => {
            scrollViewRef?.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const createRoomIfNotExists = async () => {
        const roomId = getRoomId(user?.userId, item?.userId);
        await setDoc(doc(db, "rooms", roomId), {
            roomId,
            createdAt: Timestamp.fromDate(new Date())
        });
    };

    const handleTyping = () => {
        const roomId = getRoomId(user?.userId, item?.userId);

        // Atualiza o estado para "digitando"
        setDoc(doc(db, 'rooms', roomId, 'typing', user?.userId), {
            isTyping: true
        });

        // Reseta o temporizador ao digitar novamente
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        // Após 2 segundos sem digitar, atualiza para "não digitando"
        typingTimeout.current = setTimeout(() => {
            setDoc(doc(db, 'rooms', roomId, 'typing', user?.userId), {
                isTyping: false
            });
        }, 2000); // 2 segundos
    };

    const hanldeSendMessage = async (text, imageUrl = null) => {
        if (!text.trim() && !imageUrl) {
            Alert.alert('Erro', 'A mensagem não pode estar vazia.');
            return;
        }

        try {
            const roomId = getRoomId(user?.userId, item?.userId);
            const docRef = doc(db, 'rooms', roomId);
            const messagesRef = collection(docRef, "messages");

            textRef.current = '';
            if (inputRef) inputRef?.current?.clear();

            await addDoc(messagesRef, {
                userId: user?.userId,
                text: text || '',
                imageUrl,
                senderName: user?.username,
                createdAt: Timestamp.fromDate(new Date())
            });
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    const handlePickImage = async (source) => {
        try {
            const result = source === 'camera'
                ? await launchCameraAsync({ mediaTypes: MediaTypeOptions.Images })
                : await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images });

            if (!result.canceled) {
                const { uri } = result.assets[0];
                const response = await fetch(uri);
                const blob = await response.blob();
                const storageRef = ref(storage, `images/${Date.now()}`);
                await uploadBytes(storageRef, blob);
                const imageUrl = await getDownloadURL(storageRef);
                await hanldeSendMessage('', imageUrl); // Envia apenas a imagem
            }
        } catch (err) {
            Alert.alert('Error', err.message);
        }
    };

    return (
        <CustomKeyboardView inChat={true}>
            <View className="flex-1 bg-white">
                <StatusBar style="dark" />
                <ChatRoomHeader user={item} router={router} />
                <View className="h-3 border-b border-neutral-300" />
                <View className="flex-1 justify-between bg-neutral-100 overflow-visible">
                    <View className="flex-1">
                        <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user} />
                    </View>
                    {isOtherTyping && (
                        <Text style={{ padding: 10, color: 'gray', textAlign: 'center' }}>...Digitando</Text>
                    )}
                    <View style={{ marginBottom: hp(2.7) }} className="pt-2">
                        <View className="flex-row mx-3 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5">
                            <TextInput
                                ref={inputRef}
                                onChangeText={value => {
                                    textRef.current = value;
                                    handleTyping();
                                }}
                                placeholder='Type message...'
                                placeholderTextColor={'gray'}
                                style={{ fontSize: hp(2) }}
                                className="flex-1 mr-2"
                            />
                            <TouchableOpacity onPress={() => handlePickImage('camera')} className="p-2 mr-2">
                                <MaterialIcons name="photo-camera" size={hp(3)} color="gray" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handlePickImage('gallery')} className="p-2 mr-2">
                                <MaterialIcons name="photo-library" size={hp(3)} color="gray" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => {
                                    if (!textRef.current.trim()) {
                                        Alert.alert('Erro', 'Por favor, digite uma mensagem antes de enviar.');
                                        return;
                                    }
                                    hanldeSendMessage(textRef.current);
                                }} 
                                className="bg-neutral-200 p-2 rounded-full">
                                <Feather name="send" size={hp(2.7)} color="#737373" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}
