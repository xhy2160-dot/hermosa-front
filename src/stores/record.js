// stores/treatment.js
import { defineStore } from 'pinia';
import {
    getRecordsByCusId, saveCellEditPost, updateAppointmentPut, uploadExcelPost
} from '@/api/index.js';

import {ref} from "vue";
import { useToast } from "@/composables/useToast.js";
const { showToast } = useToast();

const staffName = localStorage.getItem('staffName');

export const useRecordStore = defineStore('record', () => {
    const cusNrecords = ref([])
    const record = ref({})
    const page = ref(1)
    const limit = ref(10)
    const total = ref(0)
    const loading = ref(false)
    const hasMore = ref(true)
    const error = ref(null)


    const uploadExcel = async (form)=>{
        loading.value = true
        try {
            cusNrecords.value = await uploadExcelPost(form)
            showToast('File uploaded successfully.', 'success')
            return cusNrecords.value

        } catch (err) {
            console.error('Error posting excel file:', err)
            showToast('Upload failed or file has been previously uploaded', 'error')
        } finally {
            loading.value = false
        }
    }

    const saveCellEdit = async (payload)=> {
        try{
             return await saveCellEditPost(payload)
        }catch(error){
            console.error(error);
            showToast('Fail to save data, please refresh page and try again', 'error')
        }

    }

    const fetchRecordsByCustomerId = async (customerId) => {
        if (loading.value) return
        loading.value = true
        try {
            record.value = await getRecordsByCusId(customerId)
            showToast('Successfully retrieved customer records', 'success')
            return record.value

        } catch (err) {
            console.error('Error fetching appointments:', err)
            showToast('failed to retrieved customer records', 'error')
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
        cusNrecords,
        saveCellEdit,
        record,
        uploadExcel,
        total,
        loading,
        hasMore,
        fetchRecordsByCustomerId,
        resetLogs
    }
})