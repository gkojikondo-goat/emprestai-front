# Andar zero — Front

Isto não é uma spec: não há comportamento de produto aqui.
É a verificação de que a stack decidida em docs/adr/001-stack.md funciona
junta, e de que o front publicado conversa com a API publicada.

O andar zero da API está no repositório emprestai-api (docs/andar-zero.md).
Os critérios AZ-03 e AZ-08 deste arquivo dependem dos critérios AZ-04, AZ-05
e AZ-09 de lá.

## Critérios de aceitação

- AZ-01 · um comando sobe o front em modo de desenvolvimento
- AZ-02 · o endereço da API vem de variável de ambiente, com .env.example
  versionado
- AZ-03 · uma página servida pelo front carrega e mostra o resultado de
  GET /v1/health da API: status da API e status do banco
- AZ-04 · com a API fora do ar, a página mostra uma mensagem de erro clara e
  não quebra
- AZ-05 · um comando roda os testes, com pelo menos um teste sobre AZ-03
- AZ-06 · o build de produção termina sem erro, com TypeScript em modo strict
- AZ-07 · .env está no .gitignore e nenhum segredo está no repositório
- AZ-08 · o front publicado na Vercel abre e mostra o resultado de
  /v1/health da API publicada, ponta a ponta

## Fora de escopo

Qualquer funcionalidade do PRD. Nada de login, catálogo, empréstimo ou
devolução. Nada de supabase-js, rotas além da página única, TanStack Query,
Zustand, formulários, Tailwind além do necessário para a página carregar,
shadcn/ui, Playwright, Sentry e geração do cliente da API com orval.

## Não decidido ainda

- Se a geração do cliente a partir do openapi.json (orval) entra no andar
  zero ou fica para depois dele.
- Nome da variável de ambiente do endereço da API.
- Organização de pastas do código do front.
