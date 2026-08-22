<template>
  <div class="page-container">
    <!-- Header with Search, Upload, and Save Status Bar -->
    <header class="page-header">
     <div class="search-section">  <CustomerSearch @select="handleCxSelect" />
       <div class="customer-banner">
  <span v-if="selectedCx.name" class="banner-active">
    <strong class="badge">Editing records for customer:</strong>
    {{ selectedCx.name }} &bull; {{ selectedCx.phone }} &bull; {{ selectedCx.email }}
  </span>
         <span v-else class="banner-placeholder">
    Please choose a customer to start
  </span>
       </div></div>
      <div>
        <button @click="showCustomerModal=true" class="btn btn-primary">
          + Add A New Customer
        </button>
        <ExcelUpload @uploaded="handleExcelUpload" />
      </div>
    </header>

    <!-- Main Sheet Container -->
    <main class="sheet-wrapper" v-if="isShow">
      <div class="debug-toolbar">
<!--        <button @click="logData" title="Print current workbook data to console" class="btn btn-sm">-->
<!--          Print JSON Data-->
<!--        </button>-->
<!--        <button @click="destroy" class="btn btn-sm">Destroy Sheet</button>-->
<!--        <button @click="show" class="btn btn-sm">Mount Sheet</button>-->

<!--        <button-->
<!--            @click="saveWorkbookData"-->
<!--            :disabled="!isDirty || isSaving"-->
<!--            class="btn btn-save"-->
<!--        >-->
<!--          {{ isSaving ? 'Saving...' : 'Save Changes' }}-->
<!--        </button>-->

        <span
            v-if="isSaving || isDirty"
            class="status-badge"
            :class="saveStatusClass"
        >
          {{ isSaving || isDirty ? 'Saving...' : '' }}
        </span>

        <span class="status-badge" :class="saveStatusClass">
          {{ saveStatusText }}
        </span>
      </div>

      <UniverSheet
          id="sheet"
          ref="univerRef"
          :data="data"
          @change="onSheetChange"
          @dirty="onDirtyChange"
      />
    </main>
  </div>
  <CustomerModal  :visible="showCustomerModal" @close="showCustomerModal=false" @success="handleCXadded" />
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import UniverSheet from '@/components/UniverSheet.vue'
import CustomerSearch from "@/components/CustomerSearch.vue"
import ExcelUpload from "@/components/ExcelUpload.vue"
import CustomerModal from '@/components/CustomerModal.vue'
import { DEFAULT_WORKBOOK_DATA } from '@/assets/default-workbook-data'

import {storeToRefs} from "pinia";
import { useCustomerStore } from '@/stores/customer';
import {useRecordStore} from '@/stores/record'


const recordStore = useRecordStore();
const customerStore = useCustomerStore();

//stores
const {customer:selectedCx} = storeToRefs(customerStore)

// Component & State Refs
const univerRef = ref<InstanceType<typeof UniverSheet> | null>(null)
const data = ref<any>(DEFAULT_WORKBOOK_DATA)
const isShow = ref(false)

const showCustomerModal = ref(false)

// Save & Dirty Tracking
const isDirty = ref(false)
const isSaving = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

/* ---------- Computed UI States ---------- */
const saveStatusText = computed(() => {
  if (isSaving.value) return 'Saving changes...'
  if (isDirty.value) return 'Unsaved changes'
  return 'All changes saved'
})

const saveStatusClass = computed(() => ({
  'status-saving': isSaving.value,
  'status-dirty': isDirty.value && !isSaving.value,
  'status-clean': !isDirty.value && !isSaving.value
}))

/* ---------- Sheet Lifecycle & Controls ---------- */
const logData = () => {
  const result = univerRef.value?.getData()
  console.log('Current Workbook Snapshot:', JSON.stringify(result, null, 2))
}

const destroy = () => {
  isShow.value = false
}

const show = () => {
  isShow.value = true
}

/* ---------- Modal Handlers ---------- */
const handleCXadded = (c) => {
  showCustomerModal.value = false
  handleCxSelect(c)
}

/* ---------- Upload Handling ---------- */
const handleExcelUpload =  (response: any) => {
  handleCxSelect(response)
}

//customer
const handleCxSelect=async (c)=>{
  selectedCx.value = c
  if (debounceTimer) clearTimeout(debounceTimer)
  isShow.value = true
  // Temporarily unmount to re-initialize Univer instance cleanly
  isShow.value = false

  // Update data reference
  const res = await recordStore.fetchRecordsByCustomerId(c.id)
  if(res.workbook){
    data.value = res.workbook
  }
  isDirty.value = false

  await nextTick()
  isShow.value = true
}

/* ---------- Auto-Save & Dirty Handlers ---------- */
const onDirtyChange = (dirtyState: boolean) => {
  isDirty.value = dirtyState
}

// Fired whenever a true data mutation occurs
const onSheetChange = () => {
  if (debounceTimer) clearTimeout(debounceTimer)

  // Debounce auto-save: Wait 2 seconds after user stops editing
  debounceTimer = setTimeout(() => {
    saveWorkbookData()
  }, 2000)
}

const saveWorkbookData = async () => {
  if (!isDirty.value || isSaving.value || !univerRef.value) return
  if(!selectedCx.value?.id) return
  if (debounceTimer) clearTimeout(debounceTimer)
  isSaving.value = true
  try {
    const latestWorkbookData = univerRef.value.getData()
await recordStore.saveCellEdit({customer_id:selectedCx.value.id, workbookData:JSON.stringify(latestWorkbookData)})
    // Replace with your actual store / backend API call
    // await recordStore.updateWorkbook({ workbookData: latestWorkbookData })
    console.log('Workbook saved successfully:', latestWorkbookData)

    // Mark component clean
    isDirty.value = false
    univerRef.value.markClean()
  } catch (err) {
    console.error('Failed to save workbook data:', err)
  } finally {
    isSaving.value = false
  }
}

/* ---------- Keyboard & Window Leave Protection ---------- */
const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (isDirty.value) {
    event.preventDefault()
    event.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
  }
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (isDirty.value) {
      saveWorkbookData()
    }
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 16px;
}
.search-section{
  display: flex;
}

/* Save Status Badges */
.status-badge {
  font-size: 13px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.status-clean {
  background-color: #e6f4ea;
  color: #137333;
}

.status-dirty {
  background-color: #fef7e0;
  color: #b06000;
}

.status-saving {
  background-color: #e8f0fe;
  color: #1a73e8;
}

/* Buttons */
.btn {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  background-color: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s;
}
.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-save {
  background-color: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn-save:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.sheet-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Prevents flex items from overflowing height boundary */
}

.debug-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

#sheet {
  flex: 1;
  width: 100%;
}

.customer-banner {
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  margin-left: 20px;
}

.banner-active {
  color: #1e40af;
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
}

.badge {
  color: #1d4ed8;
  margin-right: 4px;
}

.banner-placeholder {
  color: #1e3a8a;
  background-color: #f0f9ff;
  border: 1px dashed #93c5fd;
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
}

</style>