<!--<template>-->
<!--  <div v-if="roomStore.roomSelected.isOpen" class="modal-overlay">-->
<!--    <div class="modal-container">-->

<!--      <div class="modal-header">-->
<!--        <h2>{{ isEditMode ? 'Modify Appointment Details' : 'Schedule New Appointment' }}</h2>-->
<!--        <button class="close-btn" @click="closeModal">&times;</button>-->
<!--      </div>-->

<!--      <div class="modal-content">-->
<!--        <div class="context-banner">-->
<!--          <div class="context-item">-->
<!--            <span class="label">Location:</span>-->
<!--            <span class="value-tag">{{ roomStore.roomSelected.location }}</span>-->
<!--          </div>-->
<!--          <div class="context-item">-->
<!--            <span class="label">Assigned Room:</span>-->
<!--            <span class="value">{{ roomStore.roomSelected.roomName }}</span>-->
<!--          </div>-->
<!--        </div>-->

<!--        <form @submit.prevent="handleSubmit" class="booking-form">-->

<!--          <div class="form-group row-span">-->
<!--            <label class="form-label">{{ isEditMode ? 'Edit Appointment' : 'Customer Search' }}<span-->
<!--                class="required">*</span></label>-->

<!--            <div v-if="selectedPatient" class="selected-patient-card">-->
<!--              <div class="patient-info">-->
<!--                <span>-->
<!--                  <strong>{{ selectedPatient.name }}</strong>-->
<!--                  <span v-if="selectedPatient.customer_name"> · {{ selectedPatient.customer_name }}</span>-->
<!--                  <span v-if="selectedPatient.phone"> · {{ selectedPatient.phone }}</span>-->
<!--                  <span v-if="selectedPatient.email"> · {{ selectedPatient.email }}</span>-->
<!--                </span>-->
<!--              </div>-->
<!--              <button v-if="!isEditMode" type="button" class="remove-patient-btn" @click="clearPatientSelection">-->
<!--                Change-->
<!--              </button>-->
<!--            </div>-->

<!--            <div v-else class="search-combobox-wrapper">-->
<!--              <div class="search-input-wrapper">-->
<!--                <input type="text" v-model="searchQuery" placeholder="Search by customer name, phone, or email..."-->
<!--                       class="form-input search-input" @input="handlePatientSearch" />-->
<!--                <button class="search-btn" @click="handleOpenCusModal">Add new customer</button>-->
<!--              </div>-->
<!--              <ul v-if="customers.length > 0" class="search-results-dropdown">-->
<!--                <li v-for="patient in customers" :key="patient.id" @click="selectPatient(patient)">-->
<!--                  <div class="search-row-main">{{ patient.name }}</div>-->
<!--                  <div class="search-row-sub">{{ patient.phone }} | {{ patient.email }}</div>-->
<!--                </li>-->
<!--              </ul>-->
<!--              <div v-if="searchQuery && customers.length === 0 && !searching" class="no-results-hint">-->
<!--                No matching customers found.-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div class="form-group" v-if="selectedPatient && !isEditMode">-->
<!--            <label class="form-label">Is this appointment for a package?</label>-->
<!--            <div class="radio-group">-->
<!--              <label v-for="type in appointmentTypes" :key="type.id" class="radio-label">-->
<!--                <input-->
<!--                    type="radio"-->
<!--                    :value="type.id"-->
<!--                    v-model="isForAPackage"-->
<!--                />-->
<!--                {{ type.name }}-->
<!--              </label>-->
<!--            </div>-->
<!--          </div>-->
<!--          <div v-if="selectedPatient && isForAPackage==='yes'" class="form-group full-width treatment-box">-->
<!--            <div class="treatment-header">-->
<!--              <label class="form-label">Link Package Plan</label>-->
<!--              <button type="button" class="text-link-btn" @click="showAddTreatmentForm = !showAddTreatmentForm">-->
<!--                {{ showAddTreatmentForm ? '✕ Cancel New' : '＋ Add New Treatment' }}-->
<!--              </button>-->
<!--            </div>-->

<!--            <div v-if="showAddTreatmentForm" class="inline-treatment-form">-->
<!--              <div class="inline-grid">-->
<!--                <div class="inner-group">-->
<!--                  <input type="text" v-model="newTreatment.name" placeholder="Treatment Name *"-->
<!--                    class="form-input text-xs" />-->
<!--                </div>-->
<!--                <div class="inner-group">-->
<!--                  <input type="number" step="0.01" v-model="newTreatment.total" placeholder="Total Price ($) *"-->
<!--                    class="form-input text-xs" />-->
<!--                </div>-->
<!--              </div>-->
<!--              <div class="inner-group mt-2">-->
<!--                <textarea v-model="newTreatment.remark" placeholder="Treatment Remarks..." class="form-textarea text-xs"-->
<!--                  rows="1"></textarea>-->
<!--              </div>-->
<!--              <div class="inline-actions mt-2">-->
<!--                <button type="button" class="btn-sub-save" :disabled="!newTreatment.name"-->
<!--                  @click="handleInlineTreatmentSubmit">-->
<!--                  Save Treatment-->
<!--                </button>-->
<!--              </div>-->
<!--            </div>-->

<!--            <select v-else v-model="form.treatment_id" class="form-input">-->
<!--              <option value="">&#45;&#45; Select a treatment package &#45;&#45;</option>-->
<!--              <option v-for="t in patientTreatments" :key="t.id" :value="t.id">-->
<!--                {{ t.name }} (Total: ${{ t.total }} | Balance: ${{ t.balance }})-->
<!--              </option>-->
<!--            </select>-->
<!--          </div>-->
<!--          <div class="form-group" v-if="selectedPatient && isForAPackage==='no'">-->
<!--            <label class="form-label">Treatment Name <span class="required">*</span></label>-->
<!--            <input v-model="form.treatment_name" class="form-input" required placeholder=""/>-->
<!--          </div>-->
<!--          <div class="form-group">-->
<!--            <label class="form-label">Assigned Staff <span class="required">*</span></label>-->
<!--            <select v-model="form.staff_id" class="form-input" required>-->
<!--              <option value="" disabled>Select Staff Member</option>-->
<!--              <option v-for="s in staff" :key="s.id" :value="s.id">-->
<!--                {{ s.name }}-->
<!--              </option>-->
<!--            </select>-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="form-label">Appointment Date <span class="required">*</span></label>-->
<!--            <input type="date" v-model="form.date" class="form-input" required />-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="form-label">Start Time <span class="required">*</span></label>-->
<!--            <select class="form-input" v-model="form.start_time" @change="handleStartTimeChange" required>-->
<!--              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>-->
<!--            </select>-->
<!--          </div>-->

<!--          <div class="form-group">-->
<!--            <label class="form-label">End Time <span class="required">*</span></label>-->
<!--            <select class="form-input" v-model="form.end_time" required>-->
<!--              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>-->
<!--            </select>-->
<!--          </div>-->

<!--          <div class="form-group full-width">-->
<!--            <label class="form-label">Special Remarks / Notes</label>-->
<!--            <textarea v-model="form.remark"-->
<!--              placeholder="Add clinical constraints, treatment requirements, or check-in notes..." class="form-textarea"-->
<!--              rows="3"></textarea>-->
<!--          </div>-->

<!--          <div class="form-actions">-->
<!--            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>-->
<!--            <button type="submit" class="btn-primary" :disabled="!selectedPatient || !form.staff_id">-->
<!--              {{ isEditMode ? 'Save Changes' : 'Confirm Appointment' }}-->
<!--            </button>-->
<!--          </div>-->

<!--        </form>-->
<!--      </div>-->

<!--    </div>-->
<!--  </div>-->
<!--  <CustomerModal :visible="openCusModal"/>-->
<!--</template>-->

<!--<script setup>-->
<!--import { ref, reactive, watch, computed, onMounted } from 'vue';-->
<!--import CustomerModal from "@/components/CustomerModal.vue";-->
<!--import { useRoomStore } from "@/stores/room.js";-->
<!--import { useStaffStore } from "@/stores/staff.js";-->
<!--import { useTreatmentStore } from "@/stores/treatment.js";-->
<!--import { useCustomerStore } from "@/stores/customer.js";-->
<!--import { useAuthStore } from "@/stores/auth.js";-->
<!--import { storeToRefs } from "pinia";-->
<!--import { generateDurationSlots, calculateEndTime, toDateString } from "@/utils/formatDate.js";-->
<!--import { useToast } from "@/composables/useToast.js";-->
<!--const { showToast } = useToast();-->

<!--const props = defineProps({-->
<!--  selectedAppointment: { type: Object, default: null },-->
<!--  selectedDate: { type: Date, default: null },-->
<!--});-->

<!--const emit = defineEmits(['close', 'saved']);-->

<!--const timeSlots = ref([]);-->
<!--timeSlots.value = generateDurationSlots();-->

<!--const roomStore = useRoomStore();-->
<!--const staffStore = useStaffStore();-->
<!--const customerStore = useCustomerStore();-->
<!--const treatmentStore = useTreatmentStore();-->
<!--const authStore = useAuthStore();-->

<!--const { staff } = storeToRefs(staffStore);-->
<!--const { customers } = storeToRefs(customerStore);-->

<!--const isEditMode = computed(() => !!props.selectedAppointment);-->

<!--const searchQuery = ref('');-->
<!--const searchResults = ref([]);-->
<!--const searching = ref(false);-->
<!--const selectedPatient = ref(null);-->
<!--let searchTimeout = null;-->

<!--// 💡 状态引擎：疗程列表管理-->
<!--const patientTreatments = ref([]);-->
<!--const showAddTreatmentForm = ref(false);-->
<!--const newTreatment = reactive({-->
<!--  name: '',-->
<!--  total: '',-->
<!--  remark: ''-->
<!--});-->

<!--const form = reactive({-->
<!--  treatment_id: '', // 关联新字段-->
<!--  treatment_name:'',-->
<!--  staff_id: '',-->
<!--  date: props.selectedDate ? toDateString(props.selectedDate) : '',-->
<!--  start_time: '',-->
<!--  end_time: '',-->
<!--  remark: ''-->
<!--});-->

<!--const getDefaultBookingDate = () => {-->
<!--  if (props.selectedDate) return toDateString(props.selectedDate);-->
<!--  return toDateString(new Date());-->
<!--};-->

<!--const appointmentTypes = [-->
<!--  { id: 'no', name: 'No' },-->
<!--  { id: 'yes', name: 'Yes' },-->
<!--]-->

<!--const isForAPackage = ref('no');-->
<!--// 💡 加载某位患者名下的现有疗程清单-->
<!--const fetchPatientTreatments = async (customerId) => {-->
<!--  try {-->
<!--    if (!customerId) return;-->
<!--    // 假设你在 treatmentStore 里写了通过客户ID过滤疗程的动作-->
<!--    // 如果没有，可以换成：const res = await axios.get(`/api/treatments?customer_id=${customerId}`)-->
<!--    const data = await treatmentStore.fetchTreatmentsByCustomer(customerId);-->
<!--    patientTreatments.value = data || [];-->
<!--  } catch (err) {-->
<!--    console.error('Failed to load treatments for patient:', err);-->
<!--    showToast('Failed to load treatments', 'error');-->
<!--  }-->
<!--};-->

<!--//customer modal-->
<!--const openCusModal = ref(false);-->

<!--// 💡 提交快捷疗程表单-->
<!--const handleInlineTreatmentSubmit = async () => {-->
<!--  if (!newTreatment.name) return;-->
<!--  try {-->
<!--    const payload = {-->
<!--      customer_id: selectedPatient.value.id,-->
<!--      name: newTreatment.name,-->
<!--      total: parseFloat(newTreatment.total || 0),-->
<!--      remark: newTreatment.remark,-->
<!--      added_by: authStore.user.id-->
<!--    };-->

<!--    // 调用 Store 或 Axios 提交新单据-->
<!--    const addedRecord = await treatmentStore.createTreatment(payload);-->

<!--    // 清空并隐藏快捷添加表单-->
<!--    newTreatment.name = '';-->
<!--    newTreatment.total = '';-->
<!--    newTreatment.remark = '';-->
<!--    showAddTreatmentForm.value = false;-->

<!--    // 💡 重新拉取并自动选中刚建立的疗程项-->
<!--    await fetchPatientTreatments(selectedPatient.value.id);-->
<!--    if (addedRecord && addedRecord.id) {-->

<!--      form.treatment_id = addedRecord.id;-->
<!--    }-->
<!--  } catch (err) {-->
<!--    console.error(err);-->
<!--    showToast('Failed to save the new treatment', 'error');-->
<!--  }-->
<!--};-->

<!--const handleStartTimeChange = () => {-->
<!--  if (form.start_time) {-->
<!--    form.end_time = calculateEndTime(form.start_time);-->
<!--  }-->
<!--};-->

<!--// 🌟 核心监听：处理修改与新建的状态回显-->
<!--watch(() => [roomStore.roomSelected.isOpen, props.selectedAppointment, roomStore.roomSelected], async ([open, appointment, currentGrid]) => {-->
<!--  if (!open) return;-->

<!--  if (appointment) {-->
<!--    selectedPatient.value = {-->
<!--      id: appointment.customer_id || appointment.patient_id || appointment.id,-->
<!--      name: appointment.name || appointment.customer_name,-->
<!--      customer_name: appointment.customer_name,-->
<!--      phone: appointment.customer_phone || appointment.phone,-->
<!--      email: appointment.customer_email || appointment.email-->
<!--    };-->
<!--    form.treatment_id = appointment.treatment_id || '';-->
<!--    form.staff_id = appointment.assigned_staff || '';-->
<!--    form.date = toDateString(appointment.date || getDefaultBookingDate());-->
<!--    form.start_time = appointment.start_time ? appointment.start_time.substring(0, 5) : '';-->
<!--    form.end_time = appointment.end_time ? appointment.end_time.substring(0, 5) : '';-->
<!--    form.remark = appointment.remark || '';-->
<!--    form.treatment_name = appointment.treatment_name || appointment.title;-->

<!--    // 💡 回显状态下同步刷新疗程池-->
<!--    await fetchPatientTreatments(selectedPatient.value.id);-->
<!--  } else {-->
<!--    resetForm();-->
<!--    form.date = currentGrid?.date ? toDateString(currentGrid.date) : getDefaultBookingDate();-->

<!--    if (currentGrid.time) {-->
<!--      form.start_time = currentGrid.time.substring(0, 5);-->
<!--      form.end_time = calculateEndTime(form.start_time);-->
<!--    }-->
<!--  }-->
<!--}, { immediate: true, deep: true });-->

<!--watch(() => props.selectedDate, (newDate) => {-->
<!--  if (!roomStore.roomSelected.isOpen || props.selectedAppointment) return;-->
<!--  if (!newDate) return;-->
<!--  form.date = toDateString(newDate);-->
<!--});-->

<!--const handlePatientSearch = () => {-->
<!--  customerStore.searchCustomers(searchQuery.value);-->
<!--  if (searchTimeout) clearTimeout(searchTimeout);-->

<!--  if (searchQuery.value.trim().length < 2) {-->
<!--    searchResults.value = [];-->
<!--    return;-->
<!--  }-->

<!--  searching.value = true;-->
<!--  searchTimeout = setTimeout(() => {-->
<!--    searching.value = false;-->
<!--  }, 300);-->
<!--};-->

<!--const selectPatient = async (patient) => {-->
<!--  selectedPatient.value = patient;-->
<!--  searchQuery.value = '';-->
<!--  searchResults.value = [];-->
<!--  // 💡 患者选定，触发拉取-->
<!--  await fetchPatientTreatments(patient.id);-->
<!--};-->

<!--const clearPatientSelection = () => {-->
<!--  selectedPatient.value = null;-->
<!--  patientTreatments.value = [];-->
<!--  form.treatment_id = '';-->
<!--};-->

<!--const resetForm = () => {-->
<!--  selectedPatient.value = null;-->
<!--  patientTreatments.value = [];-->
<!--  showAddTreatmentForm.value = false;-->
<!--  searchQuery.value = '';-->
<!--  searchResults.value = [];-->
<!--  isForAPackage.value ='no';-->
<!--  form.treatment_id = '';-->
<!--  form.staff_id = '';-->
<!--  form.date = '';-->
<!--  form.start_time = '';-->
<!--  form.end_time = '';-->
<!--  form.remark = '';-->
<!--  form.treatment_name=''-->
<!--};-->

<!--const closeModal = () => {-->
<!--  roomStore.roomSelected.isOpen = false;-->
<!--  resetForm();-->
<!--  if (roomStore.roomSelected.appointment) {-->
<!--    roomStore.roomSelected.appointment = null;-->
<!--  }-->
<!--  emit('close');-->
<!--};-->

<!--const parseTimeMinutes = (value) => {-->
<!--  if (!value) return null;-->
<!--  const [hours, minutes] = String(value).split(':').map(Number);-->
<!--  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;-->
<!--  return hours * 60 + minutes;-->
<!--};-->

<!--const getStaffOverlapConflict = () => {-->
<!--  if (!form.staff_id || !form.date || !form.start_time || !form.end_time) return null;-->

<!--  const candidateStart = parseTimeMinutes(form.start_time);-->
<!--  const candidateEnd = parseTimeMinutes(form.end_time);-->
<!--  if (candidateStart === null || candidateEnd === null || candidateEnd <= candidateStart) return null;-->

<!--  const staffNameValue = staff.value.find(item => String(item.id) === String(form.staff_id))?.name || 'selected staff';-->

<!--  return (treatmentStore.appointments || []).find((appointment) => {-->
<!--    if (appointment?.id && props.selectedAppointment?.id && String(appointment.id) === String(props.selectedAppointment.id)) {-->
<!--      return false;-->
<!--    }-->

<!--    const appointmentDate = toDateString(appointment?.date || '');-->
<!--    if (appointmentDate && appointmentDate !== toDateString(form.date)) return false;-->

<!--    const appointmentStaffId = appointment?.staff_id ?? appointment?.assigned_staff ?? appointment?.staff?.id;-->
<!--    if (String(appointmentStaffId) !== String(form.staff_id)) return false;-->

<!--    const appointmentStart = parseTimeMinutes(appointment?.start_time);-->
<!--    const appointmentEnd = parseTimeMinutes(appointment?.end_time);-->
<!--    if (appointmentStart === null || appointmentEnd === null) return false;-->

<!--    return candidateStart < appointmentEnd && appointmentStart < candidateEnd;-->
<!--  }) ? {-->
<!--    staffName: staffNameValue,-->
<!--    appointment: (treatmentStore.appointments || []).find((appointment) => {-->
<!--      if (appointment?.id && props.selectedAppointment?.id && String(appointment.id) === String(props.selectedAppointment.id)) {-->
<!--        return false;-->
<!--      }-->

<!--      const appointmentDate = toDateString(appointment?.date || '');-->
<!--      if (appointmentDate && appointmentDate !== toDateString(form.date)) return false;-->

<!--      const appointmentStaffId = appointment?.staff_id ?? appointment?.assigned_staff ?? appointment?.staff?.id;-->
<!--      if (String(appointmentStaffId) !== String(form.staff_id)) return false;-->

<!--      const appointmentStart = parseTimeMinutes(appointment?.start_time);-->
<!--      const appointmentEnd = parseTimeMinutes(appointment?.end_time);-->
<!--      if (appointmentStart === null || appointmentEnd === null) return false;-->

<!--      return candidateStart < appointmentEnd && appointmentStart < candidateEnd;-->
<!--    })-->
<!--  } : null;-->
<!--};-->

<!--const handleSubmit = async () => {-->
<!--  const payload = {-->
<!--    id: props.selectedAppointment?.id,-->
<!--    room_id: roomStore.roomSelected.roomId || roomStore.roomSelected.id,-->
<!--    location: roomStore.roomSelected.location,-->
<!--    customer_id: selectedPatient.value.id,-->
<!--    treatment_id: form.treatment_id,-->
<!--    treatment_name: form.treatment_name || 'tbd',-->
<!--    staff_id: form.staff_id,-->
<!--    date: form.date,-->
<!--    start_time: form.start_time,-->
<!--    end_time: form.end_time,-->
<!--    remark: form.remark-->
<!--  };-->

<!--  try {-->
<!--    await treatmentStore.fetchAppointmentsByDate(form.date);-->

<!--    const overlapConflict = getStaffOverlapConflict();-->
<!--    if (overlapConflict) {-->
<!--      const conflict = overlapConflict.appointment;-->
<!--      const conflictMessage = `The assigned staff, ${overlapConflict.staffName}, already has an overlapping appointment from ${conflict?.start_time || '&#45;&#45;:&#45;&#45;'} to ${conflict?.end_time || '&#45;&#45;:&#45;&#45;'}. Do you want to continue anyway?`;-->
<!--      const shouldContinue = window.confirm(conflictMessage);-->
<!--      if (!shouldContinue) return;-->
<!--    }-->

<!--    if (isEditMode.value) {-->
<!--      await treatmentStore.updateAppointment(payload);-->
<!--      showToast('Appointment updated', 'success');-->
<!--      await treatmentStore.fetchAppointmentsByDate(form.date);-->

<!--    } else {-->
<!--      await treatmentStore.addAppointment(payload);-->
<!--      showToast('Appointment saved', 'success');-->
<!--      await treatmentStore.fetchAppointmentsByDate(form.date);-->
<!--    }-->
<!--    emit('saved');-->
<!--    closeModal();-->
<!--  } catch (error) {-->
<!--    console.error('Payload persistence execution failed:', error);-->
<!--    showToast('Failed to save the new appointment', 'error');-->
<!--  }-->
<!--};-->

<!--const handleOpenCusModal =()=>{-->
<!--  openCusModal.value=true-->
<!--  closeModal()-->
<!--}-->

<!--onMounted(async () => {-->
<!--  await staffStore.fetchStaff();-->
<!--});-->
<!--</script>-->

<!--<style scoped>-->
<!--/* 包含已有样式并追加以下高级交互样式设置 */-->
<!--.treatment-box {-->
<!--  background-color: #f8fafc;-->
<!--  border: 1px dashed #cbd5e1;-->
<!--  border-radius: 6px;-->
<!--  padding: 0.75rem;-->
<!--}-->

<!--.treatment-header {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--  margin-bottom: 0.4rem;-->
<!--}-->

<!--.text-link-btn {-->
<!--  background: none;-->
<!--  border: none;-->
<!--  color: #2563eb;-->
<!--  font-size: 0.78rem;-->
<!--  font-weight: 600;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.text-link-btn:hover {-->
<!--  text-decoration: underline;-->
<!--  color: #1d4ed8;-->
<!--}-->

<!--.inline-treatment-form {-->
<!--  background-color: #ffffff;-->
<!--  border: 1px solid #e2e8f0;-->
<!--  border-radius: 6px;-->
<!--  padding: 0.6rem;-->
<!--  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);-->
<!--}-->

<!--.inline-grid {-->
<!--  display: grid;-->
<!--  grid-template-columns: 3fr 2fr;-->
<!--  gap: 0.5rem;-->
<!--}-->

<!--.inner-group {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--}-->

<!--.text-xs {-->
<!--  font-size: 0.8rem !important;-->
<!--  padding: 0.35rem 0.5rem !important;-->
<!--}-->

<!--.mt-2 {-->
<!--  margin-top: 0.5rem;-->
<!--}-->

<!--.inline-actions {-->
<!--  display: flex;-->
<!--  justify-content: flex-end;-->
<!--}-->

<!--.btn-sub-save {-->
<!--  background-color: #10b981;-->
<!--  /* Emerald Green */-->
<!--  color: #ffffff;-->
<!--  border: none;-->
<!--  font-size: 0.75rem;-->
<!--  font-weight: 600;-->
<!--  padding: 0.3rem 0.8rem;-->
<!--  border-radius: 4px;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.btn-sub-save:hover:not(:disabled) {-->
<!--  background-color: #059669;-->
<!--}-->

<!--.btn-sub-save:disabled {-->
<!--  background-color: #cbd5e1;-->
<!--  cursor: not-allowed;-->
<!--}-->

<!--/* 之前提供的基础样式继续保持底层完整继承 */-->
<!--.modal-overlay {-->
<!--  position: fixed;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100vw;-->
<!--  height: 100vh;-->
<!--  background-color: rgba(15, 23, 42, 0.4);-->
<!--  display: flex;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  z-index: 1100;-->
<!--  backdrop-filter: blur(2px);-->
<!--}-->

<!--.modal-container {-->
<!--  background-color: #ffffff;-->
<!--  border-radius: 8px;-->
<!--  width: 90%;-->
<!--  max-width: 600px;-->
<!--  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);-->
<!--  color: #0f172a;-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  border: 1px solid #e2e8f0;-->
<!--}-->

<!--.modal-header {-->
<!--  padding: 1.25rem 1.5rem;-->
<!--  border-bottom: 1px solid #e2e8f0;-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--  background-color: #f8fafc;-->
<!--  border-radius: 8px 8px 0 0;-->
<!--}-->

<!--.modal-header h2 {-->
<!--  font-size: 1.15rem;-->
<!--  color: #1e3a8a;-->
<!--  margin: 0;-->
<!--  font-weight: 600;-->
<!--}-->

<!--.close-btn {-->
<!--  background: none;-->
<!--  border: none;-->
<!--  color: #94a3b8;-->
<!--  font-size: 1.5rem;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.close-btn:hover {-->
<!--  color: #ef4444;-->
<!--}-->

<!--.modal-content {-->
<!--  padding: 1.5rem;-->
<!--}-->

<!--.context-banner {-->
<!--  background-color: #eff6ff;-->
<!--  border: 1px solid #bfdbfe;-->
<!--  border-radius: 6px;-->
<!--  padding: 0.75rem 1rem;-->
<!--  display: flex;-->
<!--  gap: 2rem;-->
<!--  margin-bottom: 1.25rem;-->
<!--}-->

<!--.context-item {-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  font-size: 0.85rem;-->
<!--}-->

<!--.context-item .label {-->
<!--  color: #475569;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.context-item .value {-->
<!--  color: #0f172a;-->
<!--  font-weight: 600;-->
<!--  margin-left: 3px;-->
<!--}-->

<!--.context-item .value-tag {-->
<!--  color: #1d4ed8;-->
<!--  font-weight: 700;-->
<!--  font-size: 0.9rem;-->
<!--}-->

<!--.booking-form {-->
<!--  display: grid;-->
<!--  grid-template-columns: repeat(2, 1fr);-->
<!--  gap: 1rem;-->
<!--}-->

<!--.full-width {-->
<!--  grid-column: span 2;-->
<!--}-->

<!--.row-span {-->
<!--  grid-column: span 2;-->
<!--  position: relative;-->
<!--}-->

<!--.form-group {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  gap: 0.35rem;-->
<!--}-->

<!--.form-label {-->
<!--  font-size: 0.85rem;-->
<!--  font-weight: 600;-->
<!--  color: #334155;-->
<!--}-->

<!--/* Layout the radio buttons horizontally */-->
<!--.radio-group {-->
<!--  display: flex;-->
<!--  flex-direction: row;-->
<!--  align-items: center;-->
<!--  gap: 16px; /* Space between radio options */-->
<!--  margin-top: 6px;-->
<!--}-->

<!--/* Align the circle nicely with the text inside each option */-->
<!--.radio-label {-->
<!--  display: inline-flex;-->
<!--  align-items: center;-->
<!--  gap: 6px; /* Space between radio dot and text */-->
<!--  cursor: pointer;-->
<!--}-->

<!--.required {-->
<!--  color: #ef4444;-->
<!--  margin-left: 2px;-->
<!--}-->

<!--.form-input,-->
<!--.form-textarea {-->
<!--  background-color: #ffffff;-->
<!--  border: 1px solid #cbd5e1;-->
<!--  border-radius: 6px;-->
<!--  color: #0f172a;-->
<!--  padding: 0.5rem 0.75rem;-->
<!--  font-size: 0.9rem;-->
<!--  width: 100%;-->
<!--  box-sizing: border-box;-->
<!--}-->

<!--.selected-patient-card {-->
<!--  background-color: #f1f5f9;-->
<!--  border: 1px solid #cbd5e1;-->
<!--  padding: 0.6rem 0.8rem;-->
<!--  border-radius: 6px;-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--  align-items: center;-->
<!--}-->

<!--.patient-info {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  font-size: 0.85rem;-->
<!--}-->

<!--.remove-patient-btn {-->
<!--  background: none;-->
<!--  border: 1px solid #64748b;-->
<!--  color: #475569;-->
<!--  padding: 0.2rem 0.5rem;-->
<!--  border-radius: 4px;-->
<!--  font-size: 0.75rem;-->
<!--  cursor: pointer;-->
<!--}-->
<!--.search-input-wrapper {-->
<!--  display: flex;-->
<!--  justify-content: space-between;-->
<!--}-->

<!--.search-input{-->
<!--  width: 60%;-->
<!--}-->
<!--.search-results-dropdown {-->
<!--  position: absolute;-->
<!--  top: 100%;-->
<!--  left: 0;-->
<!--  right: 0;-->
<!--  background-color: #ffffff;-->
<!--  border: 1px solid #cbd5e1;-->
<!--  border-radius: 6px;-->
<!--  max-height: 200px;-->
<!--  overflow-y: auto;-->
<!--  z-index: 1200;-->
<!--  list-style: none;-->
<!--  padding: 0;-->
<!--  margin: 4px 0 0 0;-->
<!--  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--.search-results-dropdown li {-->
<!--  padding: 0.6rem 0.8rem;-->
<!--  cursor: pointer;-->
<!--  border-bottom: 1px solid #f1f5f9;-->
<!--}-->

<!--.search-results-dropdown li:hover {-->
<!--  background-color: #f1f5f9;-->
<!--}-->

<!--.search-row-main {-->
<!--  font-size: 0.85rem;-->
<!--  font-weight: 600;-->
<!--  color: #0f172a;-->
<!--}-->

<!--.search-row-sub {-->
<!--  font-size: 0.75rem;-->
<!--  color: #64748b;-->
<!--}-->

<!--.no-results-hint {-->
<!--  font-size: 0.75rem;-->
<!--  color: #94a3b8;-->
<!--  margin-top: 4px;-->
<!--  font-style: italic;-->
<!--}-->

<!--.form-actions {-->
<!--  grid-column: span 2;-->
<!--  display: flex;-->
<!--  justify-content: flex-end;-->
<!--  gap: 0.75rem;-->
<!--  margin-top: 1rem;-->
<!--  border-top: 1px solid #e2e8f0;-->
<!--  padding-top: 1rem;-->
<!--}-->

<!--.btn-primary {-->
<!--  background-color: #2563eb;-->
<!--  color: white;-->
<!--  border: none;-->
<!--  padding: 0.5rem 1.25rem;-->
<!--  border-radius: 6px;-->
<!--  font-weight: 600;-->
<!--  cursor: pointer;-->
<!--}-->

<!--.btn-primary:disabled {-->
<!--  background-color: #94a3b8;-->
<!--  cursor: not-allowed;-->
<!--  opacity: 0.6;-->
<!--}-->

<!--.btn-secondary {-->
<!--  background: none;-->
<!--  border: 1px solid #cbd5e1;-->
<!--  color: #475569;-->
<!--  padding: 0.5rem 1.25rem;-->
<!--  border-radius: 6px;-->
<!--  font-weight: 500;-->
<!--  cursor: pointer;-->
<!--}-->
<!--</style>-->

<template>
  <div v-if="roomStore.roomSelected.isOpen" class="modal-overlay">
    <div class="modal-container">

      <div class="modal-header">
        <h2>{{ isEditMode ? 'Modify Appointment Details' : 'Schedule New Appointment' }}</h2>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>

      <div class="modal-content">
        <div class="context-banner">
          <div class="context-item">
            <span class="label">Location:</span>
            <span class="value-tag">{{ roomStore.roomSelected.location }}</span>
          </div>
          <div class="context-item">
            <span class="label">Assigned Room:</span>
            <span class="value">{{ roomStore.roomSelected.roomName }}</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="booking-form">

          <div class="form-group row-span">
            <label class="form-label">
              {{ isEditMode ? 'Edit Appointment' : 'Customer Search' }}
              <span class="required">*</span>
            </label>

            <div v-if="selectedPatient" class="selected-patient-card">
              <div class="patient-info">
                <span>
                  <strong>{{ selectedPatient.name }}</strong>
                  <span v-if="selectedPatient.customer_name"> · {{ selectedPatient.customer_name }}</span>
                  <span v-if="selectedPatient.phone"> · {{ selectedPatient.phone }}</span>
                  <span v-if="selectedPatient.email"> · {{ selectedPatient.email }}</span>
                </span>
              </div>
              <button v-if="!isEditMode" type="button" class="remove-patient-btn" @click="clearPatientSelection">
                Change
              </button>
            </div>

            <div v-else class="search-combobox-wrapper">
              <div class="search-input-wrapper">
                <input
                    type="text"
                    v-model="searchQuery"
                    placeholder="Search by customer name, phone, or email..."
                    class="form-input search-input"
                    @input="handlePatientSearch"
                />
                <button type="button" class="search-btn" @click="handleOpenCusModal">Add new customer</button>
              </div>
              <ul v-if="customers.length > 0" class="search-results-dropdown">
                <li v-for="patient in customers" :key="patient.id" @click="selectPatient(patient)">
                  <div class="search-row-main">{{ patient.name }}</div>
                  <div class="search-row-sub">{{ patient.phone }} | {{ patient.email }}</div>
                </li>
              </ul>
              <div v-if="searchQuery && customers.length === 0 && !searching" class="no-results-hint">
                No matching customers found.
              </div>
            </div>
          </div>

          <div class="form-group" v-if="selectedPatient && !isEditMode">
            <label class="form-label">Is this appointment for a package?</label>
            <div class="radio-group">
              <label v-for="type in appointmentTypes" :key="type.id" class="radio-label">
                <input type="radio" :value="type.id" v-model="isForAPackage" />
                {{ type.name }}
              </label>
            </div>
          </div>

          <!-- Package Section -->
          <div v-if="selectedPatient && isForAPackage === 'yes'" class="form-group full-width treatment-box">
            <div class="treatment-header">
              <label class="form-label">Link Package Plan</label>
              <button type="button" class="text-link-btn" @click="showAddTreatmentForm = !showAddTreatmentForm">
                {{ showAddTreatmentForm ? '✕ Cancel New' : '＋ Add New Treatment' }}
              </button>
            </div>

            <div v-if="showAddTreatmentForm" class="inline-treatment-form">
              <div class="inline-grid">
                <div class="inner-group">
                  <input
                      type="text"
                      v-model="newTreatment.name"
                      placeholder="Treatment Name *"
                      class="form-input text-xs"
                  />
                </div>
                <div class="inner-group">
                  <input
                      type="number"
                      step="0.01"
                      v-model="newTreatment.total"
                      placeholder="Total Price ($) *"
                      class="form-input text-xs"
                  />
                </div>
              </div>
              <div class="inner-group mt-2">
                <textarea
                    v-model="newTreatment.remark"
                    placeholder="Treatment Remarks..."
                    class="form-textarea text-xs"
                    rows="1"
                ></textarea>
              </div>
              <div class="inline-actions mt-2">
                <button
                    type="button"
                    class="btn-sub-save"
                    :disabled="!newTreatment.name"
                    @click="handleInlineTreatmentSubmit"
                >
                  Save Treatment
                </button>
              </div>
            </div>

            <select v-else v-model="form.treatment_id" class="form-input">
              <option value="">-- Select a treatment package --</option>
              <option v-for="t in patientTreatments" :key="t.id" :value="t.id">
                {{ t.name }} (Total: ${{ t.total }} | Balance: ${{ t.balance }})
              </option>
            </select>
          </div>

          <!-- Single Treatment Name Input -->
          <div class="form-group" v-if="selectedPatient && isForAPackage === 'no'">
            <label class="form-label">Treatment Name <span class="required">*</span></label>
            <input v-model="form.treatment_name" class="form-input" required placeholder="e.g., General Consultation" />
          </div>

          <div class="form-group">
            <label class="form-label">Assigned Staff <span class="required">*</span></label>
            <select v-model="form.staff_id" class="form-input" required>
              <option value="" disabled>Select Staff Member</option>
              <option v-for="s in staff" :key="s.id" :value="s.id">
                {{ s.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Appointment Date <span class="required">*</span></label>
            <input type="date" v-model="form.date" class="form-input" required />
          </div>

          <div class="form-group">
            <label class="form-label">Start Time <span class="required">*</span></label>
            <select class="form-input" v-model="form.start_time" @change="handleStartTimeChange" required>
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">End Time <span class="required">*</span></label>
            <select class="form-input" v-model="form.end_time" required>
              <option v-for="t in timeSlots" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="form-group full-width">
            <label class="form-label">Special Remarks / Notes</label>
            <textarea
                v-model="form.remark"
                placeholder="Add clinical constraints, treatment requirements, or check-in notes..."
                class="form-textarea"
                rows="3"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="!selectedPatient || !form.staff_id">
              {{ isEditMode ? 'Save Changes' : 'Confirm Appointment' }}
            </button>
          </div>
        </form>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue';
import { useRoomStore } from "@/stores/room.js";
import { useStaffStore } from "@/stores/staff.js";
import { useTreatmentStore } from "@/stores/treatment.js";
import { useCustomerStore } from "@/stores/customer.js";
import { useAuthStore } from "@/stores/auth.js";
import { storeToRefs } from "pinia";
import { generateDurationSlots, calculateEndTime, toDateString } from "@/utils/formatDate.js";
import { useToast } from "@/composables/useToast.js";

const { showToast } = useToast();

const props = defineProps({
  selectedAppointment: { type: Object, default: null },
  selectedDate: { type: Date, default: null },
});

const emit = defineEmits(['close', 'saved','addNewCus']);

const timeSlots = ref(generateDurationSlots());

const roomStore = useRoomStore();
const staffStore = useStaffStore();
const customerStore = useCustomerStore();
const treatmentStore = useTreatmentStore();
const authStore = useAuthStore();

const { staff } = storeToRefs(staffStore);
const { customers } = storeToRefs(customerStore);

const isEditMode = computed(() => !!props.selectedAppointment);

const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);
const selectedPatient = ref(null);
let searchTimeout = null;

const patientTreatments = ref([]);
const showAddTreatmentForm = ref(false);

const appointmentTypes = [
  { id: 'no', name: 'No' },
  { id: 'yes', name: 'Yes' },
];

const isForAPackage = ref('no');

const newTreatment = reactive({
  name: '',
  total: '',
  remark: ''
});

const form = reactive({
  treatment_id: '',
  treatment_name: '',
  staff_id: '',
  date: props.selectedDate ? toDateString(props.selectedDate) : '',
  start_time: '',
  end_time: '',
  remark: ''
});

const getDefaultBookingDate = () => {
  if (props.selectedDate) return toDateString(props.selectedDate);
  return toDateString(new Date());
};

const fetchPatientTreatments = async (customerId) => {
  if (!customerId) return;
  try {
    const data = await treatmentStore.fetchTreatmentsByCustomer(customerId);
    patientTreatments.value = data || [];
  } catch (err) {
    console.error('Failed to load treatments for patient:', err);
    showToast('Failed to load treatments', 'error');
  }
};

const handleInlineTreatmentSubmit = async () => {
  if (!newTreatment.name) return;
  try {
    const payload = {
      customer_id: selectedPatient.value.id,
      name: newTreatment.name,
      total: parseFloat(newTreatment.total || 0),
      remark: newTreatment.remark,
      added_by: authStore.user?.id
    };

    const addedRecord = await treatmentStore.createTreatment(payload);

    newTreatment.name = '';
    newTreatment.total = '';
    newTreatment.remark = '';
    showAddTreatmentForm.value = false;

    await fetchPatientTreatments(selectedPatient.value.id);
    if (addedRecord && addedRecord.id) {
      form.treatment_id = addedRecord.id;
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to save the new treatment', 'error');
  }
};

const handleStartTimeChange = () => {
  if (form.start_time) {
    form.end_time = calculateEndTime(form.start_time);
  }
};

watch(
    () => [roomStore.roomSelected.isOpen, props.selectedAppointment, roomStore.roomSelected],
    async ([open, appointment, currentGrid]) => {
      if (!open) return;

      if (appointment) {
        selectedPatient.value = {
          id: appointment.customer_id || appointment.patient_id || appointment.id,
          name: appointment.name || appointment.customer_name,
          customer_name: appointment.customer_name,
          phone: appointment.customer_phone || appointment.phone,
          email: appointment.customer_email || appointment.email
        };

        form.treatment_id = appointment.treatment_id || '';
        isForAPackage.value = appointment.treatment_id ? 'yes' : 'no';

        form.staff_id = appointment.assigned_staff || appointment.staff_id || '';
        form.date = toDateString(appointment.date || getDefaultBookingDate());
        form.start_time = appointment.start_time ? appointment.start_time.substring(0, 5) : '';
        form.end_time = appointment.end_time ? appointment.end_time.substring(0, 5) : '';
        form.remark = appointment.remark || '';
        form.treatment_name = appointment.treatment_name || appointment.title || '';

        await fetchPatientTreatments(selectedPatient.value.id);
      } else {
        resetForm();
        form.date = currentGrid?.date ? toDateString(currentGrid.date) : getDefaultBookingDate();

        if (currentGrid?.time) {
          form.start_time = currentGrid.time.substring(0, 5);
          form.end_time = calculateEndTime(form.start_time);
        }
      }
    },
    { immediate: true, deep: true }
);

watch(() => props.selectedDate, (newDate) => {
  if (!roomStore.roomSelected.isOpen || props.selectedAppointment || !newDate) return;
  form.date = toDateString(newDate);
});

const handlePatientSearch = () => {
  customerStore.searchCustomers(searchQuery.value);
  if (searchTimeout) clearTimeout(searchTimeout);

  if (searchQuery.value.trim().length < 2) {
    searchResults.value = [];
    return;
  }

  searching.value = true;
  searchTimeout = setTimeout(() => {
    searching.value = false;
  }, 300);
};

const selectPatient = async (patient) => {
  selectedPatient.value = patient;
  searchQuery.value = '';
  searchResults.value = [];
  await fetchPatientTreatments(patient.id);
};

const clearPatientSelection = () => {
  selectedPatient.value = null;
  patientTreatments.value = [];
  form.treatment_id = '';
};

const resetForm = () => {
  selectedPatient.value = null;
  patientTreatments.value = [];
  showAddTreatmentForm.value = false;
  searchQuery.value = '';
  searchResults.value = [];
  isForAPackage.value = 'no';
  form.treatment_id = '';
  form.staff_id = '';
  form.date = '';
  form.start_time = '';
  form.end_time = '';
  form.remark = '';
  form.treatment_name = '';
};

const closeModal = () => {
  roomStore.roomSelected.isOpen = false;
  resetForm();
  if (roomStore.roomSelected.appointment) {
    roomStore.roomSelected.appointment = null;
  }
  emit('close');
};

const parseTimeMinutes = (value) => {
  if (!value) return null;
  const [hours, minutes] = String(value).split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const getStaffOverlapConflict = () => {
  if (!form.staff_id || !form.date || !form.start_time || !form.end_time) return null;

  const candidateStart = parseTimeMinutes(form.start_time);
  const candidateEnd = parseTimeMinutes(form.end_time);
  if (candidateStart === null || candidateEnd === null || candidateEnd <= candidateStart) return null;

  const staffNameValue = staff.value.find(item => String(item.id) === String(form.staff_id))?.name || 'selected staff';

  const conflictingAppointment = (treatmentStore.appointments || []).find((appointment) => {
    if (appointment?.id && props.selectedAppointment?.id && String(appointment.id) === String(props.selectedAppointment.id)) {
      return false;
    }

    const appointmentDate = toDateString(appointment?.date || '');
    if (appointmentDate && appointmentDate !== toDateString(form.date)) return false;

    const appointmentStaffId = appointment?.staff_id ?? appointment?.assigned_staff ?? appointment?.staff?.id;
    if (String(appointmentStaffId) !== String(form.staff_id)) return false;

    const appointmentStart = parseTimeMinutes(appointment?.start_time);
    const appointmentEnd = parseTimeMinutes(appointment?.end_time);
    if (appointmentStart === null || appointmentEnd === null) return false;

    return candidateStart < appointmentEnd && appointmentStart < candidateEnd;
  });

  return conflictingAppointment ? { staffName: staffNameValue, appointment: conflictingAppointment } : null;
};

const handleSubmit = async () => {
  const payload = {
    id: props.selectedAppointment?.id,
    room_id: roomStore.roomSelected.roomId || roomStore.roomSelected.id,
    location: roomStore.roomSelected.location,
    customer_id: selectedPatient.value.id,
    treatment_id: isForAPackage.value === 'yes' ? form.treatment_id : null,
    treatment_name: isForAPackage.value === 'no' ? form.treatment_name : 'Package Plan',
    staff_id: form.staff_id,
    date: form.date,
    start_time: form.start_time,
    end_time: form.end_time,
    remark: form.remark
  };

  try {
    await treatmentStore.fetchAppointmentsByDate(form.date);

    const overlapConflict = getStaffOverlapConflict();
    if (overlapConflict) {
      const conflict = overlapConflict.appointment;
      const conflictMessage = `The assigned staff, ${overlapConflict.staffName}, already has an overlapping appointment from ${conflict?.start_time || '--:--'} to ${conflict?.end_time || '--:--'}. Do you want to continue anyway?`;
      if (!window.confirm(conflictMessage)) return;
    }

    if (isEditMode.value) {
      await treatmentStore.updateAppointment(payload);
      showToast('Appointment updated', 'success');
    } else {
      await treatmentStore.addAppointment(payload);
      showToast('Appointment saved', 'success');
    }

    await treatmentStore.fetchAppointmentsByDate(form.date);
    emit('saved');
    closeModal();
  } catch (error) {
    console.error('Payload persistence execution failed:', error);
    showToast('Failed to save the new appointment', 'error');
  }
};

const handleOpenCusModal = () => {
  emit('addNewCus')
  closeModal();
};

onMounted(async () => {
  await staffStore.fetchStaff();
});

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});
</script>

<style scoped>
/* Keeping all your original scoped styles intact */
.treatment-box {
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
  padding: 0.75rem;
}

.treatment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.text-link-btn {
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.text-link-btn:hover {
  text-decoration: underline;
  color: #1d4ed8;
}

.inline-treatment-form {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.6rem;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02);
}

.inline-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 0.5rem;
}

.inner-group {
  display: flex;
  flex-direction: column;
}

.text-xs {
  font-size: 0.8rem !important;
  padding: 0.35rem 0.5rem !important;
}

.mt-2 {
  margin-top: 0.5rem;
}

.inline-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-sub-save {
  background-color: #10b981;
  color: #ffffff;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-sub-save:hover:not(:disabled) {
  background-color: #059669;
}

.btn-sub-save:disabled {
  background-color: #cbd5e1;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(2px);
}

.modal-container {
  background-color: #ffffff;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  color: #0f172a;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.modal-header h2 {
  font-size: 1.15rem;
  color: #1e3a8a;
  margin: 0;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-content {
  padding: 1.5rem;
}

.context-banner {
  background-color: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 0.75rem 1rem;
  display: flex;
  gap: 2rem;
  margin-bottom: 1.25rem;
}

.context-item {
  display: flex;
  flex-direction: row;
  font-size: 0.85rem;
}

.context-item .label {
  color: #475569;
  font-weight: 500;
}

.context-item .value {
  color: #0f172a;
  font-weight: 600;
  margin-left: 3px;
}

.context-item .value-tag {
  color: #1d4ed8;
  font-weight: 700;
  font-size: 0.9rem;
}

.booking-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.full-width {
  grid-column: span 2;
}

.row-span {
  grid-column: span 2;
  position: relative;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.radio-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-top: 6px;
}

.radio-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.form-input,
.form-textarea {
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #0f172a;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  width: 100%;
  box-sizing: border-box;
}

.selected-patient-card {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  padding: 0.6rem 0.8rem;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.patient-info {
  display: flex;
  flex-direction: column;
  font-size: 0.85rem;
}

.remove-patient-btn {
  background: none;
  border: 1px solid #64748b;
  color: #475569;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
}

.search-input-wrapper {
  display: flex;
  justify-content: space-between;
}

.search-input {
  width: 60%;
}

.search-results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1200;
  list-style: none;
  padding: 0;
  margin: 4px 0 0 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.search-results-dropdown li {
  padding: 0.6rem 0.8rem;
  cursor: pointer;
  border-bottom: 1px solid #f1f5f9;
}

.search-results-dropdown li:hover {
  background-color: #f1f5f9;
}

.search-row-main {
  font-size: 0.85rem;
  font-weight: 600;
  color: #0f172a;
}

.search-row-sub {
  font-size: 0.75rem;
  color: #64748b;
}

.no-results-hint {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 4px;
  font-style: italic;
}

.form-actions {
  grid-column: span 2;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: none;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
</style>