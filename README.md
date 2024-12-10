ChatApp - Aplicativo móvel de chat desenvolvido com React Native e Firebase.

Funcionalidades:
- Autenticação de Usuários: Autenticação via e-mail e senha utilizando o Firebase Authentication.
- Envio de Mensagens e Imagens: Permite o envio de texto e mídia entre usuários.
- Indicador de Usuário Digitando: Mostra em tempo real quando o outro usuário está digitando.

------------------------------------------------------------------------------------------------------------------------

Passo a passo para instalação e configuração do projeto:

- Instalar dependências (execute: npm install).
- Acesse https://console.firebase.google.com para criar um novo projeto.
- Habilite o provedor de autenticação de e-mail e senha na autenticação.
- Crie o Firestore Database (modo de teste).
- Crie um aplicativo web do Firebase e copie e cole as configurações para o arquivo firebaseConfig.js no diretório raiz.

Configuração Firebase:

- Verifique se você realmente habilitou o provedor de autenticação de e-mail e senha na autenticação.
- No Firestore Database: criar as coleções "users" e "rooms".
- Habilite o Firebase Storage.

- Execute: npm start
- Em um aparelho movél com o software "Expo Go" instalado, escaneie o QR Code fornecido no terminal.

OBSERVAÇÕES IMPORTANTES

- Os chats disponiveis só aparecerão na home screen quando tiverem 2 ou mais usuarios cadastrados.

-- LINK PARA DOWLOAND DO APK --
https://expo.dev/artifacts/eas/wrV3fZBxA9pyAWf4setM96.apk



