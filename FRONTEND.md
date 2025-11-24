### Arquivo 1: `FRONTEND.md`

Este arquivo documenta a arquitetura, configuração e lógica do aplicativo móvel.

```markdown
# BotVips Mobile - Frontend Documentation

Este documento detalha a arquitetura, instalação e funcionamento do aplicativo móvel **BotVips**, desenvolvido em **React Native** com **Expo**.

## 🛠 Tecnologias Principais

*   **Framework:** React Native (via Expo SDK 52+)
*   **Linguagem:** TypeScript
*   **Roteamento:** Expo Router v3 (File-based routing)
*   **UI Component Library:** React Native Paper (Material Design 3)
*   **Gráficos:** React Native Gifted Charts
*   **Http Client:** Axios
*   **Armazenamento Seguro:** Expo Secure Store
*   **Notificações:** Expo Notifications + Firebase Cloud Messaging (FCM)

---

## 📂 Estrutura de Pastas

O projeto segue uma arquitetura que separa a camada de roteamento (`app`) da camada de lógica de negócio e componentes (`src`).

```text
botvips-mobile/
├── app/                        # Expo Router (Apenas Telas e Rotas)
│   ├── (auth)/                 # Grupo de rotas públicas (Login, etc.)
│   │   └── login.tsx           # Tela de Login
│   ├── (tabs)/                 # Grupo de rotas privadas (Logado)
│   │   ├── _layout.tsx         # Configuração da Tab Bar
│   │   ├── index.tsx           # Dashboard (Tela Principal)
│   │   └── settings.tsx        # Configurações/Perfil
│   ├── _layout.tsx             # Root Layout (Guarda de Rotas Auth/App)
│   └── +not-found.tsx          # Fallback 404
│
├── src/                        # Lógica de Negócio e UI Reutilizável
│   ├── components/             # Componentes visuais isolados
│   ├── constants/              # Constantes globais (Theme, Colors)
│   ├── context/                # Context API (AuthContext)
│   ├── services/               # Comunicação com APIs e Storage
│   │   ├── api.ts              # Configuração do Axios
│   │   ├── notificationService.ts # Lógica de registro de Push
│   │   └── storage.ts          # Abstração do SecureStore (Web/Mobile)
│   ├── types/                  # Definições de Tipos TypeScript
│   │   └── api.ts              # Interfaces de resposta do Backend
│   └── utils/                  # Funções auxiliares (Formatadores)
│
├── assets/                     # Imagens e Fontes
├── android/                    # Código nativo gerado (Prebuild)
├── app.json                    # Configuração do Expo
├── google-services.json        # Credenciais do Firebase (Obrigatório)
└── package.json
```

---

## ⚙️ Configuração de Ambiente

### Pré-requisitos
1.  **Node.js** (LTS)
2.  **JDK 17** (Microsoft OpenJDK ou Zulu) - **Crítico para builds Android**.
3.  **Android Studio** (Configurado com SDK e Emulador).
4.  **Conta no Firebase** (para notificações).

### Instalação

1.  Clone o repositório.
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  **Configuração do Firebase:**
    *   Baixe o arquivo `google-services.json` do Console do Firebase.
    *   Coloque na raiz do projeto.
    *   Verifique se o `package` no `app.json` corresponde ao do arquivo JSON.

4.  **Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz:
    ```env
    EXPO_PUBLIC_API_URL=https://api.botvips.app
    ```

---

## 🚀 Execução (Development Build)

Como o projeto utiliza **Notificações Nativas**, o `Expo Go` padrão não é suportado. É necessário gerar um **Development Client**.

1.  **Gerar a pasta nativa (Prebuild):**
    ```bash
    npx expo run:android
    ```
    *Este comando compila o app e instala no emulador.*

2.  **Iniciar o servidor de desenvolvimento:**
    ```bash
    npx expo start --dev-client
    ```
    *Pressione `a` para abrir no Android.*

---

## 🧠 Módulos Principais

### 1. Autenticação (`AuthContext`)
Gerencia o ciclo de vida do usuário.
*   **Login:** Envia credenciais para `/user/singin`.
*   **Persistência:** Salva o JWT Token no `SecureStore`.
*   **Interceptor:** O `axios` injeta automaticamente o header `Authorization: Bearer ...` em todas as requisições subsequentes.
*   **Fluxo:** O `app/_layout.tsx` observa o estado do usuário. Se `user == null`, redireciona para `(auth)/login`. Se logado, para `(tabs)`.

### 2. Dashboard
Exibe métricas financeiras consumindo o endpoint `/user/dashboard`.
*   **Bibliotecas:** `react-native-gifted-charts` (Gráfico de Barras) e `react-native-paper` (Cards).
*   **Lógica:**
    *   Busca dados filtrados pelo mês atual (`date-fns`).
    *   Calcula totais de faturamento e conversão.
    *   Possui "Pull to Refresh" para atualização manual.

### 3. Notificações Push
Integrado com o backend para alertar sobre novas vendas.
*   **Configuração:** Usa `expo-notifications`.
*   **Registro:** Ao fazer login, o app gera um `ExpoPushToken` e envia para o backend via `/user/record/push-token`.
*   **Recepção:** O backend dispara a notificação via webhook de pagamento. O app recebe mesmo em segundo plano (graças ao `google-services.json`).

---

## 🎨 UI/UX & Tema

O projeto utiliza um tema customizado baseado no **Material Design 3** Dark Mode.

*   **Primary Color:** `#00E676` (Verde Neon)
*   **Background:** `#121212` (Dark)
*   **Surface:** `#1A1A1A` (Cards)

O tema é injetado via `PaperProvider` em `app/_layout.tsx`, garantindo consistência em todos os inputs, botões e textos.
```

---