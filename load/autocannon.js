import autocannon from 'autocannon'

autocannon({
  url: 'http://localhost:3000/items',
  connections: 20,
  duration: 20
}, (err, result) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log('Requests/sec:', result.requests.average)
  console.log('Latency (avg):', result.latency.average)
})
