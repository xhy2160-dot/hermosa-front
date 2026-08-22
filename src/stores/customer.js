// stores/customer.js
import { defineStore } from 'pinia';
import {  AddCustomerPost , getCustomersByQuery, updateCustomerPut,getCustomerById} from '@/api/index.js';

export const useCustomerStore = defineStore('customer', {
    state: () => ({
        customers: [],
        customer: {},
        loading: false,
        error: null
    }),

    actions: {
        // Resets the entire store back to initial values
        resetState() {
            this.customers = [];
            this.customer = {};
            this.loading = false;
            this.error = null;
        },

        resetCustomers() {
            this.customers = [];
        },

        async searchCustomers(query) {
            this.resetState();
            this.loading = true;
            this.error = null;
            try {
                const response = await getCustomersByQuery({ query });
                this.customers = response || [];
                return this.customers;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async addNewCustomer(data) {
            this.resetState();
            this.loading = true;
            this.error = null;
            try {
                const response = await AddCustomerPost(data);
                this.customer = response;
                this.customers.push(response);
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCustomer(data) {
            this.resetState();
            this.loading = true;
            this.error = null;
            try {
                const response = await updateCustomerPut(data);
                this.customer = response;
                return response;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchCustomerById(id) {
            this.resetState();
            this.loading = true;
            this.error = null;
            try {
                this.customer = await getCustomerById(id);
                return this.customer;
            } catch (error) {
                this.error = error.response?.data?.message || error.message;
                console.error(error);
            } finally {
                this.loading = false;
            }
        }
    }
});
