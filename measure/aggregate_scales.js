const fs = require('fs')

function readCsv(file) {
  const text = fs.readFileSync(file, 'utf8').trim()
  const lines = text.split(/\r?\n/).slice(1)
  return lines.map(l => parseFloat(l.split(',').pop() || 'NaN')).filter(Number.isFinite)
}

function stats(arr) {
  const n = arr.length
  const mean = arr.reduce((a,b)=>a+b,0)/n
  const sorted = [...arr].sort((a,b)=>a-b)
  const p95 = sorted[Math.max(0, Math.min(n-1, Math.ceil(0.95*n)-1))]
  return { n, mean, p95 }
}

function tryRow(label, file) {
  if (!fs.existsSync(file)) return null
  const arr = readCsv(file)
  if (arr.length === 0) return null
  const s = stats(arr)
  return { label, ...s }
}

function main() {
  const base = __dirname + '/../results/'
  const rounds = [
    { name: 'R20', runs: 20 },
    { name: 'R200', runs: 200 },
    { name: 'R2000', runs: 2000 },
  ]
  const rows = ['round,scenario,count,mean_ms,p95_ms,savings_vs_B_percent']
  for (const r of rounds) {
    const A = tryRow('A', base + `a_no_cache_${r.name}.csv`)
    const B = tryRow('B', base + `b_tanstack_default_${r.name}.csv`)
    const C = tryRow('C', base + `c_tanstack_invalidation_${r.name}.csv`)
    for (const entry of [A,B,C]) {
      if (!entry) continue
      const savings = entry.label === 'C' && B ? (1 - entry.n / B.n) * 100 : ''
      rows.push(`${r.name},${entry.label},${entry.n},${entry.mean.toFixed(2)},${entry.p95.toFixed(2)},${savings === '' ? '' : savings.toFixed(2)}`)
    }
  }
  const out = base + 'summary_scales.csv'
  fs.writeFileSync(out, rows.join('\n') + '\n')
  console.log('Wrote', out)
}

main()
