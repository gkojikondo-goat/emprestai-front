# Plano — andar zero do front

Atende docs/andar-zero.md. Obedece docs/adr/001-stack.md.
Só entram bibliotecas que estão no ADR-001 (React, Vite, TypeScript, Vitest).
Qualquer outra precisa ser proposta e aprovada antes.

## Organização de pastas proposta

```
.env.example
index.html
vite.config.ts
src/
  main.tsx
  App.tsx
  config/                 leitura e validação da variável de ambiente
  features/
    health/               componente da página e a chamada a /v1/health
```

Por que essa e não outra: `index.html`, `vite.config.ts`, `src/main.tsx` e
`src/App.tsx` são a convenção do Vite com React (herdada, não decisão nossa).
`config/` e `features/health/` são escolha nossa: a chamada à API fica junto
da tela que a usa, e cada funcionalidade futura ganha a própria pasta em
`features/`. Isso só precisa virar ADR se ficar caro de mudar.

## Tarefas

- [ ] T1 · Projeto Vite com React e TypeScript em modo strict. Antes de gerar
      qualquer coisa, listo os arquivos que o scaffold criaria e espero
      atende: AZ-01, AZ-06 (parcial)
      verifico assim: `npm run dev` sobe e a página inicial abre no navegador;
      `npm run build` termina sem erro

- [ ] T2 · Endereço da API por variável de ambiente, validada na subida
      atende: AZ-02, AZ-07 (parcial)
      verifico assim: sem a variável, a aplicação falha com mensagem que cita
      o nome dela; `.env.example` a lista sem valor

- [ ] T3 · Página que chama `GET /v1/health` e mostra o status da API e do
      banco (usa `fetch`, sem cliente gerado)
      atende: AZ-03
      verifico assim: com a API local rodando (T6 do plano da API), a página
      mostra os dois status como ativos

- [ ] T4 · Estado de erro na página
      atende: AZ-04
      verifico assim: com a API parada, a página mostra uma mensagem de erro e
      continua renderizada, sem tela em branco

- [ ] T5 · Testes com Vitest, com a chamada HTTP substituída por um dublê
      atende: AZ-05
      verifico assim: `npm test` passa, e existe um teste do caso de sucesso e
      um do caso de erro, com nomes que citam AZ-03 e AZ-04

- [ ] T6 · Conferência de segredos
      atende: AZ-07
      verifico assim: `git check-ignore .env` imprime `.env`; `git ls-files`
      mostra `.env.example` e nenhum outro arquivo `.env*`

- [ ] T7 · Deploy na Vercel (você cria o projeto e preenche a variável com a
      URL da API publicada; eu não toco na configuração da Vercel). Depois, a
      origem do front publicado entra na allowlist de CORS da API
      atende: AZ-08
      verifico assim: abrir a URL do front publicado e ver o status da API e do
      banco como ativos

## Dependência entre os dois repositórios

T3 do front só pode ser verificada depois da T6 e da T7 da API (rota e CORS).
T7 do front só pode ser verificada depois da T12 da API (API publicada).

## Decisões tomadas

1. Variável de ambiente do endereço da API: `VITE_API_URL`.
