# Deploy do frontend

## Vercel

Importe este repositório como projeto Angular. O arquivo `vercel.json` configura build, diretório de saída e fallback das rotas SPA.

Após o backend ser criado no Render, confirme a URL em `src/environments/environment.production.ts`.

## GitHub Actions

Adicione os secrets gerados pela Vercel:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Pull requests executam o build. Pushes na `main` validam e publicam em produção.

Depois de obter a URL da Vercel, configure esse endereço como `FRONTEND_URL` no Render.
# Login com Google

Antes do build, substitua `SEU_GOOGLE_CLIENT_ID.apps.googleusercontent.com` em:

- `src/environments/environment.ts`
- `src/environments/environment.production.ts`

Use o Client ID OAuth 2.0 do tipo **Aplicativo da Web**. No Google Cloud, autorize `http://localhost:4200` e a URL pública deste frontend como origens JavaScript.

O valor não é um segredo: ele identifica qual aplicação Web receberá o ID token. A validação de assinatura e audiência é feita pelo backend.
