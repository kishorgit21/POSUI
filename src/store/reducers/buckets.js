// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Setvices
import { addBucket , getBucket } from '../../_api/Bucket';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    buckets: []
};

// Bucket slice
const bucketSlice = createSlice({
    name: 'Buckets',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(addBucket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addBucket.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addBucket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(getBucket.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBucket.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getBucket.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
    }
});

// Export slice methods
// export const { setToken } = bucketSlice.actions;
export default bucketSlice.reducer;
