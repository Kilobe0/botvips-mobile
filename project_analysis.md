# Análise do Projeto BotVips Mobile

Esta análise identifica pontos de atenção, inconsistências e oportunidades de melhoria no projeto, baseando-se nas boas práticas do React Native, Expo e TypeScript.

## 1. Importações e Aliases (Path Aliases)
**Situação Atual:**
O projeto possui o `tsconfig.json` configurado com aliases (`"@/*": ["./src/*"]`), mas os arquivos estão utilizando caminhos relativos longos.

**Exemplos Encontrados:**
- `app/(app)/dashboard.tsx`: `import { COLORS } from '../../src/constants/theme';`
- `app/_layout.tsx`: `import { theme } from '../src/constants/theme';`

**Recomendação:**
Padronizar todas as importações para usar o alias `@/`. Isso torna o código mais limpo e facilita a refatoração (mover arquivos de pasta não quebra os imports).
```typescript
// De:
import { COLORS } from '../../src/constants/theme';
// Para:
import { COLORS } from '@/constants/theme';
```

## 2. TypeScript e Tipagem
**Situação Atual:**
Uso explícito do tipo `any` em componentes, o que anula os benefícios do TypeScript.

**Exemplos Encontrados:**
- `app/(app)/dashboard.tsx`: O componente `MetricRow` define props como `any`:
  ```typescript
  const MetricRow = ({ label, value, color = COLORS.text }: any) => ...
  ```

**Recomendação:**
Criar interfaces ou types para as props dos componentes.
```typescript
interface MetricRowProps {
  label: string;
  value: string;
  color?: string;
}
const MetricRow = ({ label, value, color = COLORS.text }: MetricRowProps) => ...
```

## 3. Variáveis de Ambiente e Segurança
**Situação Atual:**
A URL da API está hardcoded (fixa) no código.
- `src/services/api.ts`: `export const API_URL = 'https://api.botvips.app';`

**Recomendação:**
Utilizar variáveis de ambiente com o `expo-constants` ou `.env` (suportado nativamente pelo Expo). Isso permite alternar facilmente entre ambientes de desenvolvimento (`localhost`) e produção sem alterar o código fonte.
1. Criar arquivo `.env`.
2. Usar `process.env.EXPO_PUBLIC_API_URL`.

## 4. Organização de Código e Lógica
**Situação Atual:**
Lógica de formatação e chamadas de API estão misturadas dentro do componente de UI (`DashboardScreen`).
- Função `formatMoney` recriada dentro do componente.
- Chamada `api.post` direta no `loadDashboard`.

**Recomendação:**
- **Utils:** Mover `formatMoney` para um arquivo `src/utils/format.ts`.
- **Services:** Centralizar as chamadas de API em funções específicas no `src/services/api.ts` ou `src/services/dashboard.ts` (ex: `DashboardService.getSummary()`). Isso separa a responsabilidade e facilita testes.

## 5. Estrutura de Pastas (Expo Router)
**Situação Atual:**
A estrutura parece correta para o Expo Router (`app`, `app/(tabs)`, `app/(app)`).
- O uso de `(app)` e `(tabs)` sugere grupos de rotas, o que é uma boa prática.

**Ponto de Atenção:**
Verifique se a navegação entre os grupos está configurada corretamente no `root layout` para proteger rotas que precisam de autenticação (se houver).

## 6. Estilização
**Situação Atual:**
Mistura de estilos inline com `StyleSheet`.
- `app/(app)/dashboard.tsx`: `<Text style={[styles.cardValue, { color: COLORS.primary }]}>`

**Recomendação:**
Evitar estilos inline e arrays de estilos quando possível, criando definições específicas no `StyleSheet` para variações (ex: `cardValuePrimary`), ou usar uma biblioteca de componentes de UI de forma consistente. Como já está usando `react-native-paper`, considere usar as variantes de tipografia e cores do tema (`theme.colors.primary`) diretamente via props ou styled-components se preferir, mas manter tudo no `StyleSheet` é mais performático.

## Resumo das Ações Prioritárias
1. [ ] **Refatorar Imports**: Substituir `../../` por `@/`.
2. [ ] **Remover `any`**: Tipar corretamente o componente `MetricRow`.
3. [ ] **Extrair Lógica**: Mover `formatMoney` para `src/utils`.
4. [ ] **Configurar ENV**: Mover `API_URL` para variáveis de ambiente.
