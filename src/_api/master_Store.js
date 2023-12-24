// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get store list service
 */
export const getStore = createAsyncThunk('master/getstore', async () => {
    const response = await api.get('/api/v1/store/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add store service
 */
export const addStore = createAsyncThunk('master/addstore', async (payload) => {
    const response = await api.post('/api/v1/store/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update store service
 */
export const updateStore = createAsyncThunk('master/updatestore', async (payload) => {
    const response = await api.put('/api/v1/store/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete store list service
 */
export const deleteStore = createAsyncThunk('master/deletestore', async (payload) => {
    const response = await api.delete('/api/v1/store/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted store list service
 */
export const revokeDeletedStore = createAsyncThunk('master/revokeStore', async (payload) => {
    const response = await api.put('/api/v1/store/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
