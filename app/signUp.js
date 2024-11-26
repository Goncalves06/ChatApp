import { View, Text, Image, TextInput, TouchableOpacity, Pressable, Alert } from 'react-native'
import React, { useState } from 'react'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { StatusBar } from 'expo-status-bar';
import { Feather, Octicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Loading from '../components/Loading';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useAuth } from '../context/authContext';

export default function SignUp() {
    const router = useRouter();
    const {register} = useAuth();
    const [loading, setLoading] = useState(false);
    
    // Usando estado ao invés de refs para melhor controle e reatividade
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        username: '',
        profile: ''
    });

    // Função para atualizar o estado do formulário
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Validação de campos
    const validateForm = () => {
        if (!formData.email || !formData.password || !formData.username || !formData.profile) {
            Alert.alert('Sign Up', "Por favor, preencha todos os campos");
            return false;
        }

        // Validação básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            Alert.alert('Sign Up', "Por favor, insira um email válido");
            return false;
        }

        // Validação de senha
        if (formData.password.length < 6) {
            Alert.alert('Sign Up', "A senha deve ter pelo menos 6 caracteres");
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            const response = await register(
                formData.email,
                formData.password,
                formData.username,
                formData.profile
            );

            if (!response.success) {
                Alert.alert('Sign Up', response.msg);
            }
        } catch (error) {
            Alert.alert('Error', 'Ocorreu um erro ao tentar registrar. Tente novamente.');
            console.error('Registration error:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (icon, placeholder, field, isSecure = false) => (
        <View style={{height: hp(7)}} className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-xl">
            {icon}
            <TextInput
                value={formData[field]}
                onChangeText={(value) => handleChange(field, value)}
                style={{fontSize: hp(2)}}
                className="flex-1 font-semibold text-neutral-700"
                placeholder={placeholder}
                secureTextEntry={isSecure}
                placeholderTextColor={'gray'}
                autoCapitalize="none"
                autoCorrect={false}
            />
        </View>
    );

    return (
        <CustomKeyboardView>
            <StatusBar style="dark" />
            <View style={{paddingTop: hp(7), paddingHorizontal: wp(5)}} className="flex-1 gap-12">
                <View className="items-center">
                    <Image 
                        style={{height: hp(20)}} 
                        resizeMode='contain' 
                        source={require('../assets/images/register.png')} 
                    />
                </View>

                <View className="gap-10">
                    <Text style={{fontSize: hp(4)}} className="font-bold tracking-wider text-center text-neutral-800">
                        Sign Up
                    </Text>
                    
                    <View className="gap-4">
                        {renderInput(
                            <Feather name="user" size={hp(2.7)} color="gray" />,
                            'Username',
                            'username'
                        )}
                        {renderInput(
                            <Octicons name="mail" size={hp(2.7)} color="gray" />,
                            'E-mail',
                            'email'
                        )}
                        {renderInput(
                            <Octicons name="lock" size={hp(2.7)} color="gray" />,
                            'Senha',
                            'password',
                            true
                        )}
                        {renderInput(
                            <Feather name="image" size={hp(2.7)} color="gray" />,
                            'Imagem de perfil',
                            'profile'
                        )}

                        <View>
                            {loading ? (
                                <View className="flex-row justify-center">
                                    <Loading size={hp(6.5)} />
                                </View>
                            ) : (
                                <TouchableOpacity 
                                    onPress={handleRegister} 
                                    style={{height: hp(6.5)}} 
                                    className="bg-indigo-500 rounded-xl justify-center items-center"
                                >
                                    <Text style={{fontSize: hp(2.7)}} className="text-white font-bold tracking-wider">
                                        Sign Up
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View className="flex-row justify-center">
                            <Text style={{fontSize: hp(1.8)}} className="font-semibold text-neutral-500">
                                Já possui uma conta?{' '}
                            </Text>
                            <Pressable onPress={() => router.push('signIn')}>
                                <Text style={{fontSize: hp(1.8)}} className="font-bold text-indigo-500">
                                    Sign In
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </CustomKeyboardView>
    );
}