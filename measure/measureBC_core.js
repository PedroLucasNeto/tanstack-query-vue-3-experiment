#!/usr/bin/env node
/*
 Node harness to measure scenarios B and C using TanStack Query Core without a browser.
 It imports @tanstack/query-core from the frontend's node_modules and uses fetch.
 Only network fetches are recorded (cache hits are not written), matching prior methodology.
*/
const fs = require('fs')
const path = require('path')

const CORE_PATH = path.resolve(__dirname, '../frontend/node_modules/@tanstack/query-core')
let QueryClient
try {
  ;({ QueryClient } = require(CORE_PATH))
} catch (e) {
  console.error('ERROR: Could not load @tanstack/query-core from', CORE_PATH)
  console.error('Make sure frontend dependencies are installed: (cd experimentos/frontend && npm i)')
  process.exit(1)
}

const API = process.env.API || 'http://localhost:3000'
const RUNS = parseInt(process.env.RUNS || '20', 10)
const SUFFIX = process.env.SUFFIX ? `_${process.env.SUFFIX}` : ''
const RESULTS_DIR = path.resolve(__dirname, '../results')

function ms(start, end) { return (end - start).toFixed(2) }

async function netJson(url) {
  const t0 = performance.now()
  const res = await fetch(url)
  const json = await res.json()
  const t1 = performance.now()
  return { json, dur: parseFloat(ms(t0, t1)) }
}

async function runScenarioB() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 0 } },
  })
  const outfile = path.join(RESULTS_DIR, `b_tanstack_default${SUFFIX}.csv`)
  fs.writeFileSync(outfile, 'duration_ms\n')

  // Wrap queryFns to log only when they execute (i.e., network)
  async function listFn() { const { dur, json } = await netJson(`${API}/items`); fs.appendFileSync(outfile, `${dur}\n`); return json }
  async function itemFn(id) { const { dur, json } = await netJson(`${API}/items/${id}`); fs.appendFileSync(outfile, `${dur}\n`); return json }

  // One list + N details repeated to simulate navigation
  // Force network with fetchQuery so every iteration counts
  await client.fetchQuery({ queryKey: ['items'], queryFn: listFn })
  for (let i = 0; i < RUNS; i++) {
    const id = (i % 10) + 1
    await client.fetchQuery({ queryKey: ['item', id], queryFn: () => itemFn(id) })
  }
  console.log('Wrote', outfile)
}

async function runScenarioC() {
  const client = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, gcTime: 180_000 } },
  })
  const outfile = path.join(RESULTS_DIR, `c_tanstack_invalidation${SUFFIX}.csv`)
  fs.writeFileSync(outfile, 'duration_ms\n')

  async function listFn() { const { dur, json } = await netJson(`${API}/items`); fs.appendFileSync(outfile, `${dur}\n`); return json }
  async function itemFn(id) { const { dur, json } = await netJson(`${API}/items/${id}`); fs.appendFileSync(outfile, `${dur}\n`); return json }

  // Warm list (network), then detail cycles should hit cache and NOT append (since queryFn not called)
  await client.ensureQueryData({ queryKey: ['items'], queryFn: listFn })
  for (let i = 0; i < RUNS; i++) {
    const id = (i % 10) + 1
    await client.ensureQueryData({ queryKey: ['item', id], queryFn: () => itemFn(id) })
  }
  console.log('Wrote', outfile)
}

async function main() {
  try {
    await runScenarioB()
    await runScenarioC()
  } catch (e) {
    console.error('Measurement failed:', e)
    process.exit(1)
  }
}

main()