<template>
  <div class="calendar-page-container">
    <div class="date-selector-sticky-zone">
      <DateSelector v-model="selectedDate" />
      <ActivityLog />
    </div>
    <div class="calendar-grid-canvas">
      <Calendar :rooms="NYRooms" location="NY" :appointments="NYAppointments" />
      <Calendar :rooms="RHRooms" location="RH" :appointments="RHAppointments" />
    </div>

    <BookingModal :selected-appointment="roomStore.roomSelected.appointment"
      :selectedDate="selectedDate" @addNewCus="handleAddNewCus"/>
    <CustomerModal :visible="openCusModal" @close="openCusModal=false"/>

  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import Calendar from "@/components/Calendar.vue";
import BookingModal from "@/components/BookingModal.vue";
import DateSelector from "@/components/DateSelector.vue";
import ActivityLog from "@/components/ActivityLog.vue";
import CustomerModal from "@/components/CustomerModal.vue";
import { useRoomStore } from "@/stores/room.js";
import { useTreatmentStore } from "@/stores/treatment.js";
import { toDateString } from "@/utils/formatDate.js";

const roomStore = useRoomStore();
const treatmentStore = useTreatmentStore();

const { rooms } = storeToRefs(roomStore);
const { appointments } = storeToRefs(treatmentStore);

const selectedDate = ref(new Date())

//customer modal
const openCusModal = ref(false);

const NYRooms = computed(() => (rooms.value || []).filter(r => normalizeLocation(r.location) === 'NY'))
const RHRooms = computed(() => (rooms.value || []).filter(r => normalizeLocation(r.location) === 'RH'))

const normalizeLocation = (location) => {
  const value = String(location || '').trim().toUpperCase()
  if (value.includes('RH') || value.includes('RICHMOND') || value.includes('HILL')) return 'RH'
  if (value.includes('NY') || value.includes('NEW YORK') || value.includes('NORTH YORK')) return 'NY'
  return value
}

const getAppointmentLocation = (appointment) => {
  const appointmentRoomId = appointment?.room_id ?? appointment?.roomId ?? appointment?.room ?? appointment?.room?.id;
  const matchingRoom = (rooms.value || []).find(room => Number(room.id) === Number(appointmentRoomId))

  if (matchingRoom?.location) {
    return normalizeLocation(matchingRoom.location)
  }

  return normalizeLocation(appointment?.location || appointment?.room_location || appointment?.room?.location)
}

const NYAppointments = computed(() => (appointments.value || []).filter(t => getAppointmentLocation(t) === 'NY'))
const RHAppointments = computed(() => (appointments.value || []).filter(t => getAppointmentLocation(t) === 'RH'))

const handleAddNewCus=()=>{
  openCusModal.value = true
}


watch(selectedDate, async (newDate) => {
  if (!newDate) return
  const dateStr = toDateString(newDate)
  await treatmentStore.fetchAppointmentsByDate(dateStr)
}, { immediate: true })

onMounted(async () => {
  await roomStore.fetchRooms()
  await treatmentStore.fetchAppointmentsByDate(selectedDate.value)
})
</script>

<style scoped>
.calendar-page-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1.5rem;
  width: 100%;
}

.date-selector-sticky-zone {
  position: sticky;
  top: 1rem;
  flex-shrink: 0;
  width: 260px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
}

.calendar-grid-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}
</style>