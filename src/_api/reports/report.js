// Packages & other api's
import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from 'lib/axiosbase';

/**
 * Get vendor wise stock report list service
 */
export const getVendorWiseStockReport = createAsyncThunk('report/getVendorWiseStockReport', async (payload) => {
    const response = payload.model.vendorId ? await api.get(`/api/v1/reports/vendorwisestock?date=${payload.model.date}&&vendorId=${payload.model.vendorId}`) : await api.get(`/api/v1/reports/vendorwisestock?date=${payload.model.date}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get vendor wise exprired stock report list service
 */
export const getVendorWiseSaleReport = createAsyncThunk('report/getVendorWiseSaleReport', async (payload) => {
    const response = payload.model.vendorId ? await api.get(`/api/v1/reports/vendorwisesales?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}&&vendorId=${payload.model.vendorId}&&categoryid=${payload.model.categoryId}`) : await api.get(`/api/v1/reports/vendorwisesales?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}&&categoryid=${payload.model.categoryId}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get day wise sale report list service
 */
export const getDayWiseSaleReport = createAsyncThunk('report/getDayWiseSaleReport', async (payload) => {
    const response = await api.get(`/api/v1/reports/daywisesales?date=${payload.model.date}`);
    
    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get daily sale report list service
 */
export const getDailySaleReport = createAsyncThunk('report/getDailySaleReport', async (payload) => {
    const response = await api.get(`/api/v1/reports/dailysaledetails?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get purchase details report list service
 */
export const getPurchaseDetailsReport = createAsyncThunk('report/getPurchaseDetailsReport', async (payload) => {
    const response = payload.model.vendorId ? await api.get(`/api/v1/reports/vendorwisepurchasedetails?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}&&vendorId=${payload.model.vendorId}`) : await api.get(`/api/v1/reports/vendorwisepurchasedetails?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get vendor wise exprired stock report list service
 */
export const getVendorWiseExpiredStockReport = createAsyncThunk('master/getVendorWiseExpiredStockReport', async (payload) => {
    const response = payload.model.vendorId ? await api.get(`/api/v1/reports/vendorwiseexpiredstock?date=${payload.model.date}&&vendorId=${payload.model.vendorId}`) : await api.get(`/api/v1/reports/vendorwiseexpiredstock?date=${payload.model.date}`);

    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});

/**
 * Get payment details report list service
 */
export const getPaymentDetailsReport = createAsyncThunk('report/getPaymentDetailsReport', async (payload) => {
    const response = payload.model.vendorId ? await api.get(`/api/v1/reports/vendorpaymentdetails?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}&&vendorId=${payload.model.vendorId}&&categoryid=${payload.model.categoryId}`) : await api.get(`/api/v1/reports/vendorpaymentdetails?fromDate=${payload.model.fromDate}&&toDate=${payload.model.toDate}&&categoryid=${payload.model.categoryId}`);
    
    // Check for success & fails response
    if (response && response.status && response.status === 200) {
        return response.data;
    } else {
        return response;
    }
});
