<template>
  <div class="uploader">
    <!-- Hidden File Input -->
    <input
        type="file"
        ref="fileRef"
        accept=".xlsx,.xls"
        @change="onFile"
        hidden
    />

    <!-- Action Buttons -->

    &nbsp;
    <button @click="triggerFileInput" class="btn btn-secondary">
      📁 Upload Existing Excel
    </button>

    <!-- Preview Card -->
    <div v-if="preview" class="preview-card">
      <p class="preview-title">Detected from filename:</p>

      <div class="field">
        <label>Name</label>
        <input v-model.trim="preview.name" placeholder="Customer Name" />
      </div>

      <div class="field">
        <label>Phone</label>
        <input v-model.trim="preview.phone" placeholder="Phone Number" />
      </div>

      <div class="field">
        <label>Email</label>
        <input v-model.trim="preview.email" placeholder="Optional" />
      </div>

      <p class="count">{{ preview.recordCount }} non-empty rows found</p>

      <div class="actions">
        <button
            @click="confirm"
            class="btn btn-primary"
            :disabled="uploading || !preview.name"
        >
          {{ uploading ? 'Uploading…' : 'Save to Database' }}
        </button>
        <button @click="cancel" class="btn" :disabled="uploading">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useRecordStore } from '@/stores/record.js'

const emit = defineEmits(['uploaded'])

const recordStore = useRecordStore()
const fileRef = ref(null)
const preview = ref(null)
const uploading = ref(false)



/* ---------- File Input Trigger ---------- */
const triggerFileInput = () => {
  if (fileRef.value) {
    fileRef.value.value = ''
    fileRef.value.click()
  }
}

/* ---------- Color Normalization Helper ---------- */
const normalizeColor = (colorObj) => {
  if (!colorObj) return null
  if (colorObj.rgb) {
    // SheetJS ARGB hex -> standard #RRGGBB
    const hex = colorObj.rgb.length === 8 ? colorObj.rgb.substring(2) : colorObj.rgb
    return `#${hex}`
  }
  if (colorObj.theme !== undefined) {
    return '#000000' // Fallback for theme index references without raw hex
  }
  return null
}

/* ---------- Convert XLSX to Univer IWorkbookData Schema ---------- */
const convertXlsxToUniverData = (workbook, workbookName = 'Imported Sheet') => {
  const sheets = {}
  const sheetOrder = []
  let totalDataRows = 0

  workbook.SheetNames.forEach((sheetName, index) => {
    const sheetId = `sheet_${index}`
    sheetOrder.push(sheetId)

    const ws = workbook.Sheets[sheetName]
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    const cellData = {}

    for (let R = range.s.r; R <= range.e.r; ++R) {
      let rowHasData = false

      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        const cell = ws[cellAddress]

        if (cell && (cell.v !== undefined && cell.v !== null && String(cell.v).trim() !== '' || cell.f !== undefined)) {
          rowHasData = true
          if (!cellData[R]) cellData[R] = {}

          // Base cell properties
          const univerCell = {
            v: cell.v ?? '',
            m: cell.w ?? String(cell.v ?? ''),
            t: cell.t === 'n' ? 2 : 1 // 2 = Numeric, 1 = String
          }

          // ---------- Preserve Formatting (Fonts, Colors, Alignments) ----------
          if (cell.s) {
            const style = {}
            const s = cell.s

            // Font properties
            if (s.font) {
              if (s.font.name) style.ff = s.font.name               // Font Family
              if (s.font.sz) style.fs = Number(s.font.sz)           // Font Size (pt)
              if (s.font.bold) style.bl = 1                         // Bold
              if (s.font.italic) style.it = 1                       // Italic
              if (s.font.underline) style.ul = { s: 1 }            // Underline
              if (s.font.strike) style.st = { s: 1 }               // Strikethrough

              // Text Color
              const clr = normalizeColor(s.font.color)
              if (clr) style.cl = { rgb: clr }
            }

            // Cell Background / Fill
            if (s.fill) {
              const bgClr = normalizeColor(s.fill.fgColor || s.fill.bgColor)
              if (bgClr) style.bg = { rgb: bgClr }
            }

            // Text Alignment
            if (s.alignment) {
              // Horizontal: 1 = Left, 2 = Center, 3 = Right
              if (s.alignment.horizontal === 'center') style.ht = 2
              else if (s.alignment.horizontal === 'right') style.ht = 3
              else if (s.alignment.horizontal === 'left') style.ht = 1

              // Vertical: 1 = Top, 2 = Center, 3 = Bottom
              if (s.alignment.vertical === 'center') style.vt = 2
              else if (s.alignment.vertical === 'top') style.vt = 1
              else if (s.alignment.vertical === 'bottom') style.vt = 3

              // Text Wrap
              if (s.alignment.wrapText) style.tb = 1
            }

            univerCell.s = style
          }

          cellData[R][C] = univerCell
        }
      }

      if (rowHasData && R > 0) { // Count data rows excluding header
        totalDataRows++
      }
    }

    sheets[sheetId] = {
      id: sheetId,
      name: sheetName,
      rowCount: Math.max(range.e.r + 1, 30),
      columnCount: Math.max(range.e.c + 1, 10),
      cellData
    }
  })

  const univerWorkbookData = {
    id: `workbook_${Date.now()}`,
    name: workbookName,
    appVersion: '3.0.0',
    sheets,
    sheetOrder
  }

  return { univerWorkbookData, totalDataRows }
}

/* ---------- File Parse Handler ---------- */
const onFile = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellStyles: true, // Reads fill and font objects
      cellNF: true
    })

    // Extract customer details from file name (e.g., "Vanessa Wang 6479875030.xlsx")
    const base = file.name.replace(/\.(xlsx|xls)$/i, '').trim()
    const parts = base.split(/\s+/)
    const last = parts[parts.length - 1]
    const isPhone = /^[\d\s\-\+]+$/.test(last) && last.replace(/\D/g, '').length >= 7

    const name = isPhone ? parts.slice(0, -1).join(' ') : base
    const phone = isPhone ? last.replace(/\D/g, '') : ''

    // Convert file directly to Univer format
    const { univerWorkbookData, totalDataRows } = convertXlsxToUniverData(workbook, base)

    preview.value = {
      name,
      phone,
      email: '',
      recordCount: totalDataRows,
      univerData: univerWorkbookData // Stores native IWorkbookData payload
    }
  } catch (err) {
    console.error('Failed to parse Excel file to Univer format:', err)
    alert('Failed to read Excel file format.')
    cancel()
  }
}

/* ---------- Save Payload to Backend ---------- */
const confirm = async () => {
  if (!preview.value?.univerData) return

  uploading.value = true
  try {
    const payload = {
      name: preview.value.name,
      phone: preview.value.phone,
      email: preview.value.email,
      // Pass the complete Univer Sheet Workbook JSON structure directly to the backend
      workbookData: preview.value.univerData
    }
    const res = await recordStore.uploadExcel(payload)
    emit('uploaded', res )
    cancel()
  } catch (err) {
    console.error('Database save failed:', err)
    alert(err.response?.data?.message || 'Failed to save customer sheet to backend.')
  } finally {
    uploading.value = false
  }
}

const cancel = () => {
  preview.value = null
  if (fileRef.value) {
    fileRef.value.value = ''
  }
}
</script>

<style scoped>
.uploader {
  position: relative;
  display: inline-block;
}

.preview-card {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  z-index: 50;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.preview-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.field {
  margin-bottom: 10px;
}

.field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 4px;
}

.field input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.count {
  font-size: 13px;
  color: #4b5563;
  margin: 12px 0;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: #ffffff;
  border-color: #2563eb;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}
</style>