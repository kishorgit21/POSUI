// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../lib/axiosbase';



/**
 * Add bucket service
 */

export const addBucket = createAsyncThunk('transaction/AddBucket', async (payload) => {
    const response = await api.post('/api/v1/bucket/add', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});



/**
 * Get Bucket by customerID
 */
export const getBucket = createAsyncThunk('transaction/getbucket', async (payload) => {
    const response = await api.get(`/api/v1/bucket/getbycustomer?customerId=${payload.model.customerId}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

