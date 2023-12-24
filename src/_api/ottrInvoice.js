// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get invoice list service
 */
export const getInvoice = createAsyncThunk('transaction/getInvoice', async (payload) => {
    const response = await api.get(`/api/v1/invoice/list?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        // console.log("invoice data ", response.data)
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add invoice service
 */
export const addInvoice = createAsyncThunk('transaction/AddInvoice', async (payload) => {
    const response = await api.post('/api/v1/invoice/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update invoice service
 */
export const updateInvoice = createAsyncThunk('transaction/updateInvoice', async (payload) => {
    const response = await api.put('/api/v1/invoice/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete invoice list service
 */
export const deleteInvoice = createAsyncThunk('transaction/deleteInvoice', async (payload) => {
    const response = await api.delete('/api/v1/invoice/cancel', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get invoice by id service
 */
export const getByIdInvoice = createAsyncThunk('transaction/getByIdInvoice', async (payload) => {

    const response = await api.get(`/api/v1/invoice/get?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});