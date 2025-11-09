import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const LATENCY_MS = parseInt(process.env.LATENCY_MS || '150', 10);

// Dados em memória
const items = Array.from(
  { length: 50 },
  (_, i) => {
    return { id: i + 1, name: `Item ${i + 1}` };
  }
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

app.get('/items', async (req, res) => {
  await delay(LATENCY_MS);
  res.json(items);
});

app.get('/items/:id', async (req, res) => {
  await delay(LATENCY_MS);
  const id = Number(req.params.id);
  const item = items.find((i) => i.id === id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/items', async (req, res) => {
  await delay(LATENCY_MS);
  const id = items.length + 1;
  const name = req.body?.name || `Item ${id}`;
  const created = { id, name };
  items.push(created);
  res.status(201).json(created);
});

app.put('/items/:id', async (req, res) => {
  await delay(LATENCY_MS);
  const id = Number(req.params.id);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const name = req.body?.name || items[idx].name;
  items[idx] = { id, name };
  res.json(items[idx]);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend simulado rodando em http://localhost:${port} (latência: ${LATENCY_MS}ms)`);
});
