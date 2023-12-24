// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addMaterialReturn , deleteMaterialReturn , getByIdMaterialReturn , getMaterialReturn , updateMaterialReturn  } from '_api/transactions/material_Return';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    materialReturns: []
};

// Material return slice
const materialReturnSlice = createSlice({
    name: 'Vendors',
    initialState: initialState,
    reducers: {
        setMaterialReturnData: (state, action) => {
            state.materialReturns = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMaterialReturn .pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getMaterialReturn .fulfilled, (state, action) => {
                state.isLoading = false;
                state.materialReturns = action.payload.data
            })
            .addCase(getMaterialReturn .rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addMaterialReturn .pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addMaterialReturn .fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addMaterialReturn .rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateMaterialReturn .pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateMaterialReturn .fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateMaterialReturn .rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteMaterialReturn .pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteMaterialReturn .fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteMaterialReturn .rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(getByIdMaterialReturn .pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdMaterialReturn .fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdMaterialReturn .rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

    }
});

// Export slice methods
export const { setToken, setMaterialReturnData } = materialReturnSlice.actions;
export default materialReturnSlice.reducer;
