import { defineStore } from 'pinia';
import {
    addAPaymentPost,
    paymentsByAppIdGet,
    paymentsByTreatmentIdGet,
    updatetAPaymentPost
} from '@/api/index.js';
import { toDateString } from "@/utils/formatDate.js";

import {ref} from "vue";
import { useToast } from "@/composables/useToast.js";
const { showToast } = useToast();

const staff_name = localStorage.getItem('staffName');

export const usePaymentStore = defineStore('payment', () => {
    const payments = ref([])
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

    const addAPayment = async (data) =>{
        data.staff_name=staff_name
        loading.value = true;
        try {
            const res = await addAPaymentPost(data)
            showToast('Payment added successfully.', 'success');
            return res
        } catch (error) {
            error.value = error.message;
            showToast(error, 'error');
            throw error;
        } finally {
            loading.value = false;
        }
    }
    const  fetchPaymentsByAppId=async(appId) =>{
        loading.value = true;
        try {
            return await paymentsByAppIdGet(appId);

        } catch (error) {
            error.value = error.message;
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const  fetchPaymentsByTreatmentId=async(trId) =>{
        loading.value = true;
        try {
            return await paymentsByTreatmentIdGet(trId);

        } catch (error) {
            error.value = error.message;
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const updateAPayment = async (data) =>{
        loading.value = true;
        try {
            const res = await updatetAPaymentPost(data)
            showToast('Payment updated successfully.', 'success');
            return res;
        } catch (error) {
            error.value = error.message;
            showToast('Failed to add payment', 'error');
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const resetLogs = () => {
        page.value = 1
        total.value = 0
        hasMore.value = true
        loading.value = false
    }

    return {
        addAPayment,
        fetchPaymentsByAppId,
        fetchPaymentsByTreatmentId,
        updateAPayment,
        payments,
        total,
        loading,
        hasMore,
        resetLogs
    }
})