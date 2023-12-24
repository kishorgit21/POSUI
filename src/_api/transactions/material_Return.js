// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from 'lib/axiosbase';


/**
 * Get material return list service
 */
export const getMaterialReturn = createAsyncThunk('transaction/getMaterialReturn', async (payload) => {
    const response = await api.get(`/api/v1/materialreturnnote/list?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add material return service
 */

export const addMaterialReturn = createAsyncThunk('transaction/AddMaterialReturn', async (payload) => {
    const response = await api.post('/api/v1/materialreturnnote/addmultivendor', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update material return service
 */
export const updateMaterialReturn = createAsyncThunk('transaction/updateMaterialReturn', async (payload) => {
    const response = await api.put('/api/v1/materialreturnnote/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete material return service
 */
export const deleteMaterialReturn = createAsyncThunk('transaction/deleteMaterialReturn', async (payload) => {
    const response = await api.delete('/api/v1/materialreturnnote/cancel', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get material return by id service
 */
export const getByIdMaterialReturn = createAsyncThunk('transaction/getByIdMaterialReturn', async (payload) => {

    const response = await api.get(`/api/v1/materialreturnnote/get?materialReturnNoteId=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
