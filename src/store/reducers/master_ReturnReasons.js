// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addReturnReason, deleteReturnReason, getReturnReason, revokeDeletedReturnReason, updateReturnReason } from '../../_api/master_ReturnReason';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    returnReasons: []
};

// ReturnReasons slice
const returnReasonSlice = createSlice({
    name: 'ReturnReasons',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getReturnReason.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getReturnReason.fulfilled, (state, action) => {
                state.isLoading = false;
                state.returnReasons = action.payload.data;
            })
            .addCase(getReturnReason.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addReturnReason.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addReturnReason.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addReturnReason.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateReturnReason.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateReturnReason.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateReturnReason.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteReturnReason.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteReturnReason.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteReturnReason.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(revokeDeletedReturnReason.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedReturnReason.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedReturnReason.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = returnReasonSlice.actions;
export default returnReasonSlice.reducer;
