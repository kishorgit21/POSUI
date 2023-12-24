// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addVendor, deleteVendor, getByIdVendor, getVendor, getVendorsForCSV, revokeDeletedVendor, updateVendor } from '../../_api/master_Vendor';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    vendors: []
};

// Vendor slice
const vendorSlice = createSlice({
    name: 'Vendors',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getVendor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.vendors = action.payload.data
            })
            .addCase(getVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addVendor.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateVendor.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteVendor.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getByIdVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdVendor.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getVendorsForCSV.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getVendorsForCSV.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getVendorsForCSV.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(revokeDeletedVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedVendor.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = vendorSlice.actions;
export default vendorSlice.reducer;
