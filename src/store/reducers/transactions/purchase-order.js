// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { getPurchaseOrder } from '../../../_api/transactions/purchase-order';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    purchaseOrders: []
};

// Purchase order slice
const purchaseOrderSlice = createSlice({
    name: 'PurchaseOrders',
    initialState: initialState,
    reducers: {
        setPurchaseOrderData: (state, action) => {
            state.purchaseOrders = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getPurchaseOrder.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getPurchaseOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.purchaseOrders = action.payload.data;
            })
            .addCase(getPurchaseOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            // .addCase(addVendor.pending, (state) => {
            //     state.isLoading = true;
            //     state.error = null;
            // })
            // .addCase(addVendor.fulfilled, (state) => {
            //     state.isLoading = false;
            // })
            // .addCase(addVendor.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.error.message;
            // })

            // .addCase(updateVendor.pending, (state) => {
            //     state.isLoading = true;
            //     state.error = null;
            // })
            // .addCase(updateVendor.fulfilled, (state) => {
            //     state.isLoading = false;
            // })
            // .addCase(updateVendor.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.error.message;
            // })

            // .addCase(deleteVendor.pending, (state) => {
            //     state.isLoading = true;
            //     state.error = null;
            // })
            // .addCase(deleteVendor.fulfilled, (state) => {
            //     state.isLoading = false;
            // })
            // .addCase(deleteVendor.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.error.message;
            //     state.errorCode = action.error.code;
            // })

            // .addCase(getByIdVendor.pending, (state) => {
            //     state.isLoading = true;
            //     state.error = null;
            // })
            // .addCase(getByIdVendor.fulfilled, (state) => {
            //     state.isLoading = false;
            // })
            // .addCase(getByIdVendor.rejected, (state, action) => {
            //     state.isLoading = false;
            //     state.error = action.error.message;
            //     state.errorCode = action.error.code;
            // })

    }
});

// Export slice methods
export const { setToken, setPurchaseOrderData } = purchaseOrderSlice.actions;
export default purchaseOrderSlice.reducer;
