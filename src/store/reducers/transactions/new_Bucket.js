// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { getActiveBuckets, addActiveBuckets, getByIdBucket, deleteBucket, deleteItemBucket, addBucketInvoice, generatePaymentQRCode, checkPaymentStatus, updateMobileNumber, getLatestInvoices } from '_api/transactions/new_Bucket';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    activeBuckets: [],
    latestInvoice: []
};

// Product slice
const activeBucketsSlice = createSlice({
    name: 'ActiveBuckets',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getActiveBuckets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getActiveBuckets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeBuckets = action.payload.data;
            })
            .addCase(getActiveBuckets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addActiveBuckets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addActiveBuckets.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addActiveBuckets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getByIdBucket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdBucket.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdBucket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteBucket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteBucket.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteBucket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteItemBucket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteItemBucket.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteItemBucket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            //create bucket invoice 
            .addCase(addBucketInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addBucketInvoice.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addBucketInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            // generate Payment QRCode
            .addCase(generatePaymentQRCode.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(generatePaymentQRCode.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(generatePaymentQRCode.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            //Check the payment 
            .addCase(checkPaymentStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(checkPaymentStatus.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(checkPaymentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            //Check the mobile number 
            .addCase(updateMobileNumber.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateMobileNumber.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateMobileNumber.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            //get latest invoices
            .addCase(getLatestInvoices.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getLatestInvoices.fulfilled, (state, action) => {
                state.isLoading = false;
                state.latestInvoice = action.payload.data;
            })
            .addCase(getLatestInvoices.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = activeBucketsSlice.actions;
export default activeBucketsSlice.reducer;
