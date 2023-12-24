// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addStore, deleteStore, getStore, revokeDeletedStore, updateStore } from '../../_api/master_Store';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    stores: []
};

// store slice
const storeSlice = createSlice({
    name: 'Stores',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getStore.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getStore.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stores = action.payload.data
              
            })
            .addCase(getStore.rejected, (state, action) => {
                state.isLoading = false; 
                state.error = action.error.message;
            })

            .addCase(addStore.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addStore.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addStore.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateStore.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateStore.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateStore.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteStore.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteStore.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteStore.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(revokeDeletedStore.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedStore.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedStore.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = storeSlice.actions;
export default storeSlice.reducer;
