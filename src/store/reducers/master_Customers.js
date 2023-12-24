// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Setvices
import { addCustomer, deleteCustomer, getCustomer, revokeDeletedCustomer, updateCustomer } from '../../_api/master_Customer';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    customers: []
};

// Customer slice
const customerSlice = createSlice({
    name: 'Customers',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getCustomer.fulfilled, (state, action) => {
                state.isLoading = false;
                state.customers = action.payload
            })
            .addCase(getCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addCustomer.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateCustomer.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteCustomer.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(revokeDeletedCustomer.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedCustomer.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedCustomer.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = customerSlice.actions;
export default customerSlice.reducer;
