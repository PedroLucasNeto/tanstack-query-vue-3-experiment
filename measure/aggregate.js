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

function main() {
  const base = __dirname + '/../results/'
  const files = {
    A: base + 'a_no_cache.csv',
    B: base + 'b_tanstack_default.csv',
    C: base + 'c_tanstack_invalidation.csv',
  }
  const rows = ['scenario,count,mean_ms,p95_ms']
  for (const [k, f] of Object.entries(files)) {
  const exists = fs.existsSync(f)
  if (!exists) { continue }
    const arr = readCsv(f)
  if (arr.length === 0) { continue }
    const s = stats(arr)
    rows.push(`${k},${s.n},${s.mean.toFixed(2)},${s.p95.toFixed(2)}`)
  }
  const out = base + 'summary.csv'
  const tmp = out + '.tmp'
  fs.writeFileSync(tmp, rows.join('\n') + '\n')
  fs.renameSync(tmp, out)
  console.log('Wrote', out)
}

main()
