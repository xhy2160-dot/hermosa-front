<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal-container">
      <div class="modal-header">
        <span>Installment Payments Ledger ({{ props.treatmentName || 'Untitled treatment' }})</span>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div v-if="loading" class="loading-state">
        Loading installment payments...
      </div>
      <div v-else class="modal-content">
        <!--        <span class="payment-summary">Summary:Total: ${{paymentInfo.total || 0}}, Paid: ${{paymentInfo.appUsed || 0}}, Balance: ${{paymentInfo.balance || 0}}</span>-->
        <table class="payment-table">
          <thead>
            <tr>
              <th>Amount ($)</th>
              <th>Payment Method</th>
              <th>Date Added</th>
              <!--            <th class="actions-hdr">Actions</th>-->
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in paymentInfo.payments" :key="payment.id">
              <td>
                <input type="number" step="0.01" v-model.number="payment.amount" class="inline-input active-amount"
                  @change="trackEdit(payment.id)" />
              </td>
              <td>
                <select v-model="payment.payment_method" class="inline-input" @change="trackEdit(payment.id)">
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="WeChat Pay">WeChat Pay</option>
                  <option value="Alipay">Alipay</option>
                  <option value="Store Credits">Store Credits</option>
                  <option value="Treatment Package">Treatment Package</option>
                </select>
              </td>
              <td>
                <span class="date-string">{{ toDateString(payment.createdAt) + ' ' +
                  toTimeString(payment.createdAt)}}</span>
              </td>
              <!--            <td class="action-cell">-->
              <!--              <button-->
              <!--                  class="save-row-btn"-->
              <!--                  :disabled="!isRowEdited(payment.id)"-->
              <!--                  @click="updatePayment(payment)"-->
              <!--              >-->
              <!--                Save-->
              <!--              </button>-->
              <!--            </td>-->
            </tr>

            <tr v-if="isAdding" class="new-record-row">
              <td>
                <input type="number" step="0.01" placeholder="0.00" v-model.number="newForm.amount"
                  class="inline-input new-input" />
              </td>
              <td>
                <select v-model="newForm.payment_method" class="inline-input new-input">
                  <option value="" disabled selected>Select Method</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="WeChat Pay">WeChat Pay</option>
                  <option value="Alipay">Alipay</option>
                  <option value="Store Credits">Store Credits</option>
                  <option value="Treatment Package">Treatment Package</option>
                </select>
              </td>
              <td><span class="draft-badge">TBD</span></td>
              <td class="action-cell">
                <div class="row-actions-cluster">
                  <button class="confirm-add-btn" @click="submitNewPayment">Submit</button>
                  <button class="cancel-add-btn" @click="isAdding = false">&times;</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="!isAdding" class="add-trigger-wrapper">
          <button class="plus-trigger-btn" @click="isAdding = true" title="Add New Payment Block">
            <span class="plus-icon">+</span> Add A Payment
          </button>
        </div>
      </div>

      <div class="modal-footer">
        <button class="action-btn-secondary" @click="closeModal">Close Ledger</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();
import { toDateString, toTimeString } from "@/utils/formatDate.js";
import { usePaymentStore } from "@/stores/payment.js";

const paymentStore = usePaymentStore();

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  id: { type: [Number, String], required: true },
  customerId: { type: [Number, String], required: true },
  treatmentName: { type: [String], required: true },
  flag: { type: String, default: null },
});

const emit = defineEmits(['close']);

const paymentInfo = ref([]);
const loading = ref(false);
const isAdding = ref(true);
const editedRowIds = ref(new Set());

const newForm = reactive({
  id: computed(() => props.id),
  amount: null,
  payment_method: '',
  flag: computed(() => props.flag),
  type: 'expense',
});

const resetForm = () => {
  Object.keys(newForm).forEach(key => delete newForm[key]);
  Object.assign(newForm, {
    id: computed(() => props.id),
    type: 'expense',
    amount: null,
    payment_method: '',
    flag: computed(() => props.flag)
  });

}

const fetchPayments = async () => {
  try {
    loading.value = true;
    if (props.flag === 'package') {
      paymentInfo.value = await paymentStore.fetchPaymentsByTreatmentId(props.id);
    } else {
      paymentInfo.value = await paymentStore.fetchPaymentsByAppId(props.id);
    }

    loading.value = false;
    isAdding.value = false;
    console.log(paymentInfo.value);
  } catch (error) {
    loading.value = false;
    showToast('Failed to load payments, please try again', 'error');
  }
};

watch(() => [props.isOpen, props.id], ([open, id]) => {
  if (open && id) {
    fetchPayments();
  }
}, { immediate: true });

const trackEdit = (id) => editedRowIds.value.add(id);
const isRowEdited = (id) => editedRowIds.value.has(id);

const updatePayment = async (payment) => {
  await paymentStore.updateAPayment(payment)
};

const submitNewPayment = async () => {
  if (!newForm.amount || !newForm.payment_method) {
    showToast('Please enter both an amount and select a payment method.', 'error');
    return;
  }
  try {
    loading.value = true;
    await paymentStore.addAPayment(newForm);
    await fetchPayments();
    loading.value = false;
    isAdding.value = false;
    resetForm()
  } catch (error) {
    loading.value = false;
  }
};

const closeModal = async () => {
  emit('close');
}
</script>

<style scoped>
/* 🌟 Light Theme Design Variables 🌟 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  /* 柔和深灰色半透明遮罩 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  /* 磨砂玻璃效果 */
}

.modal-container {
  background-color: #ffffff;
  /* 纯白面板 */
  border: 1px solid #e2e8f0;
  /* 极浅灰修饰边 */
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  color: #1e293b;
  /* 优雅墨黑字 */
}

.modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1rem;
  color: #0f172a;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1e293b;
}

.modal-content {
  padding: 1rem;
  overflow-y: auto;
  background-color: #ffffff;
}

.payment-summary {
  display: inline-block;
  padding: 0 1.5rem 1.5rem 1rem;
}

.payment-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.payment-table th {
  background-color: #f8fafc;
  color: #64748b;
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #edf2f7;
}

.payment-table td {
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

/* Input & Select Custom Base Styling */
.inline-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
  padding: 0.45rem 0.6rem;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.inline-input:focus {
  outline: none;
  border-color: #2563eb;
  /* 激活时现代科技蓝 */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.active-amount {
  color: #0f172a;
  font-weight: 600;
}

/* Row Actions Button States */
.save-row-btn {
  background-color: #2563eb;
  color: #ffffff;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-row-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.save-row-btn:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Plus Trigger Node Layout */
.add-trigger-wrapper {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.25rem 0;
}

.plus-trigger-btn {
  background-color: #ffffff;
  border: 1px dashed #2563eb;
  color: #2563eb;
  padding: 0.6rem 2.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.plus-trigger-btn:hover {
  background-color: #eff6ff;
  border-style: solid;
}

.plus-icon {
  font-size: 1.1rem;
}

/* New Row Appending Contextual States */
.new-record-row {
  background-color: #f8fafc;
}

.new-input {
  border-color: #93c5fd;
}

/* 给予预备态更醒目的亮蓝边框说明 */
.draft-badge {
  font-size: 0.75rem;
  background-color: #eff6ff;
  color: #1e40af;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  border: 1px solid #bfdbfe;
}

.row-actions-cluster {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.confirm-add-btn {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.confirm-add-btn:hover {
  background-color: #059669;
}

.cancel-add-btn {
  background: none;
  border: 1px solid #e2e8f0;
  color: #64748b;
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-add-btn:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #ef4444;
}

.actions-hdr,
.action-cell {
  text-align: right;
  width: 130px;
}

.date-string {
  color: #64748b;
  font-size: 0.9rem;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  background-color: #f8fafc;
  /* 页脚淡灰底 */
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.action-btn-secondary {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn-secondary:hover {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}

.loading-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
  font-size: 0.95rem;
}
</style>