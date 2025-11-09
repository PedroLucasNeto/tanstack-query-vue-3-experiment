const fs = require('fs')

function stats(arr) {
  const n = arr.length
  const mean = arr.reduce((a, b) => a + b, 0) / n
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(n - 1, Math.ceil(0.95 * n) - 1))
  const p95 = sorted[idx]
  return { n, mean, p95 }
}

function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('Usage: node stats.js <csv-file>')
    process.exit(1)
  }
  const text = fs.readFileSync(file, 'utf8').trim()
  const lines = text.split(/\r?\n/).slice(1)
  const vals = lines.map(l => parseFloat(l.split(',')[1])).filter(n => Number.isFinite(n))
  const { n, mean, p95 } = stats(vals)
  console.log(`file=${file} count=${n} mean_ms=${mean.toFixed(2)} p95_ms=${p95.toFixed(2)}`)
}

main()
