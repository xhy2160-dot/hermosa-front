// stores/treatment.js
import { defineStore } from 'pinia';
import {
    getAppointmentsByCusId, updateAppointmentPut
} from '@/api/index.js';
import { toDateString } from "@/utils/formatDate.js";
import {ref} from "vue";
import { useToast } from "@/composables/useToast.js";
const { showToast } = useToast();

const staffName = localStorage.getItem('staffName');

export const useAppointmentStore = defineStore('appointment', () => {
    const appointments = ref([])
    const page = ref(1)
    const limit = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const hasMore = ref(true)
    const error = ref(null)

    const normalizeLogPayload = (payload) => {
        if (Array.isArray(payload)) {
            return { entries: payload, total: payload.length }
        }

        if (payload && typeof payload === 'object') {
            const entrySources = [payload.data, payload.logs, payload.items, payload.list].find(Array.isArray)
            const entries = Array.isArray(entrySources) ? entrySources : []
            const totalValue = Number.isFinite(payload.total)
                ? payload.total
                : Number.isFinite(payload.count)
                    ? payload.count
                    : Number.isFinite(payload.totalCount)
                        ? payload.totalCount
                        : entries.length

            return { entries, total: totalValue }
        }
        return { entries: [], total: 0 }
    }

    const fetchAppointmentsByCustomerId = async (customerId) => {
        if (loading.value) return
        loading.value = true
        try {
            appointments.value = await getAppointmentsByCusId(customerId)
            return appointments.value

        } catch (err) {
            console.error('Error fetching appointments:', err)
        } finally {
            loading.value = false
        }
    }

    const  updateAppointment= async (data)=> {
        if (loading.value) return
        loading.value = true
        try {
          await updateAppointmentPut(data);
            showToast('Status updated successfully.', 'success');
        } catch (error) {
            error.value = error.message;
            showToast('Failed to update status.', 'error');
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const resetLogs = () => {
        logs.value = []
        page.value = 1
        total.value = 0
        hasMore.value = true
        loading.value = false
    }

    return {
        appointments,
        updateAppointment,
        total,
        loading,
        hasMore,
        fetchAppointmentsByCustomerId,
        resetLogs
    }
})