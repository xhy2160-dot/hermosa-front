import {get, post, put, upload} from './http.js';

//auth
export const loginPost = async (formData) => {
    return await post('/auth/login', formData);
}
export const authMeGet = async () => {
    return await get('/auth/me');
}
export const logoutPost = async () => {
    return await post('/auth/logout');
}
//staff
export const getAllStaff = async (formData) => {
    return await get('/staff/get-all-staff');
}
export const addStaff = async (formData) => {
    return await post('/staff/add', formData);
}
export const updateStaffPost = async (formData) => {
    return await post('/staff/update', formData);
}
//customers
export const AddCustomerPost = async (formData) => {
    return await post('/customers/add', formData);
}
export const updateCustomerPut = async (formData) => {
    return await put('/customers/update', formData);
}
export const getCustomersByQuery = async (query) => {
    return await get('/customers/get-all-by-query',query);
}

export const getCustomerById = async (id) => {
    return await get('/customers/',{id});
}

//records
export const uploadExcelPost = async  (form)=>{
    return await post('/customers/upload-excel', form);
}
export const saveCellEditPost=async (payload)=>{
    return await post('/customers/save-cell-edit', payload);
}
export const getRecordsByCusId = async (customerId) => {
    return await get('/customers/get-records-by-customerId',{customerId});
}
//treatments
export const addTreatmeantPost  = async (formData) => {
    return await post('/treatment/add', formData);
}
export const getTreatmentsByCusId = async (query) => {
    return await get('/treatment/get-all-by-cusId',query);
}
export const getTreatmentsByDate = async (date) => {
    return await get('/treatment/get-all-by-date',date);
}
export  const updateTreatmentPut = async (formdata) => {
    return await put('/treatment/update', formdata);
}
//appointments
export const addAppointmentPost = async (formData) => {
    return await post('/appointments/add', formData);
}
export const getAppointmentsByDate = async (date) => {
    return await get('/appointments/get-all-by-date',date);
}
export const updateAppointmentPut = async (formdata) => {
    return await put('/appointments/update', formdata);
}
export const appointmentsByTreatmentIdGet = async (treatmentId) => {
    return await get('/appointments/get-all-by-treatmentId',{treatmentId});
}


//rooms
export const getAllRooms = async () => {
    return await get('/rooms');
}

//payments
export const paymentsByAppIdGet = async (appId) => {
    return await get('/payments/get-all-by-appointmentId', {appId});
}
export const paymentsByTreatmentIdGet=async (treatmentId) => {
    return await get('/payments/get-all-by-treatmentId', {treatmentId});
}

export const addAPaymentPost =async (formData) => {
    return await post('/payments/add', formData);
}

export const updatetAPaymentPost = async (data)=>{
    return await put('/payments/update', data);
}

//store credits
export const storeCreditsGet =async (customerId)=>{
    return await get('/store-credits', {customerId});
}
export const updateCreditsPost = async (data)=>{
    return await post('/store-credits/update', data);
}

//logs
export const getPaginatedLogs=async (params)=>{
    return await get('/logs', params);
}

export const api =()=>{}