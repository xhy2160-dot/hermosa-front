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
        resetCustomers()  {
            this.customers = [];
        },
        async searchCustomers(query) {
            this.loading = true;
            this.error = null; // Clear previous errors
            try {
                const response = await getCustomersByQuery( {query});
                // FIX: Update your store's state so components can watch it reactively
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
                this.loading = false; // FIX: Ensures loading turns false even if API fails
            }
        },

        async updateCustomer(data){
            this.loading = true;
            this.error = null;
            try {
                const response = await updateCustomerPut(data);
                this.customer = response;
                return response;
            }catch (error) {
                this.error = error
                throw error;
            }
        },

        async fetchCustomerById(id) {
            this.loading = true;
            this.error = null;
            try {
                this.customer  = await getCustomerById(id);
                return this.customer;
            } catch (error) {
                this.error = error
                console.log(error);
            } finally {
                this.loading = false;
            }
        }
    }
});