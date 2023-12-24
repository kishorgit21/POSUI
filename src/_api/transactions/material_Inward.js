// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbase';

/**
 * Get material inward list service
 */
export const getMaterialInward = createAsyncThunk('transaction/getMaterialInward', async (payload) => {
    const response = await api.get(`/api/v1/materialinward/list?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add material inward service
 */
export const addMaterialInward = createAsyncThunk('transaction/addMaterialInward', async (payload) => {
    const response = await api.post('/api/v1/materialinward/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update material inward service
 */
export const updateMaterialInward = createAsyncThunk('transaction/updateMaterialInward', async (payload) => {
    const response = await api.put('/api/v1/materialinward/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete material inward list service
 */
export const deleteMaterialInward = createAsyncThunk('transaction/deleteMaterialInward', async (payload) => {
    const response = await api.delete('/api/v1/materialinward/cancel', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get material inward by id service
 */
export const getByIdMaterialInward = createAsyncThunk('master/getByIdMaterialInward', async (payload) => {

    const response = await api.get(`/api/v1/materialinward/getbyid?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get purchaser order / vendor by id service
 */

export const getVendorIdByPurchaseOrder = createAsyncThunk('transaction/purchaserOrder/getByIdVendor', async (payload) => {
    const response = await api.get(`/api/v1/purchaseorder/getbyvendorid?vendorId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get purchaser order by id service
 */

export const getByIdPurchaseOrder = createAsyncThunk('transaction/purchaserOrder/getById', async (payload) => {
    const response = await api.get(`/api/v1/purchaseorder/getbyid?purchaseOrderId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get QR code details for material inward product by id service
 */
export const getQRCodeDetails = createAsyncThunk('master/getQRCodeDetails', async (payload) => {

    const response = await api.get(`/api/v1/materialinward/getqrcodedetails?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get QR code status for material inward product by QR code service
 */
export const getQRCodeStatus = createAsyncThunk('master/getQRCodeStatus', async (payload) => {

    const response = await api.get(`/api/v1/materialinward/getqrcodestatus?qrcode=${payload.model.qrcode}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
