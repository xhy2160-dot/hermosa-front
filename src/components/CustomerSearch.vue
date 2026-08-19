<template>
  <div class="search-box">
    <input
        v-model="query"
        placeholder="Search name, phone, or email..."
        class="search-input"
    />
    <div v-if="loading" class="hint">Searching...</div>
    <ul v-if="customers.length && !selected" class="results">
      <li
          v-for="c in customers"
          :key="c.id"
          @click="selectCx(c)"
          class="result-item"
      >
        <div class="name">{{ c.name }}</div>
        <div class="meta">{{ c.phone }} {{ c.email ? '· ' + c.email : '' }}</div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import {useCustomerStore} from "@/stores/customer.js";
import {storeToRefs} from "pinia";

const customerStore = useCustomerStore();

const query = ref('');
const selected= ref(false)
const { customers } = storeToRefs(customerStore);
const loading = ref(false);
const emit = defineEmits(['select']);

let timer;
watch(query, (val) => {
  clearTimeout(timer);
  selected.value=false
  if (!val || val.length < 1) { customers.value = []; return; }
  timer = setTimeout(async () => {
    loading.value = true;
   await customerStore.searchCustomers(query.value)
    loading.value = false;
  }, 300);
});

const selectCx = (c) => {
  selected.value=true
  emit('select', c)
}

</script>

<style scoped>
.search-box { position: relative; }
.search-input {
  width: 100%; padding: 10px 14px; font-size: 15px;
  border: 1px solid #ddd; border-radius: 8px;
}
.results {
  position: absolute; top: 110%; left: 0; right: 0;
  background: #fff; border: 1px solid #eee;
  border-radius: 8px; max-height: 320px; overflow-y: auto;
  z-index: 10; padding: 0; margin: 0; list-style: none;
}
.result-item { padding: 12px 14px; cursor: pointer; border-bottom: 1px solid #f5f5f5; }
.result-item:hover { background: #f8f9fa; }
.name { font-weight: 600; }
.meta { font-size: 12px; color: #888; margin-top: 2px; }
.hint { font-size: 12px; color: #888; margin-top: 6px; }
</style>