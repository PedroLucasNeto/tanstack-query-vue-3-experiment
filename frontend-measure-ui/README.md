# Frontend Measure UI

Aplicação Vue.js para executar visualmente os testes de medição (cenários A/B/C) e exportar CSVs.

Ela se integra com o backend simulado (em ../backend) e usa @tanstack/vue-query para reproduzir os comportamentos dos scripts em `/measure`.

## Como executar localmente (rápido)

1. Instale dependências:

```bash
cd frontend-measure-ui
npm ci
```

2. Aponte a UI para o backend (por padrão o backend simulado roda em http://localhost:3000):

```bash
export VITE_API='http://localhost:3000'
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

4. Abra o navegador em `http://localhost:5173`.

## Manual (opcional) — testar os cenários via UI (em Português)

Se quiser rodar os cenários exatamente como os scripts em `/measure`, você pode usar a interface gráfica:

1. Abra a página em `http://localhost:5173`.
2. No painel "Measure Runner":
  - Selecione o Cenário: A (sem cache), B (TanStack Query padrão) ou C (staleTime / invalidação).
  - Selecione o número de `Runs` (ex.: 20, 200, 2000).
  - Clique em `Start` para iniciar a sequência.
3. O componente irá executar a mesma sequência dos scripts (`/measure/measureA.js` e `measureBC_core.js`) e apresentar os tempos coletados.
4. Ao final, clique em `Export CSV` para baixar um arquivo com o cabeçalho `duration_ms` compatível com os scripts de agregação.

Dicas:
- Garanta que o backend esteja rodando com `LATENCY_MS=150` para reproduzir as medições do repositório.
- O campo `VITE_API` (variável de ambiente) permite apontar a UI para outro backend, se necessário.

## Tests

- Unit tests (Vitest):

```bash
npm run test
```

- End-to-end tests (Cypress):

```bash
npm run e2e
# or open the interactive runner:
npx cypress open
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.