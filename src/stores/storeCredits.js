import { defineStore } from 'pinia';
import {storeCreditsGet, updateCreditsPost} from '@/api/index.js';

import {ref} from "vue";
import { useToast } from "@/composables/useToast.js";
const { showToast } = useToast();

const staffName = localStorage.getItem('staffName');

export const useStoreCredits = defineStore('storeCredits', () => {
    const balance = ref(0)
    const loading = ref(false)
    const error = ref(null)

    const fetchCreditBalance = async (customerId) => {
        loading.value = true;
        try {
             const res = await storeCreditsGet(customerId)
            balance.value = res.balance
        } catch (error) {
            error.value = error.message;
            showToast('Failed to fetch credit balance', 'error');
            throw error;
        } finally {
            loading.value = false;
        }
    }

    const updateCredits = async (data) =>{
        loading.value = true;
        data.staff_name = staffName
        try {
            const res = await updateCreditsPost(data)
            balance.value = res.balance
            showToast('Credits updated successfully.', 'success');
            return res
        } catch (error) {
            error.value = error.message;
            showToast('Failed to update Credits', 'error');
            throw error;
        } finally {
            loading.value = false;
        }
    }



    return {
        updateCredits,
        fetchCreditBalance,
        balance,
        loading,
    }
})