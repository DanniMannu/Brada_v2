# Brada

O Brada é composto por três aplicações independentes que partilham tipos de domínio e o mesmo projeto Supabase.

| Aplicação | Diretório | Plataforma | Comando |
| --- | --- | --- | --- |
| Cliente | `apps/customer-mobile` | Android e iOS (Expo Go) | `npm.cmd run dev:customer` |
| Estafeta | `apps/courier-mobile` | Android e iOS (Expo Go) | `npm.cmd run dev:courier` |
| Estabelecimento | `apps/merchant-web` | Web | `npm.cmd run dev:merchant` |

Instale as dependências uma vez na raiz:

```powershell
npm.cmd install
```

O diretório `app/` na raiz contém o projeto legado durante a migração e não é o ponto de arranque dos três produtos.
