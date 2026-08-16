<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Appointments of treatment - {{treatmentName }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div v-if="loading" class="loading-state">
        Loading appointments...
      </div>

      <div v-else class="modal-content">
        <table class="sub-treatments-table">
          <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Location</th>
            <th>Room</th>
            <th>Staff</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Reminder</th>
<!--            <th>Actions</th>-->
          </tr>
          </thead>
          <tbody>
          <tr v-for="item in appointments" :key="item.id">
            <td>
              <div class="datetime-display">
                <span class="date-text">{{ item.date || 'No Date' }}</span>
              </div>
            </td>
            <td>
              <div class="datetime-display">
                <span class="time-badge">{{ item.start_time || '--:--' }}</span>
              </div>
            </td>
            <td>
                <span class="location-text">
                  {{ item.location || 'N/A' }}
                </span>
            </td>
            <td>
                <span class="location-text">
                  <small v-if="item.room" class="room-text">{{ item.room_name }}</small>
                </span>
            </td>
            <td>
              <span class="staff-tag">{{ item.staff_name || 'Unassigned' }}</span>
            </td>
            <td class="remark-cell">
              <select
                  v-model="item.status"
                  class="status-select"
                  @change="handleStatusChange(item)"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No-Show</option>
              </select>
            </td>
            <td class="remark-cell" :title="item.remark">
              {{ item.remark || '-' }}
            </td>
            <td class="remark-cell" :title="item.reminder_24h_sent">
              {{ item.reminder_24h_sent? 'Sent' : 'not sent' }}
            </td>
<!--            <td>-->
<!--              <button-->
<!--                  class="save-row-btn"-->
<!--                  :disabled="!isEdited(item.id)"-->
<!--                  @click="saveChanges(item)"-->
<!--              >-->
<!--                Save-->
<!--              </button>-->
<!--            </td>-->
          </tr>
          <tr v-if="appointments.length === 0">
            <td colspan="6" class="empty-state">No appointment records found for this treatment.</td>
          </tr>
          </tbody>
        </table>
      </div>

      <div class="modal-footer">
        <button class="action-btn-secondary" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useTreatmentStore } from '@/stores/treatment';
import { useToast } from '@/composables/useToast';
const { showToast } = useToast();

const treatmentStore = useTreatmentStore();

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  treatmentId: { type: [Number, String], required: true },
  treatmentName: { type: String, required: true },
});

const emit = defineEmits(['close', 'refresh']);

const appointments = ref([]);
const loading = ref(false);
const editedRowIds = ref(new Set());

const fetchAppointments= async () => {
  try{
    loading.value = true;
    appointments.value= await treatmentStore.fetchAppointmentsByTreatmentId(props.treatmentId);
    loading.value = false;
  }catch(error){
    console.error(error);
    loading.value = false;
  }
};

watch(() => [props.isOpen, props.treatmentId], ([open, id]) => {
  if (open && id) {
    fetchAppointments();
  }
}, { immediate: true });

const trackEdit = (item) => {
  editedRowIds.value.add(item.id);
};

const isEdited = (id) => {
  return editedRowIds.value.has(id);
};

const handleStatusChange = async (item) => {
  try{
    const res = await treatmentStore.updateAppointment(item)
    if(res.id){
      showToast('Appointments status updated successfully.','success');
      emit('refresh')
    }
  }catch (error) {
    console.error(error);
    showToast('Failed to save Appointments status.','error');
  }

};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
/* 🌟 Light Theme Design Variables 🌟 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4); /* 柔和的深色遮罩，突出前端亮色弹窗 */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px); /* 增加微弱磨砂玻璃感 */
}

.modal-container {
  background-color: #ffffff; /* 纯白视窗 */
  border: 1px solid #e2e8f0;   /* 极浅灰边框 */
  border-radius: 12px;
  width: 85%;
  max-width: 1000px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  color: #1e293b; /* 墨黑现代文本色 */
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  color: #0f172a;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.75rem;
  cursor: pointer;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1e293b; /* 悬浮时变黑，代替原本突兀的红色 */
}

.modal-content {
  padding: 1.5rem;
  overflow-y: auto;
  background-color: #ffffff;
}

/* Elegant Light Table Styling */
.sub-treatments-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.sub-treatments-table th {
  background-color: #f8fafc; /* 浅灰色表头背景 */
  color: #64748b;            /* 柔和的表头文字 */
  padding: 0.85rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #edf2f7;
}

.sub-treatments-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  font-size: 0.925rem;
}

/* Form Control Inline Integration */
.inline-input {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
  padding: 0.5rem 0.75rem;
  width: 100%;
  box-sizing: border-box;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.inline-input:focus {
  outline: none;
  border-color: #2563eb; /* 激活时高亮高级蓝 */
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

/* Context Element Accents */
.datetime-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.date-text {
  color: #334155;
  font-weight: 500;
}

.time-badge {
  color: #2563eb; /* 优雅的蓝色字体时间指示 */
  font-size: 0.8rem;
  font-weight: 600;
}

.location-text {
  color: #334155;
}

.room-text {
  color: #64748b;
  display: block;
  font-size: 0.8rem;
}

.staff-tag {
  background-color: #eff6ff; /* 极其温润的冰蓝色背景 */
  color: #1e40af;            /* 对应搭配的深蓝字 */
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

.remark-cell {
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #64748b;
}

/* Buttons and Interaction Framework */
.save-row-btn {
  background-color: #2563eb; /* 现代科技蓝主状态 */
  color: #ffffff;
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.save-row-btn:hover:not(:disabled) {
  background-color: #1d4ed8; /* 悬浮时加深蓝 */
}

.save-row-btn:disabled {
  background-color: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  background-color: #f8fafc; /* 底部使用极淡浅灰页脚区分空间 */
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

.loading-state, .empty-state {
  text-align: center;
  padding: 4rem;
  color: #64748b;
  font-size: 0.95rem;
}
</style>