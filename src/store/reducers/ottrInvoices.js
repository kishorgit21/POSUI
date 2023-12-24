// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { addInvoice, deleteInvoice, getByIdInvoice, getInvoice, updateInvoice} from '../../_api/ottrInvoice';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    invoices: []
};

// Invoice slice
const invoiceSlice = createSlice({
    name: 'Invoices',
    initialState: initialState,
    reducers: {
        setInvoiceData: (state, action) => {
            state.invoices = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getInvoice.fulfilled, (state, action) => {
                
                state.isLoading = false;
                state.invoices = action.payload.data;
                // console.log("🚀 ~ file: ottrInvoices.js:32 ~ .addCase ~ invoices:", state.invoices)
                
            })
            .addCase(getInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(addInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addInvoice.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(addInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateInvoice.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(deleteInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteInvoice.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(deleteInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getByIdInvoice.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByIdInvoice.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(getByIdInvoice.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken, setInvoiceData } = invoiceSlice.actions;
export default invoiceSlice.reducer;
