// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbase';

/**
 * Get active buckets list service
 */
export const getActiveBuckets = createAsyncThunk('transaction/getActiveBuckets', async () => {
    const response = await api.get(`/api/v1/bucket/getactivebuckets`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add active buckets service
 */
export const addActiveBuckets = createAsyncThunk('transaction/addActiveBuckets', async (payload) => {
    const response = await api.post('/api/v1/bucket/addupdate', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get active buckets by id service
 */
export const getByIdBucket = createAsyncThunk('transaction/getByIdBucket', async (payload) => {

    const response = await api.get(`/api/v1/bucket/getbucketbyid?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete active buckets service
 */
export const deleteBucket = createAsyncThunk('transaction/deleteBucket', async (payload) => {
    const response = await api.delete('/api/v1/bucket/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete active buckets item service
 */
export const deleteItemBucket = createAsyncThunk('transaction/deleteItemBucket', async (payload) => {
    const response = await api.delete('/api/v1/bucket/item/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add bucket invoice service
 */
export const addBucketInvoice = createAsyncThunk('transaction/addBucketInvoice', async (payload) => {
    const response = await api.post('/api/v1/bucket/invoice/create', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Generate payment qrcode service
 */
export const generatePaymentQRCode  = createAsyncThunk('transaction/generatePaymentQRCode', async (payload) => {
    const response = await api.post('/api/v1/bucket/generatepaymentqrcode', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Check payment status service
 */
export const checkPaymentStatus  = createAsyncThunk('transaction/checkPaymentStatus', async (payload) => {
    const response = await api.get(`/api/v1/invoice/checkpaymentstatus?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update mobile number
 */
export const updateMobileNumber = createAsyncThunk('transaction/updatemobilenumber', async (payload) => {
    const response = await api.put('/api/v1/bucket/updatemobilenumber', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get latest invoices list service
 */
export const getLatestInvoices = createAsyncThunk('transaction/getLatestInvoices', async () => {
    const response = await api.get(`/api/v1/invoice/getlatestinvoices`);
     // Check for success & fails response
     if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});