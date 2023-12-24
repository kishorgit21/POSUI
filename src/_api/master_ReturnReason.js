// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get return reason list service
 */
export const getReturnReason = createAsyncThunk('master/getReturnReason', async () => {
    const response = await api.get('/api/v1/materialReturn/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add return reason service
 */
export const addReturnReason = createAsyncThunk('master/addReturnReason', async (payload) => {
    const response = await api.post('/api/v1/materialReturn/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update return reason service
 */
export const updateReturnReason = createAsyncThunk('master/updateReturnReason', async (payload) => {
    const response = await api.put('/api/v1/materialReturn/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete return reason service
 */
export const deleteReturnReason = createAsyncThunk('master/deleteReturnReason', async (payload) => {
    const response = await api.delete('/api/v1/materialReturn/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted return reason list service
 */
export const revokeDeletedReturnReason = createAsyncThunk('master/revokeReturnReason', async (payload) => {
    const response = await api.put('/api/v1/materialReturn/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});