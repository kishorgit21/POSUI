// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addProduct, deleteProduct, getByIdProduct, getProduct, getProductsForCSV, revokeDeletedProduct, updateProduct } from '../../_api/master_Product';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    products: []
};

// Product slice
const productSlice = createSlice({
    name: 'Products',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data;
            })
            .addCase(getProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addProduct.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProduct.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProduct.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getByIdProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdProduct.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getProductsForCSV.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProductsForCSV.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getProductsForCSV.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(revokeDeletedProduct.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedProduct.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
    }
});

// Export slice methods
export const { setToken } = productSlice.actions;
export default productSlice.reducer;
