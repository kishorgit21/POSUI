// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbase';

/**
 * Get product category list service
 */
export const getProductCategory = createAsyncThunk('master/getProductCategory', async () => {
    const response = await api.get('/api/v1/productcategory/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add product category service
 */
export const addProductCategory = createAsyncThunk('master/addProductCategory', async (payload) => {
    const response = await api.post('/api/v1/productcategory/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update product category service
 */
export const updateProductCategory = createAsyncThunk('master/updateProductCategory', async (payload) => {
    const response = await api.put('/api/v1/productcategory/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete product category service
 */
export const deleteProductCategory = createAsyncThunk('master/deleteProductCategory', async (payload) => {
    const response = await api.delete('/api/v1/productcategory/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted product category list service
 */
export const revokeDeletedProductCategory = createAsyncThunk('master/revokeProductcategory', async (payload) => {
    const response = await api.put('/api/v1/productcategory/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});