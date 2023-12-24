// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbase';

/**
 * Get dashboard count list service
 */
export const getDashboardCount = createAsyncThunk('transaction/getDashboardCount', async () => {
    const response = await api.get(`/api/v1/dashboard/dashboardcount`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get settings list service
 */
export const getSettings = createAsyncThunk('transaction/getSettings', async () => {
    const response = await api.get(`/api/v1/settings/list`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Update settings service
 */
export const updateSetting = createAsyncThunk('master/updateSetting', async (payload) => {
    const response = await api.put('/api/v1/setting/edit', payload);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get role list service
 */
export const getByRole = createAsyncThunk('transaction/getbyrole', async () => {
    const response = await api.get(`/api/v1/rolesprivileges/getbyrole`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
