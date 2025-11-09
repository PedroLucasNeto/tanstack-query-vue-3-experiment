<template>
  <div>
    <h2>Measure Runner</h2>

    <div style="margin-bottom:8px">
      <label>Cenário:
        <select v-model="scenario">
          <option value="A">A — Sem cache</option>
          <option value="B">B — TanStack Query (padrão)</option>
          <option value="C">C — TanStack Query (stale/invalidation)</option>
        </select>
      </label>
      <label style="margin-left:12px">Runs:
        <select v-model.number="runs">
          <option :value="20">20</option>
          <option :value="200">200</option>
          <option :value="2000">2000</option>
        </select>
      </label>
      <button @click="run" :disabled="running">Start</button>
      <button @click="exportCsv" :disabled="results.length===0">Export CSV</button>
    </div>

    <div v-if="running">Executando: {{ progress }}/{{ runs }}</div>

    <div v-if="results.length" style="margin-top:12px; overflow: auto; max-height: 500px; overflow-x: scroll;">
      <h3>Resultados</h3>
      <ul>
        <li v-for="(r,i) in results" :key="i">{{ i+1 }} — {{ r.toFixed(2) }} ms</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMeasure } from '../composables/useMeasure'
import { useQueryClient, QueryClient } from '@tanstack/vue-query'

const scenario = ref('A')
const runs = ref(20)
const running = ref(false)
const progress = ref(0)
// avoid using TS generic in SFC top-level ref for template compatibility
const results = ref([]) // array of numbers

const qc = useQueryClient()
const { runTest } = useMeasure()

const API = import.meta.env.VITE_API || 'http://localhost:3000'

async function netMs(path) {
  const url = `${API}${path}`
  const t0 = performance.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  // consume body to match measureA.js
  await res.arrayBuffer()
  const t1 = performance.now()
  return t1 - t0
}

async function netJson(path) {
  const url = `${API}${path}`
  const t0 = performance.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  const json = await res.json()
  const t1 = performance.now()
  return { json, dur: t1 - t0 }
}

async function run() {
  running.value = true
  progress.value = 0
  results.value = []

  try {
    if (scenario.value === 'A') {
      // list once
      results.value.push(await netMs('/items'))
      for (let i = 0; i < runs.value; i++) {
        const id = (i % 10) + 1
        results.value.push(await netMs(`/items/${id}`))
        progress.value = i+1
        await new Promise(r => setTimeout(r, 50))
      }
    } else if (scenario.value === 'B') {
      // tanstack default (staleTime 0) — use fetchQuery to force network
      // create a fresh client to match the node harness (fresh cache per run)
      const client = new QueryClient({ defaultOptions: { queries: { staleTime: 0 } } })
      async function listFn() {
        const { json, dur } = await netJson('/items')
        results.value.push(dur)
        return json
      }
      async function itemFn(id) {
        const { json, dur } = await netJson(`/items/${id}`)
        results.value.push(dur)
        return json
      }

      await client.fetchQuery({ queryKey: ['items'], queryFn: listFn })
      for (let i = 0; i < runs.value; i++) {
        const id = (i % 10) + 1
        await client.fetchQuery({ queryKey: ['item', id], queryFn: () => itemFn(id) })
        progress.value = i+1
      }
    } else if (scenario.value === 'C') {
      // warm list into cache then ensureQueryData for details
      // create a fresh client to match the node harness (fresh cache per run)
      const client = new QueryClient({ defaultOptions: { queries: { staleTime: 60000, gcTime: 180000 } } })
      async function listFn() {
        const { json, dur } = await netJson('/items')
        results.value.push(dur)
        return json
      }
      async function itemFn(id) {
        const { json, dur } = await netJson(`/items/${id}`)
        results.value.push(dur)
        return json
      }

      await client.ensureQueryData({ queryKey: ['items'], queryFn: listFn, staleTime: 60000 })
      for (let i = 0; i < runs.value; i++) {
        const id = (i % 10) + 1
        try {
          // ensureQueryData will only call itemFn if item is not present in cache
          await client.ensureQueryData({ queryKey: ['item', id], queryFn: () => itemFn(id), staleTime: 60000 })
        } catch (err) {
          console.error('Item ensureQueryData failed for', id, err)
        }
        progress.value = i+1
      }
    }
  } catch (err) {
    console.error('Measurement failed', err)
  } finally {
    running.value = false
  }
}

function exportCsv() {
  const header = 'duration_ms\n'
  const body = results.value.map(r => r.toFixed(2)).join('\n')
  const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `results_${scenario.value}_${runs.value}_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
select { margin-left:6px }
button { margin-left:10px }
</style>