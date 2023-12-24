// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';

/**
 * Get product list service
 */
export const getProduct = createAsyncThunk('master/getProduct', async () => {
    const response = await api.get('/api/v1/product/list');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Add product service
 */
export const addProduct = createAsyncThunk('master/AddProduct', async (payload) => {
    const response = await api.post('/api/v1/product/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update product service
 */
export const updateProduct = createAsyncThunk('master/updateProduct', async (payload) => {
    const response = await api.put('/api/v1/product/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Delete product list service
 */
export const deleteProduct = createAsyncThunk('master/deleteProduct', async (payload) => {
    const response = await api.delete('/api/v1/product/delete', { data: payload });

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get product by id service
 */
export const getByIdProduct = createAsyncThunk('master/getByIdProduct', async (payload) => {

    const response = await api.get(`/api/v1/product/getbyid?id=${payload.model.id}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get product by id service
 */
export const getProductsForCSV = createAsyncThunk('master/getProductsForCSV', async () => {

    const response = await api.get('/api/v1/product/export');

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Revoke deleted product list service
 */
export const revokeDeletedProduct = createAsyncThunk('master/revokeProduct', async (payload) => {
    const response = await api.put('/api/v1/product/revokedeleted', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});