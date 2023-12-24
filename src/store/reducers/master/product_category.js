// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addProductCategory, deleteProductCategory, getProductCategory, revokeDeletedProductCategory, updateProductCategory } from '_api/master/product_Category';

// Initial state
const initialState = {
    isLoading: true,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    productCategories: []
};

// ProductCategory slice
const productCategorySlice = createSlice({
    name: 'ProductCategory',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(getProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProductCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.productCategories = action.payload.data;
            })
            .addCase(getProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addProductCategory.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateProductCategory.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteProductCategory.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
                state.errorCode = action.error.code;
            })

            .addCase(revokeDeletedProductCategory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(revokeDeletedProductCategory.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(revokeDeletedProductCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = productCategorySlice.actions;
export default productCategorySlice.reducer;
