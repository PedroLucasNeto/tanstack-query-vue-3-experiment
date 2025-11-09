import { ref, isRef, unref, watch } from 'vue';

type MeasureResult = { id: number; time: number } | any;

// Create a shared singleton state so all callers of useMeasure() share the same refs
function createMeasure() {
  const isRunning = ref(false);
  const results = ref<MeasureResult[]>([]);
  const error = ref<string | null>(null);
  const tests = ref([
    { id: 1, name: 'Teste A' },
    { id: 2, name: 'Teste B' },
    { id: 3, name: 'Teste C' },
  ])

  function runTest(id: number) {
    // simple simulation: record a fake result with a timestamp
    const t0 = performance.now()
    // simulate network latency briefly
    setTimeout(() => {
      const t1 = performance.now()
      recordResult({ id, time: Math.round(t1 - t0) })
    }, 10)
  }

  // Start sets the running flag synchronously and may trigger async work
  function start() {
    isRunning.value = true;
    error.value = null;
  }

  function stop() {
    isRunning.value = false;
  }

  function recordResult(r: MeasureResult) {
    results.value.push(r)
  }

  function clearResults() {
    results.value = []
  }

  return {
    isRunning,
    results,
    error,
    start,
    stop,
    recordResult,
    clearResults,
    tests,
    runTest,
  }
}

const measure = createMeasure()

export function useMeasure() {
  return measure
}

// Simple item query composable used by ItemDetail.vue
export function useItemQuery(idRefOrValue: any) {
  const idRef = isRef(idRefOrValue) ? idRefOrValue : ref(idRefOrValue)
  const data = ref<any | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItem(id: any) {
    if (id == null) {
      data.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`/items/${id}`)
      if (!res.ok) throw new Error(res.statusText || 'Fetch error')
      data.value = await res.json()
    } catch (err: any) {
      error.value = String(err?.message ?? err)
      data.value = null
    } finally {
      loading.value = false
    }
  }

  // initial fetch
  fetchItem(unref(idRef))

  // refetch when id changes
  watch(idRef, (v) => {
    fetchItem(v)
  })

  return { data, loading, error, refetch: () => fetchItem(unref(idRef)) }
}