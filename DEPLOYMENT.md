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
