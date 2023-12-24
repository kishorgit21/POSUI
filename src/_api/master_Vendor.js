// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get vendor list service
 */
export const getVendor = createAsyncThunk('master/getVendor', async () => {
    const response = await api.get('/api/v1/vendor/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add vendor service
 */
export const addVendor = createAsyncThunk('master/addVendor', async (payload) => {
    const response = await api.post('/api/v1/vendor/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update vendor service
 */
export const updateVendor = createAsyncThunk('master/updateVendor', async (payload) => {
    const response = await api.put('/api/v1/vendor/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete vendor list service
 */
export const deleteVendor = createAsyncThunk('master/deleteVendor', async (payload) => {
    const response = await api.delete('/api/v1/vendor/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get vendor by id service
 */
export const getByIdVendor = createAsyncThunk('master/getByIdVendor', async (payload) => {

    const response = await api.get(`/api/v1/vendorById/list?vendorId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get vendor by id service
 */
export const getVendorsForCSV = createAsyncThunk('master/getVendorsForCSV', async () => {

    const response = await api.get('/api/v1/vendor/export');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted vendor list service
 */
export const revokeDeletedVendor = createAsyncThunk('master/revokeVendor', async (payload) => {
    const response = await api.put('/api/v1/vendor/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
