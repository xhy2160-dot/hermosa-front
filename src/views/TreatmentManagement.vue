<template>
  <div class="app">
    <header>
      <h1>Customer Records</h1>
      <ExcelUpload @uploaded="onUpload" />
    </header>

    <div class="layout">
      <aside class="sidebar">
        <CustomerSearch @select="loadCustomer" />
        <div v-if="recent.length" class="recent">
          <h4>Recent</h4>
          <div
              v-for="c in recent"
              :key="c.id"
              @click="loadCustomer(c)"
              class="recent-item"
          >
            {{ c.name }}
          </div>
        </div>
      </aside>

      <main class="main">
        <CustomerSheet
            v-if="activeCustomer"
            :customer="activeCustomer"
            @saved="refresh"
        />
        <div v-else class="empty">
          Search for a customer or upload an Excel file to begin.
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import CustomerSearch from '@/components/CustomerSearch.vue';
import CustomerSheet from '@/components/CustomerSheet.vue';
import ExcelUpload from '@/components/ExcelUpload.vue';
import {useCustomerStore} from "@/stores/customer.js";
const customerStore = useCustomerStore();

const activeCustomer = computed(() => customerStore.customer)
const recent = ref([]);

const loadCustomer = async (c) => {
  await customerStore.fetchCustomerById(c.id)
  if (!recent.value.find(x => x.id === c.id)) {
    recent.value.unshift({ id: c.id, name: c.name });
    if (recent.value.length > 10) recent.value.pop();
  }
};

const refresh = async () => {
  if (activeCustomer.value) await loadCustomer(activeCustomer.value);
};

const onUpload = async (data) => {
  await customerStore.fetchCustomerById(data.id)
};
</script>

<style>
* { box-sizing: border-box; }
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: #f8f9fa; }
.app { height: 100vh; display: flex; flex-direction: column; }
header {
  background: #fff; border-bottom: 1px solid #e5e7eb;
  padding: 14px 24px; display: flex; justify-content: space-between; align-items: center;
}
header h1 { margin: 0; font-size: 18px; }
.layout { display: flex; flex: 1; overflow: hidden; }
.sidebar {
  width: 340px; background: #fff; border-right: 1px solid #e5e7eb;
  padding: 20px; overflow-y: auto;
}
.recent { margin-top: 24px; }
.recent h4 { margin: 0 0 10px; font-size: 12px; text-transform: uppercase; color: #6b7280; }
.recent-item {
  padding: 10px 12px; border-radius: 6px; cursor: pointer; font-size: 14px;
}
.recent-item:hover { background: #f3f4f6; }
.main { flex: 1; overflow: auto; background: #fff; }
.empty {
  height: 100%; display: flex; align-items: center; justify-content: center;
  color: #9ca3af; font-size: 15px;
}
</style>