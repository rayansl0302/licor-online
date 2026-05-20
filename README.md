# Licor — Pedidos

App web para consultar preços de licores e registrar pedidos. Acesso **restrito** (rota oculta + admin Rayan).

## Rota oculta (não divulgar)

```
http://localhost:5173/licor-rayan-painel
```

Em produção: `https://seu-dominio.com/licor-rayan-painel`

A raiz `/` e outras URLs redirecionam automaticamente para `/licor-rayan-painel`.

## Usuário admin (Firebase Authentication)

1. [Firebase Console](https://console.firebase.google.com/) → **licor-online**
2. **Build → Authentication** → ative **E-mail/Senha**
3. **Users → Adicionar usuário**
   - E-mail **obrigatório** com `rayan` no endereço (ex.: `rayan@gmail.com`, `vendas.rayan@empresa.com`)
   - Senha forte à sua escolha

Quem **não** tiver `rayan` no e-mail é deslogado na hora (app + Firestore).

Opcional no app: nome de exibição com "Rayan" também é aceito no login (regras do banco usam só o e-mail).

## Regras completas do Firestore

Copie e publique em **Firestore → Regras** (arquivo `firestore.rules`):

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated()
        && request.auth.token.email != null
        && request.auth.token.email.matches('.*[rR][aA][yY][aA][nN].*');
    }

    match /pedidos/{pedidoId} {
      allow read: if isAdmin();
      allow create: if isAdmin()
        && request.resource.data.criadoPor == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Firestore

**Build → Firestore Database → Criar banco** (se ainda não existir).

## Variáveis de ambiente

O Vite só expõe variáveis com prefixo **`VITE_`**.

| Arquivo | Uso |
|---------|-----|
| `.env.example` | Modelo (vai no Git) |
| `.env` | Local — **não commitar** (já no `.gitignore`) |

Variáveis (pegue no Firebase Console → Configurações do projeto → Seus apps):

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

Local:

```bash
cp .env.example .env
# preencha os valores no .env
```

## Deploy na Vercel

1. Importe o repo [licor-online](https://github.com/rayansl0302/licor-online)
2. **Settings → Environment Variables** — cadastre as 6 variáveis `VITE_FIREBASE_*` (marque **Production**, **Preview** e **Development**)
3. Confirme: Build `npm run build` · Output `dist` (o `vercel.json` já define isso)
4. **Redeploy** após salvar as variáveis (Deployments → ⋯ → Redeploy)
5. Firebase → **Authentication → Settings → Authorized domains** → adicione `licor-online.vercel.app`

URL: `https://licor-online.vercel.app/licor-rayan-painel`

Se aparecer **404 NOT_FOUND**, quase sempre falta o `vercel.json` no deploy ou as variáveis `VITE_*` no build.

## Como rodar

```bash
npm install
cp .env.example .env   # se ainda não tiver .env
npm run dev
```

Acesse somente: `http://localhost:5173/licor-rayan-painel`

## Sidebar

- **Novo pedido** — montar e salvar (+60% nos preços)
- **Pedidos** — histórico, copiar, imprimir
- **Resumo** — total vendido, clientes, ticket médio
