<template>
  <div>
    <h2>Detalhes do Item</h2>
    <div v-if="item">
      <h3>{{ item.name }}</h3>
      <p>ID: {{ item.id }}</p>
      <p>Resultados:</p>
      <pre>{{ item.results }}</pre>
    </div>
    <div v-else>
      <p>Selecione um item para ver os detalhes.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, toRef } from 'vue'
import { useItemQuery } from '../composables/useMeasure'

const props = defineProps({ test: { type: Object, default: null } })

// If a `test` prop is provided (from the list), use its id; otherwise fallback to null
const itemId = ref(props.test ? props.test.id : null)
const { data: item } = useItemQuery(itemId)

watch(() => props.test, (newT) => {
  itemId.value = newT ? newT.id : null
})
</script>

<style scoped>
h2 {
  margin-bottom: 16px;
}
pre {
  background: #f7f7f7;
  padding: 12px;
  overflow: auto;
}
</style>