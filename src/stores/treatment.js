// stores/treatment.js
import { defineStore } from 'pinia';
import {
    addAppointmentPost,
    addTreatmeantPost,
    api,
    appointmentsByTreatmentIdGet,
    getAppointmentsByDate,
    getTreatmentsByCusId,
    updateAppointmentPut,
    updateTreatmentPut
} from '@/api/index.js';
import { toDateString } from "@/utils/formatDate.js";

const staffName = localStorage.getItem('staffName');


export const useTreatmentStore = defineStore('treatment', {
    state: () => ({
        treatments: [],
        appointments: [],
        loading: false,
        error: null
    }),

    getters: {
        getTreatmentsByCustomer: (state) => (customerId) => {
            return state.treatments.filter(t => t.customer_id === customerId);
        }
    },

    actions: {
        async fetchTreatmentsByCustomer(customerId) {
            this.loading = true;
            try {
                const response = await getTreatmentsByCusId({ customerId });
                this.treatments = response
                return response
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createTreatment(data) {
            try {
                const response = await addTreatmeantPost(data);
                return response.data;
            } catch (error) {
                throw error;
            }
        },

        async updateTreatment(payload) {
            try {
                const response = await updateTreatmentPut(payload);
                const index = this.treatments.findIndex(t => t.id === payload.id);
                if (index !== -1) {
                    this.treatments[index] = { ...this.treatments[index], ...response };
                }
                return response;
            } catch (error) {
                throw error;
            }
        },
        async deleteTreatment(id) {
            try {
                await api.delete(`/treatments/${id}`);
                this.treatments = this.treatments.filter(t => t.id !== id);
            } catch (error) {
                throw error;
            }
        },
        async addAppointment(data) {
            try {
                data.staffName = staffName;
                await addAppointmentPost(data)
            } catch (error) {
                throw error;
            }

        },
        async fetchAppointmentsByDate(date) {
            this.loading = true;
            try {
                const response = await getAppointmentsByDate({ date: toDateString(date) });
                // Ensure appointments is always an array
                if (Array.isArray(response)) {
                    this.appointments = response;
                } else if (response && Array.isArray(response.appointments)) {
                    this.appointments = response.appointments;
                } else if (response && Array.isArray(response.data)) {
                    this.appointments = response.data;
                } else {
                    this.appointments = [];
                }
                return this.appointments;
            } catch (error) {
                this.error = error.message;
                this.appointments = [];
                throw error;
            } finally {
                this.loading = false;
            }
        },
        async fetchAppointmentsByTreatmentId(treatmentId) {
            try {
                return await appointmentsByTreatmentIdGet(treatmentId)
            } catch (error) {
                throw error;
            }

        },
        async updateAppointment(data) {
            this.loading = true;
            try {
                const response = await updateAppointmentPut(data);
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});