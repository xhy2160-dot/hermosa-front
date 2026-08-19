<template>
  <div class="sheet" v-if="customer">
    <div class="toolbar">
      <div class="info">
        <h2>{{ customer.name }}</h2>
        <span class="meta">
          {{ customer.phone }}
          {{ customer.email ? '· ' + customer.email : '' }}
        </span>
      </div>
      <div class="actions">
        <button @click="addRow" class="btn">+ Add Row</button>
<!--        <button-->
<!--            @click="deleteSelected"-->
<!--            class="btn danger"-->
<!--            :disabled="!selectedCount"-->
<!--        >-->
<!--          Delete Selected ({{ selectedCount }})-->
<!--        </button>-->
        <button
            class="btn"
        >
          {{saving?'Saving...':'Saved✅'}}
        </button>
        <button @click="exportExcel" class="btn">Export .xlsx</button>
      </div>
    </div>

    <ag-grid-vue
        class="ag-theme-alpine"
        style="height: 600px; width: 100%"
        :rowData="records"
        :columnDefs="columnDefs"
        :defaultColDef="defaultColDef"
        :stopEditingWhenCellsLoseFocus="true"
        row-selection="multiple"
        :animate-rows="true"
        @grid-ready="onGridReady"
        @cell-value-changed="dirty = true"
        @cell-editing-stopped="onCellEditingStopped"
        @selection-changed="onSelectionChanged"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {useRecordStore} from "@/stores/record.js";

const recordStore = useRecordStore();

const props = defineProps({
  customer: { type: Object, default: null }
});
const emit = defineEmits(['saved']);

// 本地可编辑副本，与 Grid 绑定
const records = ref([]);
const dirty = ref(false);
const gridApi = ref(null);
const selectedCount = ref(0);
const saving = ref(false);

const columnDefs = [
  {
    headerName: '#',
    valueGetter: 'node.rowIndex + 1', // 1-based row index
    width: 60,
    pinned: 'left',                  // Keep it fixed on the left during horizontal scroll
    sortable: false,
    filter: false,
    resizable: false,
    suppressMovable: true,
    cellStyle: { textAlign: 'center', color: '#6b7280' }
  },
  { field: 'date', headerName: 'Date', editable: true, width: 100 },
  { field: 'treatment', headerName: 'Treatment', editable: true, minWidth: 280 },
  { field: 'locationStaff', headerName: 'Location/Staff', editable: true, width: 140 },
  { field: 'payment', headerName: 'Payment', editable: true, width: 120 },
  { field: 'amount', headerName: 'Amount', editable: true, type: 'numericColumn', width: 110 },
  { field: 'total', headerName: 'Total', editable: true, type: 'numericColumn', width: 110 },
  { field: 'balance', headerName: 'Balance', editable: true, type: 'numericColumn', width: 110 },
  { field: 'remark', headerName: 'Remark', editable: true, flex: 1, minWidth: 200 }
];

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  singleClickEdit: true
};

// 当父组件传入新的 customer 时，深拷贝 records 到本地
watch(() => props.customer, (c) => {
  if (c?.records) {
    records.value = JSON.parse(JSON.stringify(c.records));
  } else {
    records.value = [];
  }
  dirty.value = false;
}, { immediate: true });

const onGridReady = (params) => {
  gridApi.value = params.api;
};

const onSelectionChanged = () => {
  selectedCount.value = gridApi.value?.getSelectedRows().length ?? 0;
};

const onCellEditingStopped = async (event) => {
  if (!event.valueChanged) return;

  saving.value = true;

  const payload = {
    id: event.data.id || null, // Will be null for brand new rows
    customerId: props.customer.id,
    rowIndex: event.rowIndex,
    data: { ...event.data }
  };

  try {
    const res = await recordStore.saveCellEdit(payload);

    // 💡 CRITICAL FIX: If a new record was created, assign its DB `id` back into AG Grid!
    if (res?.record?.id && !event.data.id) {
      event.node.setData({
        ...event.data,
        id: res.record.id
      });
    }
  } catch (err) {
    console.error('Failed to save cell edit:', err);
  } finally {
    setTimeout(() => { saving.value = false; }, 1000);
  }
};

const addRow = () => {
  if (!gridApi.value) return;

  const newRow = {
    date: '',
    treatment: '',
    locationStaff: '',
    payment: '',
    amount: null,
    total: null,
    balance: null,
    remark: ''
  };

  // 1. Apply transaction directly to AG Grid (Do NOT push to records.value here)
  const res = gridApi.value.applyTransaction({ add: [newRow] });
  dirty.value = true;

  if (res && res.add.length > 0) {
    const newRowNode = res.add[0];
    const rowIndex = newRowNode.rowIndex;

    // 2. Scroll to row index and trigger editor
    gridApi.value.ensureIndexVisible(rowIndex, 'bottom');
    gridApi.value.startEditingCell({
      rowIndex: rowIndex,
      colKey: 'date'
    });
  }
};
const deleteSelected = () => {
  if (!gridApi.value || selectedCount.value === 0) return;

  const selectedRows = gridApi.value.getSelectedRows();
  gridApi.value.applyTransaction({ remove: selectedRows });

  dirty.value = true;
  selectedCount.value = 0;
};

const save = async () => {
  if (!props.customer?.id) {
    alert('Customer ID missing');
    return;
  }

  // Extract current rows directly from AG Grid engine
  const currentRecords = [];
  gridApi.value.forEachNode(node => currentRecords.push(node.data));

  try {
    await axios.put(`/api/customers/${props.customer.id}/records`, {
      records: currentRecords
    });

    records.value = currentRecords; // Sync local state
    dirty.value = false;
    emit('saved');
    alert('Saved to database');
  } catch (err) {
    console.error('Save failed:', err);
    alert('Save failed: ' + (err.response?.data?.message || err.message));
  }
};

const exportExcel = () => {
  if (!records.value.length) {
    alert('No records to export');
    return;
  }

  const clean = records.value.map(r => ({
    Date: r.date,
    Treatment: r.treatment,
    'Location/Staff': r.locationStaff,
    Payment: r.payment,
    Amount: r.amount,
    Total: r.total,
    Balance: r.balance,
    Remark: r.remark
  }));

  const ws = XLSX.utils.json_to_sheet(clean);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Records');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

  const filename = `${props.customer.name} ${props.customer.phone}.xlsx`;
  saveAs(new Blob([buf]), filename);
};
</script>

<style scoped>
.sheet { padding: 20px; }
.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 16px; flex-wrap: wrap; gap: 12px;
}
.info h2 { margin: 0; font-size: 20px; }
.meta { color: #666; font-size: 13px; }
.actions { display: flex; gap: 8px; }
.btn {
  padding: 8px 14px; border-radius: 6px; border: 1px solid #d1d5db;
  background: #fff; cursor: pointer;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.btn.danger { color: #dc2626; border-color: #fca5a5; }
:deep(.ag-theme-alpine .ag-cell) {
  border-right: 1px solid #e2e8f0 !important;
}

:deep(.ag-theme-alpine .ag-header-cell) {
  border-right: 1px solid #cbd5e1 !important;
}
</style>