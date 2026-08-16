import { defineStore } from 'pinia';
import {addStaff, getAllStaff, updateStaffPost} from "@/api/index.js";


export const useStaffStore = defineStore('staff', {
    state: () => ({
        staff: [],
        loading: false,
        error: null
    }),

    getters: {
        getStaffById: (state) => (id) => {
            return state.staff.find(staff => staff.id === id);
        },
        activeStaff: (state) => {
            return state.staff.filter(staff => staff.status === 'active');
        },
        inactiveStaff: (state) => {
            return state.staff.filter(staff => staff.status === 'inactive');
        }
    },

    actions: {
        async fetchStaff() {
            this.loading = true;
            try {
                const response = await getAllStaff();
                this.staff = response || [];
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createStaff(data) {
            try {
                const response = addStaff( data);
                this.staff.push(response);
                return response;
            } catch (error) {
                throw error;
            }
        },

        async updateStaff(data) {
            try {
                const response = await updateStaffPost(data);
                const index = this.staff.findIndex(staff => staff.id === data.id);
                if (index !== -1) {
                    this.staff[index] = { ...this.staff[index], ...response };
                }
                return response;
            } catch (error) {
                throw error;
            }
        },

        async deleteStaff(id) {
            try {
                await api.delete(`/staff/${id}`);
                this.staff = this.staff.filter(staff => staff.id !== id);
            } catch (error) {
                throw error;
            }
        }
    }
});