<template>
  <div class="uploader">
    <input
        type="file"
        ref="fileRef"
        accept=".xlsx,.xls"
        @change="onFile"
        hidden
    />
    <button @click="showCustomerModal=true" class="btn btn-primary">
      Add A New Customer
    </button>
    &nbsp;
    <button @click="fileRef.click()" class="btn btn-secondary">
      📁 Upload Existing Excel
    </button>

    <div v-if="preview" class="preview-card">
      <p>Detected from filename:</p>
      <div class="field"><label>Name</label><input v-model="preview.name" /></div>
      <div class="field"><label>Phone</label><input v-model="preview.phone" /></div>
      <div class="field"><label>Email</label><input v-model="preview.email" placeholder="optional" /></div>
      <p class="count">{{ preview.recordCount }} data rows found</p>
      <div class="actions">
        <button @click="confirm" class="btn btn-primary" :disabled="uploading">
          {{ uploading ? 'Uploading…' : 'Create / Append Customer' }}
        </button>
        <button @click="cancel" class="btn">Cancel</button>
      </div>
    </div>
  </div>
  <CustomerModal :visible="showCustomerModal" @close="showCustomerModal=false" @success="showCustomerModal=false"/>
</template>

<script setup>
import { ref } from 'vue';
import * as XLSX from 'xlsx';
import CustomerModal from "@/components/CustomerModal.vue";
import {useRecordStore} from "@/stores/record.js";

const recordStore = useRecordStore()
const showCustomerModal = ref(false)
const emit = defineEmits(['uploaded']);
const fileRef = ref(null);
const preview = ref(null);
const currentFile = ref(null);
const uploading = ref(false);

const onFile = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  currentFile.value = file;

  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Parse name/phone from filename like "Vanessa Wang 6479875030.xlsx"
  const base = file.name.replace(/\.(xlsx|xls)$/i, '').trim();
  const parts = base.split(/\s+/);
  const last = parts[parts.length - 1];
  const isPhone = /^[\d\s\-\+]+$/.test(last) && last.replace(/\D/g, '').length >= 7;

  const name = isPhone ? parts.slice(0, -1).join(' ') : base;
  const phone = isPhone ? last.replace(/\D/g, '') : '';

  // Count rows after header
  let count = 0, found = false;
  for (const row of rows) {
    if (!found && String(row[0] || '').toLowerCase().trim() === 'date') { found = true; continue; }
    if (found && row.some(c => c !== undefined && String(c).trim() !== '')) count++;
  }

  preview.value = { name, phone, email: '', recordCount: count };
};

const confirm = async () => {
  uploading.value = true;
  const data  = await recordStore.uploadExcel({
    file: currentFile.value,
    name:preview.value.name,
    phone: preview.value.phone,
    email: preview.value.email
  });

console.log(data)

  emit('uploaded', data);
  cancel();
  uploading.value = false;
};

const cancel = () => {
  preview.value = null;
  currentFile.value = null;
  fileRef.value.value = '';
};
</script>

<style scoped>
.uploader { position: relative; }
.preview-card {
  position: absolute; top: 120%; right: 0;
  width: 320px; background: #fff; border: 1px solid #ddd;
  border-radius: 10px; padding: 16px; z-index: 20;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}
.field { margin-bottom: 10px; }
.field label { display: block; font-size: 12px; color: #666; margin-bottom: 4px; }
.field input { width: 100%; padding: 6px 8px; border: 1px solid #ddd; border-radius: 6px; }
.count { font-size: 13px; color: #555; margin: 10px 0; }
.actions { display: flex; gap: 8px; margin-top: 12px; }
.btn { padding: 8px 14px; border-radius: 6px; border: 1px solid #ccc; background: #fff; cursor: pointer; }
.btn-primary { background: #2563eb; color: #fff; border-color: #2563eb; }
.btn-secondary { background: #f3f4f6; }
</style>