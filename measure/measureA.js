const fs = require('fs')
const { performance } = require('node:perf_hooks')

const API = process.env.API || 'http://localhost:3000'
const SUFFIX = process.env.SUFFIX ? `_${process.env.SUFFIX}` : ''
const OUT = process.env.OUT || __dirname + `/../results/a_no_cache${SUFFIX}.csv`
const RUNS = parseInt(process.env.RUNS || '20', 10)

async function netMs(url) {
  const t0 = performance.now()
  const res = await fetch(url)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  await res.arrayBuffer()
  const t1 = performance.now()
  return t1 - t0
}

async function main() {
  const rows = ['duration_ms']
  // Uma lista inicial
  rows.push((await netMs(`${API}/items`)).toFixed(2))
  // RUNS detalhes, sem cache no cliente
  for (let i = 0; i < RUNS; i++) {
    const id = (i % 10) + 1
    rows.push((await netMs(`${API}/items/${id}`)).toFixed(2))
    await new Promise(r => setTimeout(r, 50))
  }
  fs.writeFileSync(OUT, rows.join('\n'))
  console.log(`Wrote ${rows.length - 1} rows to ${OUT}`)
}

main().catch(err => { console.error(err); process.exit(1) })
