### Arquivo 2: `BACKEND.md`

Este arquivo documenta a API em C# que serve como base para o app.

```markdown
# BotVips API - Backend Documentation

Documentação técnica da API Restful do BotVips, desenvolvida em **.NET 8**, responsável por gerenciar usuários, bots, pagamentos e notificações.

## 🛠 Tecnologias Principais

*   **Plataforma:** .NET 8 (C#)
*   **Banco de Dados:** MongoDB (Driver oficial)
*   **Cache:** Redis
*   **Background Jobs:** Hangfire (Gerenciamento de tarefas e filas)
*   **Pagamentos:** Stripe, PushinPay, OasyFy, Hoopay, SyncPay
*   **Mensageria:** Telegram Bot API
*   **Storage:** S3 (AWS/Linode)
*   **Monitoramento:** Sentry

---

## 📂 Arquitetura da Solução

A solução segue os princípios de **Clean Architecture** e **Repository Pattern**.

```text
BotVips-main/
├── API/                        # Camada de Entrada (Controllers, Jobs, Config)
│   ├── Controllers/            # Endpoints (User, Bot, Webhook)
│   ├── Jobs/                   # Tarefas agendadas (Hangfire)
│   └── Payloads/               # DTOs de Entrada (Requests)
│
├── Domain/                     # Núcleo da Aplicação
│   ├── Interfaces/             # Contratos de Repositórios e Serviços
│   └── ...                     # Entidades (User, Bot, Transaction, Subscription)
│
├── Service/                    # Regras de Negócio
│   ├── BaaS/                   # Integrações com Gateways de Pagamento
│   ├── BotService.cs           # Lógica principal dos Bots
│   ├── MechanismService.cs     # Processamento de Webhooks e Notificações
│   └── UserService.cs          # Auth e Dashboard
│
├── Repository/                 # Acesso a Dados (MongoDB)
│   └── MongoRepository.cs      # Implementação genérica
│
└── ValueObjects/               # Objetos de Valor e DTOs de Integração
```

---

## 🔑 Módulos Principais

### 1. Autenticação e Usuários (`UserController`)
*   **Endpoint:** `POST /user/singin`
*   **Lógica:** Valida credenciais, gera token JWT e retorna dados do usuário.
*   **Dashboard:** O endpoint `POST /user/dashboard` agrega transações do MongoDB para calcular faturamento diário, mensal e taxas de conversão, retornando um JSON pronto para o frontend.

### 2. Gestão de Bots (`BotService`)
Gerencia a criação e configuração de bots de vendas no Telegram.
*   Armazena tokens do Telegram.
*   Gerencia planos de assinatura (Vip/Free).
*   Configura links de pagamento e mensagens automáticas.

### 3. Processamento de Pagamentos (`MechanismService`)
O coração financeiro do sistema.
*   **Webhooks:** Recebe notificações de diversos gateways (`/webhook/stripe`, `/webhook/pushinpay`, etc.).
*   **Lógica:**
    1.  Verifica a transação no cache/banco.
    2.  Confirma o pagamento.
    3.  Libera o acesso do usuário ao Grupo VIP no Telegram.
    4.  **Dispara Notificação Push** para o dono do bot (App Mobile).

### 4. Notificações (`UserService` & `MechanismService`)
*   **Registro:** O endpoint `/user/record/push-token` salva o `ExpoPushToken` do usuário no MongoDB.
*   **Envio:** Quando o `MechanismService.OnPaymentWebhook` confirma uma venda, ele busca os tokens do usuário dono do bot e utiliza a `Expo.Server.SDK` para enviar o alerta "Venda Realizada! 💰".

---

## 🔄 Background Jobs (Hangfire)

O sistema utiliza Hangfire para tarefas recorrentes e filas.

1.  **CheckSubscriptionJob:** Roda a cada 5 minutos. Verifica assinaturas expiradas e remove usuários dos grupos VIP do Telegram.
2.  **UpdateAllWebhooksJob:** Garante que os webhooks do Telegram estejam ativos.
3.  **Upsell Triggers:** Agenda mensagens de oferta (Order Bumps/Upsells) caso o usuário abandone o carrinho ou recuse uma oferta inicial.

---

## 💾 Banco de Dados (MongoDB)

Principais Coleções:
*   `users`: Dados de login, tokens push, configs de afiliação.
*   `bot`: Configurações dos bots criados.
*   `transaction`: Histórico de todas as vendas (pagas e pendentes).
*   `subscription`: Controle de acesso aos grupos (data de validade).
*   `bot_payment_settings`: Chaves de API dos gateways de pagamento.

---

## 🚀 Como Rodar (Backend)

1.  **Configuração:** Ajuste o `appsettings.json` (ou `appsettings.Development.json`) com as connection strings:
    *   `MongoDB:Url`
    *   `Redis:Server`
    *   `Stripe` Keys
    *   `Crypt:Secret` (Chave para JWT)

2.  **Docker:**
    O projeto possui `Dockerfile`. Para rodar:
    ```bash
    docker build -t botvips-api .
    docker run -p 5145:8080 botvips-api
    ```

3.  **Local (Visual Studio):**
    Defina o projeto `API` como Startup Project e execute (F5).
```