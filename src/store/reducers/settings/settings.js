// Redux api's
import { createSlice } from '@reduxjs/toolkit';

// Services
import { getSettings, updateSetting, getDashboardCount, getByRole } from '_api/settings/settings';

// Initial state
const initialState = {
    isLoading: false,
    error: null,
    token: localStorage.getItem('authToken'),
    settings: [],
    role:'',
    dashboardCount: ''
};

// Settings slice
const settingsSlice = createSlice({
    name: 'Settings',
    initialState: initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder

            .addCase(getDashboardCount.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getDashboardCount.fulfilled, (state, action) => {
                state.isLoading = false;
                state.dashboardCount = action.payload.data;
            })
            .addCase(getDashboardCount.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getSettings.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.settings = action.payload.data;
            })
            .addCase(getSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(updateSetting.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSetting.fulfilled, (state) => {
                state.isLoading = false;
            })
            .addCase(updateSetting.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

            .addCase(getByRole.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getByRole.fulfilled, (state, action) => {
                state.isLoading = false;
                state.role = action.payload.data;
            })
            .addCase(getByRole.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })

    }
});

// Export slice methods
export const { setToken } = settingsSlice.actions;
export default settingsSlice.reducer;