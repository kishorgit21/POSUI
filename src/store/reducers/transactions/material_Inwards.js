// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addMaterialInward, deleteMaterialInward,  getMaterialInward, updateMaterialInward, getByIdMaterialInward, getQRCodeDetails, getQRCodeStatus } from '../../../_api/transactions/material_Inward';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    materialinwards: []
};

// MaterialInward slice
const materialInwardsSlice = createSlice({
    name: 'MaterialInwards',
    initialState: initialState,
    reducers: {
        setMaterialInwardData: (state, action) => {
            state.materialinwards = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMaterialInward.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMaterialInward.fulfilled, (state, action) => {
                state.isLoading = false;
                state.materialinwards = action.payload.data
            })
            .addCase(getMaterialInward.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addMaterialInward.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addMaterialInward.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addMaterialInward.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateMaterialInward.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateMaterialInward.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateMaterialInward.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteMaterialInward.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteMaterialInward.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteMaterialInward.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getByIdMaterialInward.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdMaterialInward.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdMaterialInward.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getQRCodeDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQRCodeDetails.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getQRCodeDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getQRCodeStatus.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getQRCodeStatus.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getQRCodeStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

    }
});

// Export slice methods
export const { setToken, setMaterialInwardData } = materialInwardsSlice.actions;
export default materialInwardsSlice.reducer;
