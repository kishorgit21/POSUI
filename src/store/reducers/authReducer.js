import { createSlice } from '@reduxjs/toolkit';
import { startAuthentication, completeAuthentication, completeOTPReq, getUser, resendOTPReq, changePassword } from '../../_api/auth/auth';

const initialState = {
  isLoading: false,
  error: null,
  isLoggedIn: false,
  sessionId: null,
  currentAuthStep: null,
  authFactorType: null,
  token: localStorage.getItem('authToken') || null,
  user: null,
  data: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      state.isLoggedIn = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startAuthentication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startAuthentication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.sessionId;
        state.currentAuthStep = action.payload.currentAuthStep;
        state.authFactorType = action.payload.authFactorType;
      })
      .addCase(startAuthentication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        console.log(' start authentication rejected');
      })

      .addCase(completeOTPReq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeOTPReq.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessionId = action.payload.sessionId;
        state.currentAuthStep = action.payload.currentAuthStep;
        state.authFactorType = action.payload.authFactorType;
      })
      .addCase(completeOTPReq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(completeAuthentication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(completeAuthentication.fulfilled, (state) => {
        state.isLoading = false;
        state.isLoggedIn = true;
      })
      .addCase(completeAuthentication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(getUser.pending, (state) => {
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(resendOTPReq.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTPReq.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOTPReq.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(changePassword.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        // state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  }
});

export const { setToken } = authSlice.actions;
export default authSlice.reducer;
