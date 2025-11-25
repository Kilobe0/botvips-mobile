# Botvips Mobile

Aplicativo móvel para gerenciamento e visualização de métricas de vendas, desenvolvido com Expo e React Native.

## 🚀 Funcionalidades

- **Dashboard de Vendas**: Visualização de faturamento diário, mensal e métricas de vendas.
- **Gráficos Interativos**: Acompanhamento visual de desempenho.
- **Autenticação**: Login seguro para acesso aos dados.
- **Notificações**: Recebimento de alertas e atualizações.
- **Filtros de Data**: Seleção de períodos personalizados para análise.

## 🛠️ Tecnologias Utilizadas

- **Core**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI/UX**: [React Native Paper](https://callstack.github.io/react-native-paper/), [Lucide React Native](https://lucide.dev/guide/packages/lucide-react-native)
- **Gráficos**: [React Native Gifted Charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts)
- **Animações**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Navegação**: [Expo Router](https://docs.expo.dev/router/introduction)
- **HTTP Client**: [Axios](https://axios-http.com/)

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) (LTS recomendado)
- [Git](https://git-scm.com/)
- [Expo Go](https://expo.dev/client) no seu dispositivo físico ou um emulador Android/iOS configurado.

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd botvips-mobile
```

2. Instale as dependências:

```bash
npm install
```

## ▶️ Como Rodar

Para iniciar o servidor de desenvolvimento:

```bash
npx expo start
```

Isso abrirá um QR code no terminal.
- **Android**: Pressione `a` ou escaneie com o app Expo Go.
- **iOS**: Pressione `i` ou escaneie com o app da câmera (requer Expo Go).
- **Web**: Pressione `w`.

## 📂 Estrutura do Projeto

O projeto segue uma estrutura organizada para facilitar a manutenção:

```
botvips-mobile/
├── app/                # Rotas e telas (Expo Router)
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── constants/      # Constantes e temas
│   ├── context/        # Contextos da aplicação (Auth, etc.)
│   ├── services/       # Serviços de API e lógica de negócios
│   ├── styles/         # Estilos globais
│   └── types/          # Definições de tipos TypeScript
├── assets/             # Imagens e fontes
└── ...
```

## 📜 Scripts Disponíveis

- `npm start`: Inicia o servidor Expo.
- `npm run android`: Roda o app no emulador Android.
- `npm run ios`: Roda o app no simulador iOS.
- `npm run web`: Roda o app no navegador.
- `npm run lint`: Executa a verificação de linting.

---

Desenvolvido com ❤️
