# Arquitetura Brada

O repositório passa a ser um monorepo. Cada tipo de utilizador tem um produto e uma publicação independentes, mas todos usam o mesmo projeto Supabase e o mesmo serviço de e-mail.

| Diretório | Produto | Plataforma |
| --- | --- | --- |
| `apps/customer-mobile` | Cliente | Android, iOS e web de apoio |
| `apps/courier-mobile` | Estafeta | Android e iOS |
| `apps/merchant-web` | Estabelecimento | Expo Web responsiva |
| `packages/shared` | Tipos e configuração de domínio | Partilhado |
| `email-service` | Registos e e-mail | Node/Express |
| `supabase` | Esquema e políticas | Partilhado |

## Migração do código existente

O código móvel original continua na raiz temporariamente. Tem alterações locais pendentes e ficheiros em falta, por isso não foi movido automaticamente. Isto evita perder trabalho durante a reorganização.

Migração planeada:

1. Recuperar `lib/` e `assets/` no projeto original.
2. Levar os fluxos de `app/(courier)` para `apps/courier-mobile`.
3. Reescrever os fluxos de `app/(establishment)` como páginas React em `apps/merchant-web`.
4. Implementar o fluxo de cliente em `apps/customer-mobile`.
5. Centralizar o cliente Supabase, tipos e autenticação em `packages/shared`.

## Comandos

Depois de instalar as dependências na raiz, use `npm run dev:customer`, `npm run dev:courier` ou `npm run dev:merchant`. O último inicia Expo Web para o painel de estabelecimento.
