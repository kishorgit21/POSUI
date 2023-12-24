// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get customer list service
 */
export const getCustomer = createAsyncThunk('master/getCustomer', async () => {
    const response = await api.get('/api/v1/customer/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add customer service
 */
export const addCustomer = createAsyncThunk('master/addCustomer', async (payload) => {
    const response = await api.post('/api/v1/customer/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update customer service
 */
export const updateCustomer = createAsyncThunk('master/updateCustomer', async (payload) => {
    const response = await api.put('/api/v1/customer/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete customer list service
 */
export const deleteCustomer = createAsyncThunk('master/deleteCustomer', async (payload) => {
    const response = await api.delete('/api/v1/customer/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted customer list service
 */
export const revokeDeletedCustomer = createAsyncThunk('master/revokeCustomer', async (payload) => {
    const response = await api.put('/api/v1/customer/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});