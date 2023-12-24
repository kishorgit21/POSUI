// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbase';

/**
 * Get purchase order list service
 */
export const getPurchaseOrder = createAsyncThunk('transaction/getPurchaseOrder', async (payload) => {
    const response = await api.get(`/api/v1/purchaseorder/list?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add purchase order service
 */
export const addPurchaseOrder = createAsyncThunk('transaction/addPurchaseOrder', async (payload) => {
    const response = await api.post('/api/v1/purchaseorder/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update purchase order service
 */
export const updatePurchaseOrder = createAsyncThunk('transaction/updatePurchaseOrder', async (payload) => {
    const response = await api.put('/api/v1/purchaseorder/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Cancel purchase order list service
 */
export const deletePurchaseOrder = createAsyncThunk('transaction/cancelPurchaseOrder', async (payload) => {
    const response = await api.delete('/api/v1/purchaseorder/cancel', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * get purchase order by id service
 */
export const getPurchaseOrderbyID = createAsyncThunk('transaction/getPurchaseOrderbyID', async (payload) => {
    const response = await api.get(`/api/v1/purchaseorder/getbyid?purchaseOrderId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});


/**
 * get frequently purchased products by vendor id service
 */
export const getFrequentlyPurchasedProducts = createAsyncThunk('transaction/getFrequentlyPurchasedProducts', async (payload) => {
    const response = await api.get(`/api/v1/purchaseorder/getfrequentlypurchasedproducts?vendorId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});