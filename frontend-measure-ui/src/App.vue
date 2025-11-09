<template>
  <div style="font-family: system-ui, sans-serif; padding: 16px;">
    <h1>Frontend Measure UI</h1>
    <MeasureRunner @run="runMeasure" />
  </div>
</template>

<script setup>
import MeasureRunner from './components/MeasureRunner.vue'

function runMeasure() {
  // Logic to run measurement tests
}

</script>

<style>
body { margin: 0; }
</style>