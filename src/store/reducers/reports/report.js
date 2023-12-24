// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
// import { getVendorWiseStockReport, getVendorWiseSaleReport, getPaymentDetailsReport } from '_api/reports/report';
import { getVendorWiseStockReport, getVendorWiseSaleReport, getPurchaseDetailsReport, getDailySaleReport,getDayWiseSaleReport, getVendorWiseExpiredStockReport, getPaymentDetailsReport } from '_api/reports/report';

// Initial state
const initialState = {
    isReportLoading: false,
    error: null,
    errorCode: null,
    token: localStorage.getItem('authToken'),
    vendorWiseStockReports: [],
    vendorWiseSaleReports: [],
    paymentDetailsReports: [],
    vendorWiseExpiredStockReports: [],
    dayWiseSaleReports:[],
    dailySaleReports: [],
    purchaseDetailsReports: []
};

// Report slice
const reportSlice = createSlice({
    name: 'Reports',
    initialState: initialState,
    reducers: {
        setReportData: (state, action) => {
            state.vendorWiseStockReports = action.payload;
            state.vendorWiseSaleReports = action.payload;
            state.paymentDetailsReports = action.payload;
            state.vendorWiseExpiredStockReports = action.payload;
            state.dayWiseSaleReports = action.payload;
            state.dailySaleReports = action.payload;
            state.purchaseDetailsReports = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getVendorWiseStockReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getVendorWiseStockReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.vendorWiseStockReports = action.payload.data;
            })
            .addCase(getVendorWiseStockReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })

            .addCase(getVendorWiseSaleReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getVendorWiseSaleReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.vendorWiseSaleReports = action.payload.data;
            })
            .addCase(getVendorWiseSaleReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })

            .addCase(getVendorWiseExpiredStockReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getVendorWiseExpiredStockReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.vendorWiseExpiredStockReports = action.payload.data;
            })
            .addCase(getVendorWiseExpiredStockReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(getDayWiseSaleReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getDayWiseSaleReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.dayWiseSaleReports = action.payload.data;
            })
            .addCase(getDayWiseSaleReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })
            
            .addCase(getDailySaleReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getDailySaleReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.dailySaleReports = action.payload.data;
            })
            .addCase(getDailySaleReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })

            .addCase(getPurchaseDetailsReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getPurchaseDetailsReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.purchaseDetailsReports = action.payload.data;
            })
            .addCase(getPurchaseDetailsReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })

            .addCase(getPaymentDetailsReport.pending, (state) => {
                state.isReportLoading = true;
                state.error = null;
            })
            .addCase(getPaymentDetailsReport.fulfilled, (state, action) => {
                state.isReportLoading = false;
                state.paymentDetailsReports = action.payload.data;
            })
            .addCase(getPaymentDetailsReport.rejected, (state, action) => {
                state.isReportLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken, setReportData } = reportSlice.actions;
export default reportSlice.reducer;
