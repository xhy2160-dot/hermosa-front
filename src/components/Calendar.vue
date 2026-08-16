<template>
  <div class="calendar-wrapper">
    <div class="calendar-grid" :style="{ gridTemplateColumns: `80px repeat(${(rooms || []).length}, 1fr)` }">
      <div class="grid-header-cell time-corner">{{ location }}</div>

      <div v-for="room in rooms" :key="room.id" class="grid-header-cell room-header">
        {{ room.name }}
      </div>

      <template v-for="row in grid" :key="row.time">
        <div class="time-label-cell">{{ row.time }}</div>

        <div v-for="cell in row.cells" :key="`${row.time}-${cell.room.id}`" class="calendar-slot-cell"
          @click="handleSlotClick(row.time, cell.room.id, cell.room.name, location, row, cell)">
          <template v-if="cell.event">
            <!-- 1. The Appointment Card -->
            <div class="calendar-event-card" :style="getEventStyle(cell.event)"
              @mouseenter="handleCardEnter(cell.event.id)" @mouseleave="handleMouseLeave"
              @click.stop="handleEventClick(cell.event, row.time, cell.room.id, cell.room.name, location)">
              <button type="button" class="cancel-btn" :disabled="cancellingId === cell.event.id"
                :aria-label="`Cancel appointment: ${cell.event.treatment_name}`"
                @click.stop="handleCancelAppointment(cell.event)">
                ×
              </button>
              <div class="event-body">
                <div class="event-main">
                  <div class="event-title">
                    {{ `${cell.event.title } (${cell.event.customer_name} - ${cell.event.customer_phone})` }}
                    <span v-if="cell.event.assigned_staff" class="event-meta">
                      {{ formatTimeShort(cell.event.start_time) }} ({{ cell.event.staff_name }})
                    </span>
                  </div>
                  <!--                  <div class="event-title">{{ `${cell.event.treatment_name} (${cell.event.customer_name} - ${cell.event.customer_phone})` }}</div>-->
                  <!--                  <div class="event-meta">-->
                  <!--                    <span v-if="cell.event.assigned_staff">-->
                  <!--                      {{ formatTimeShort(cell.event.start_time) }} ({{ cell.event.staff_name }})-->
                  <!--                    </span>-->
                  <!--                  </div>-->
                </div>
              </div>
            </div>

            <!-- 2. The Hover Popover (Remarks Section) -->
            <div v-if="shouldShowPopover(cell.event)" class="remark-popover"
              :class="{ 'remark-popover--left': cell.isNearRightEdge }" role="dialog"
              :aria-label="`Remark for ${cell.event.treatment_name}`" @mouseenter="handlePopoverEnter(cell.event.id)"
              @mouseleave="handleMouseLeave" @click.stop>
              <div class="popover-arrow" :class="{ 'popover-arrow--left': cell.isNearRightEdge }"></div>
              <div class="remark-section">
                <template v-if="isEditingRemark(cell.event)">
                  <textarea v-model="remarkDraft" class="remark-textarea" rows="3" aria-label="Edit appointment remark"
                    @keydown.esc="cancelEditing" @click.stop />
                  <div class="popover-actions">
                    <button class="remark-cancel" type="button" @click.stop="cancelEditing">Cancel</button>
                    <button class="remark-save" type="button" :disabled="isSaving" @click.stop="saveRemark(cell.event)">
                      {{ isSaving ? 'Saving…' : 'Save' }}
                    </button>
                  </div>
                </template>
                <template v-else>
                  <div class="remark-display">
                    {{ displayedRemark(cell.event) || 'No remark added yet.' }}
                  </div>
                  <button class="remark-trigger" type="button" @click.stop="startEditingRemark(cell.event)">
                    {{ displayedRemark(cell.event) ? 'Edit Remark' : 'Add Remark' }}
                  </button>
                </template>
              </div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoomStore } from "@/stores/room.js";
import { useTreatmentStore } from "@/stores/treatment.js";
import { useCustomerStore } from "@/stores/customer.js";
import { generateDurationSlots } from "@/utils/formatDate.js";
import { useToast } from "@/composables/useToast.js";
import { getEventColors } from "@/utils/colorGenerator.js";

const roomStore = useRoomStore();
const treatmentStore = useTreatmentStore();
const customerStore = useCustomerStore();
const { showToast } = useToast();

const props = defineProps({
  rooms: {
    type: Array,
    default: () => []
  },
  location: {
    type: String,
    default: ''
  },
  appointments: {
    type: [Array, Object],
    default: () => []
  }
});

const timeSlots = generateDurationSlots();
const SLOT_HEIGHT = 30;
const RIGHT_EDGE_COLUMN_THRESHOLD = 2; // flip popover left when this many columns (or fewer) remain

// --- Remark editing state ---
const editingRemarkId = ref(null);
const remarkDraft = ref("");
const isSaving = ref(false);
const cancellingId = ref(null);
// Optimistic overlay so we never mutate the appointments prop directly.
const pendingRemarks = ref({});

// --- Hover / popover state ---
// A single id (not a boolean) so only the popover belonging to the
// hovered/editing event shows — hovering one popover must not flip a
// global flag that every cell's shouldShowPopover checks.
const hoveredEventId = ref(null);
let hideTimeout = null;

const formatTimeShort = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
};

const getAppointmentTime = (appointment) => {
  if (!appointment) return '';
  const rawTime = appointment.start_time ?? appointment.time ?? appointment.start ?? appointment.appointment_time ?? '';
  return String(rawTime).trim().substring(0, 5);
};

const getAppointmentEndTime = (appointment) => {
  if (!appointment) return '';
  const rawTime = appointment.end_time ?? appointment.end ?? appointment.endTime ?? appointment.appointment_end_time ?? '';
  return String(rawTime).trim().substring(0, 5);
};

const getTimeInMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [hours, minutes] = String(timeStr).split(':').slice(0, 2).map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
};

const getDurationSlots = (appointment) => {
  const startMinutes = getTimeInMinutes(getAppointmentTime(appointment));
  const endMinutes = getTimeInMinutes(getAppointmentEndTime(appointment));

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return 1;
  }

  const intervalMinutes = 30;
  return Math.max(1, Math.ceil((endMinutes - startMinutes) / intervalMinutes));
};

const getAppointmentRoomId = (appointment) => {
  if (!appointment) return null;
  const id = appointment.room_id ?? appointment.roomId ?? appointment.room ?? appointment.room?.id ?? null;
  return id === null || id === undefined ? null : Number(id);
};

// Build a single lookup map of the appointment list once per render,
// instead of re-scanning the full list for every cell/field access.
const appointmentList = computed(() => {
  return Array.isArray(props.appointments)
    ? props.appointments
    : (props.appointments?.data || []);
});

const eventsByKey = computed(() => {
  const map = new Map();
  for (const appointment of appointmentList.value) {
    if (!appointment) continue;
    const roomId = getAppointmentRoomId(appointment);
    if (roomId === null) continue;
    const time = getAppointmentTime(appointment);
    if (!time) continue;
    map.set(`${time}__${roomId}`, appointment);
  }
  return map;
});

// Precomputed grid: each cell already carries its resolved event (or null),
// so the template never has to call a lookup function repeatedly.
const grid = computed(() => {
  const roomCount = (props.rooms || []).length;
  return timeSlots.map((time) => ({
    time,
    cells: (props.rooms || []).map((room, index) => ({
      room,
      event: eventsByKey.value.get(`${time}__${Number(room.id)}`) || null,
      isNearRightEdge: roomCount - index <= RIGHT_EDGE_COLUMN_THRESHOLD
    }))
  }));
});

const getEventStyle = (event) => {
  if (!event) return {};

  const durationSlots = getDurationSlots(event);
  const isThisCardActive = hoveredEventId.value === event.id || editingRemarkId.value === event.id;
  const colors = getEventColors(event.treatment_name);

  return {
    height: `${durationSlots * SLOT_HEIGHT - 6}px`,
    zIndex: isThisCardActive ? 50 : 10,
    display: 'block',
    background: `linear-gradient(135deg, ${colors.bgStart} 0%, ${colors.bgEnd} 100%)`,
    borderLeftColor: colors.border,
  };
};

// Controls whether to display the side popover
const shouldShowPopover = (event) => {
  if (!event) return false;
  return hoveredEventId.value === event.id || editingRemarkId.value === event.id;
};

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const handleCardEnter = (eventId) => {
  clearHideTimeout();
  hoveredEventId.value = eventId;
};

const handlePopoverEnter = (eventId) => {
  clearHideTimeout();
  hoveredEventId.value = eventId;
};

// Small grace period so moving the cursor across the gap between the card
// and the popover doesn't cause it to flicker closed.
const handleMouseLeave = () => {
  clearHideTimeout();
  hideTimeout = setTimeout(() => {
    hoveredEventId.value = null;
  }, 150);
};

const isEditingRemark = (event) => {
  return !!event?.id && editingRemarkId.value === event.id;
};

const displayedRemark = (event) => {
  if (!event) return '';
  return Object.prototype.hasOwnProperty.call(pendingRemarks.value, event.id)
    ? pendingRemarks.value[event.id]
    : event.remark;
};

const startEditingRemark = (event) => {
  if (!event) return;
  editingRemarkId.value = event.id;
  remarkDraft.value = displayedRemark(event) || "";
};

const cancelEditing = () => {
  editingRemarkId.value = null;
};

const saveRemark = async (event) => {
  console.log(event)
  if (!event || isSaving.value) return;

  const previousDraft = remarkDraft.value;
  isSaving.value = true;
  // Optimistic UI update — we never mutate the appointments prop directly.
  pendingRemarks.value = { ...pendingRemarks.value, [event.id]: previousDraft };

  try {
    await treatmentStore.updateAppointment({ ...event, remark: previousDraft });
    await treatmentStore.fetchAppointmentsByDate();
    editingRemarkId.value = null;
    showToast('Remark saved', 'success');
  } catch (error) {
    console.error(error);
    // Roll back the optimistic overlay since the save failed.
    const next = { ...pendingRemarks.value };
    delete next[event.id];
    pendingRemarks.value = next;
    showToast('Failed to save remark', 'error');
  } finally {
    isSaving.value = false;
  }
};

const handleCancelAppointment = async (event) => {
  console.log(event)
  if (!event || cancellingId.value) return;

  const confirmed = window.confirm(
    `Cancel the ${event.treatment_name || 'appointment'} at ${formatTimeShort(event.start_time)}? This cannot be undone.`
  );
  if (!confirmed) return;

  cancellingId.value = event.id;
  try {
    await treatmentStore.updateAppointment({ ...event, status: 'cancelled' });
    await treatmentStore.fetchAppointmentsByDate(event.date);
    showToast('Appointment cancelled', 'success');
  } catch (error) {
    console.error(error);
    showToast('Failed to cancel appointment', 'error');
  } finally {
    cancellingId.value = null;
  }
};

const handleSlotClick = (time, roomId, roomName, location) => {
  customerStore.resetCustomers();
  roomStore.setRoomSelected({ roomId, roomName, location, time, isOpen: true, appointment: null });
};

const handleEventClick = (event, time, roomId, roomName, location) => {
  if (!event) return;
  roomStore.setRoomSelected({
    roomId,
    roomName,
    location,
    time: getAppointmentTime(event),
    isOpen: true,
    appointment: event
  });
};
</script>

<style scoped>
/* Main Wrapper Container - Clean Light Greyish Background */
.calendar-wrapper {
  background-color: #f8fafc;
  color: #0f172a;
  padding: 1.5rem;
  border-radius: 8px;
  overflow-x: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05);
}

/* Grid Layout Framework Base Border Lines */
.calendar-grid {
  display: grid;
  border-left: 1px solid #cbd5e1;
  border-top: 1px solid #cbd5e1;
}

/* Header Cells Across the Top Row - Light Bluish Base */
.grid-header-cell {
  background-color: #f1f5f9;
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: #334155;
  border-right: 1px solid #cbd5e1;
  border-bottom: 2px solid #94a3b8;
}

/* Focus color for Room columns */
.room-header {
  color: #1e40af;
}

/* Time column down the left side */
.time-label-cell {
  background-color: #f8fafc;
  padding: 0 0.5rem 0.5rem 0.5rem;
  text-align: right;
  font-size: 0.85rem;
  font-weight: 500;
  color: #475569;
  border-right: 1px solid #cbd5e1;
  border-bottom: 1px solid #f1f5f9;
  height: 30px;
  box-sizing: border-box;
}

/* Main inner empty matrix slots */
.calendar-slot-cell {
  border-right: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  height: 30px;
  position: relative;
  background-color: #ffffff;
}

.calendar-slot-cell:hover {
  background-color: #eff6ff;
  cursor: pointer;
}

/* Floating Appointment Cards */
.calendar-event-card {
  position: absolute;
  top: 1px;
  left: 1px;
  right: 1px;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  border-left: 4px solid #2563eb;
  border-radius: 8px;
  padding: 0.25rem 0.4rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.calendar-event-card:hover {
  box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.event-body {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
}

.event-main {
  display: flex;
  flex-direction: column;
}

.event-title {
  font-size: 0.85rem;
  color: #1e3a8a;
}

.event-meta {
  font-size: 0.72rem;
  color: #1d4ed8;
}

/* Round cancel (×) button — hidden until the card is hovered */
.cancel-btn {
  position: absolute;
  top: -7px;
  right: -7px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  transition: opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  z-index: 20;
}

.calendar-event-card:hover .cancel-btn {
  opacity: 1;
}

.cancel-btn:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
  color: #dc2626;
}

.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ==========================================================================
   REMARK POPOVER STYLING
   ========================================================================== */
.remark-popover {
  position: absolute;
  left: calc(100% + 8px);
  /* Renders to the right of the active slot by default */
  top: 0;
  width: 240px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  padding: 0.75rem;
  z-index: 100;
  /* Floating on top of all slot structures */
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.15s ease-out;
}

/* Flip to the left side for columns near the right edge of the grid,
   so the popover doesn't get clipped off-screen. */
.remark-popover--left {
  left: auto;
  right: calc(100% + 8px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }

  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Clean Little Indented Triangle pointing back to the card */
.popover-arrow {
  position: absolute;
  top: 10px;
  left: -6px;
  width: 10px;
  height: 10px;
  background-color: #ffffff;
  border-left: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  transform: rotate(45deg);
}

.popover-arrow--left {
  left: auto;
  right: -6px;
  border-left: none;
  border-bottom: none;
  border-right: 1px solid #e2e8f0;
  border-top: 1px solid #e2e8f0;
}

.popover-header {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 0.35rem;
}

.remark-display {
  font-size: 0.8rem;
  color: #334155;
  line-height: 1.4;
  margin-bottom: 0.5rem;
  word-break: break-word;
  background-color: #f8fafc;
  padding: 6px 8px;
  border-radius: 4px;
  border-left: 2px solid #94a3b8;
}

.remark-section {
  width: 100%;
}

.popover-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.25rem;
  margin-top: 4px;
}

.remark-save,
.remark-cancel {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 8px;
}

.remark-save {
  border: 1px solid #2563eb;
  background-color: #2563eb;
  color: #ffffff;
}

.remark-save:hover {
  background-color: #1d4ed8;
  border-color: #1d4ed8;
}

.remark-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.remark-cancel {
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #64748b;
}

.remark-cancel:hover {
  background-color: #f1f5f9;
  color: #334155;
}

.remark-save:active,
.remark-cancel:active {
  transform: scale(0.97);
}

.remark-trigger {
  border: 1px dashed #cbd5e1;
  background: #ffffff;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 6px;
  text-align: center;
  cursor: pointer;
  width: 100%;
  padding: 4px 0;
  transition: all 0.15s ease;
}

.remark-trigger:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.remark-textarea {
  width: 100%;
  resize: none;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #334155;
  background: #ffffff;
  box-sizing: border-box;
  padding: 6px;
}

.remark-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.16);
}
</style>