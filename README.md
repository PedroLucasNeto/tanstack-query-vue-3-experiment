# Ambiente de Experimentos — TCC TanStack Query + Vue

Este diretório contém um ambiente mínimo e reprodutível para comparar três cenários:

- Cenário A: Sem cache (fetch direto)
- Cenário B: TanStack Query (configurações padrão)
- Cenário C: TanStack Query (staleTime/invalidação configurados)

## Estrutura

- backend/ — API simulada (Express) com latência artificial e dados em memória.
- frontend/ — App Vue 3 + Vite com TanStack Query, UI para alternar cenários e medir.
- load/ — Exemplos de scripts de carga (k6 e autocannon) opcionais.
- measure/ — Scripts Node para executar cenários e gerar CSVs de métricas.
- results/ — Local onde os CSVs e sumários são gravados.

## Pré-requisitos

- Node.js 18+

## Como reproduzir os cenários (A, B, C)

Resumo rápido
- Objetivo: comparar 3 cenários quanto a latência e número de requisições ao backend:
  - A — sem cache (fetch direto)
  - B — TanStack Query (cache padrão, revalidação frequente)
  - C — TanStack Query com staleTime grande (cache reutilizado)
- Resultado: os scripts geram CSVs por cenário em `experimentos/results/` e um `summary` agregado.

Requisitos mínimos
- Node.js >= 18, npm

Preparação rápida
- Clone este repositório e posicione-se na pasta do projeto (ou use sua cópia local atual):

```bash
git clone https://github.com/PedroLucasNeto/tanstack-query-vue-3-experiment.git
cd tanstack-query-vue-3-experiment
```

Passo a passo para testar e guardar métricas (modo automático — sem abrir o browser)

1) Instalar dependências do backend e iniciar o servidor simulado

```bash
cd experimentos/backend
npm ci
# Ajuste a latência do backend (em ms) se desejar. Ex.: LATENCY_MS=150
LATENCY_MS=150 node server.js &
# Opcional: anote o PID (ex.: $!) para parar depois: kill <PID>
cd ../..
```

2) Instalar dependências do frontend (necessário para o harness B/C)

```bash
cd experimentos/frontend
npm ci
cd ../..
```

3) Medir cenário A (sem cache) — recomendado como teste rápido

```bash
cd experimentos/measure
# Exemplo: RUNS=20
RUNS=20 node measureA.js
cd ../..
```

4) Medir cenários B e C (TanStack Query harness Node-core)

```bash
cd experimentos/measure
# Cenário B (revalidação / comportamento padrão)
RUNS=20 node measureBC_core.js --scenario B

# Cenário C (staleTime longo / cache efetivo)
RUNS=20 node measureBC_core.js --scenario C
cd ../..
```

5) Agregar resultados (gerar sumário com médias e p95)

```bash
cd experimentos/measure
node aggregate_scales.js
# ou
node aggregate.js
cd ../..
```

O que os scripts geram
- CSVs por cenário em `experimentos/results/` com cabeçalho `duration_ms` e uma linha por chamada de rede medida.
- Arquivos típicos:
  - `a_no_cache.csv` (ou `a_no_cache_R{N}.csv` se usar SUFFIX)
  - `b_tanstack_default.csv`
  - `c_tanstack_invalidation.csv`
  - `summary.csv` / `summary_scales.csv` (médias, p95, economia percentual)

Recomendações de execução
- Use RUNS maiores (200, 2000) para reduzir ruído estatístico e observar ganhos mais estáveis.
- Ajuste `LATENCY_MS` no backend para simular diferentes condições de rede (50–300 ms são valores úteis).

## Opcional: testar manualmente via UI (passo a passo em Português)

Se preferir inspecionar os cenários manualmente pela interface, use estes passos rápidos: (PARA NÍVEL DE EXEMPLIFICAÇÃO, PARA MANTER A CONFIABILIDADE OS TESTES DEVEM SER REALIZADOS AUTOMATICAMENTE SEM INTERVENÇÃO HUMANA)

1. Inicie o backend simulado (com latência 150 ms, por exemplo):

```bash
cd backend
LATENCY_MS=150 node server.js &
```

2. Instale dependências do frontend e inicie o dev server:

```bash
cd frontend
npm ci
export VITE_API='http://localhost:3000'
npm run dev
```

3. Abra `http://localhost:5173` no navegador e, no painel "Measure Runner":
- Selecione o Cenário (A, B ou C) e o número de `Runs` (20/200/2000).
- Clique em `Start` para rodar a sequência; ao final use `Export CSV` para baixar os resultados.

4. Compare os CSVs baixados com os arquivos em `results/` ou rode os scripts de agregação (`aggregate.js`) para gerar resumo.

Essa opção é útil para validação manual e inspeção visual do comportamento de cache vs rede.

Notas rápidas de troubleshooting
- Porta 3000 ocupada: se ao iniciar o backend aparecer `EADDRINUSE`, identifique e pare o processo que usa a porta:

```bash
ss -ltnp | grep ':3000' || true
# anote o PID e rode: kill <PID>
```

- Erro ao carregar `@tanstack/query-core` no `measureBC_core.js`: execute `npm ci` em `experimentos/frontend` para garantir que `node_modules` exista.
- Versão do Node: use Node >= 18. Se o fetch não estiver disponível no Node usado, atualize ou ative um polyfill.
- Permissões: se os scripts não conseguirem escrever em `experimentos/results`, verifique permissões de pasta.

Mais sobre interpretação dos resultados
- Cada CSV registra só chamadas de rede (quando a função de query foi executada). Em cenários com cache efetivo (C), a maioria das iterações não aciona chamadas de rede, então o CSV terá menos linhas ou linhas com `duration_ms` apenas para aquecimento/warm-up.
- Use `aggregate.js` para transformar CSVs em métricas: média, p95 e porcentagem de requisições poupadas.
