// Importa os componentes View e Text da biblioteca 'react-native', que são fundamentais para criar interfaces no React Native
import { View, Text } from 'react-native'
// Importa o módulo React, que é necessário para construir componentes funcionais no React Native
import React from 'react'
// Importa o componente Stack da biblioteca 'expo-router', que é responsável por gerenciar a navegação entre telas no aplicativo
import { Stack } from 'expo-router'
// Importa o componente personalizado HomeHeader do diretório de componentes, que será utilizado como cabeçalho na tela inicial do aplicativo
import HomeHeader from '../../components/HomeHeader'

// Define a função _layout que é exportada como padrão. Esta função representa a estrutura principal de layout da aplicação
export default function _layout() {
  return (
    // O componente Stack organiza as telas em uma pilha de navegação. 
    // Isso permite alternar entre diferentes telas dentro da aplicação, mantendo o histórico de navegação.
    <Stack>
        {/* Define uma nova tela dentro da pilha de navegação.
            A tela é chamada de "home" e possui uma configuração personalizada para o cabeçalho. */}
        <Stack.Screen
            name="home" // Nome da tela, que pode ser usada para referência em outras partes do código, como navegação
            options={{
                // O header da tela é personalizado para usar o componente HomeHeader em vez do cabeçalho padrão.
                // Isso permite um controle completo sobre o design e comportamento do cabeçalho.
                header: ()=> <HomeHeader />
            }}
        />
    </Stack>
  )
}
