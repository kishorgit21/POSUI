import { createAsyncThunk } from '@reduxjs/toolkit';

// Axios base settings
import api from '../../lib/axiosbaseauth';

export const startAuthentication = createAsyncThunk('auth/startAuthentication', async (payload) => {
  const response = await api.post(`/api/v1/user/startauthentication`, payload); 

  console.log("🚀 ~ file: auth.js:9 ~ startAuthentication ~ response:", response.data.data)
  const { sessionId, nextStep, nextAuthFactor } = response.data.data;

  localStorage.setItem('authSessionId', sessionId);
  localStorage.setItem('nextStepOTP', nextStep);
  localStorage.setItem('nextAuthFactorOTP', nextAuthFactor);

  return { authSessionId: sessionId, currentAuthStep: nextStep, authFactorType: nextAuthFactor };
});

export const completeOTPReq = createAsyncThunk('auth/completeOTPReq', async (payload) => {
  const response = await api.post(`/api/v1/user/authenticate`, payload);

  console.log('🚀 ~ file: auth.js:20 ~ completeOTPReq ~ response:', response);
  if (response.data.isError) {
    return response.data;
  } else {
    const { nextStep, nextAuthFactor } = response.data.data;
    localStorage.setItem('nextStepOTP', nextStep);
    localStorage.setItem('nextAuthFactorOTP', nextAuthFactor);
    return { currentAuthStep: nextStep, authFactorType: nextAuthFactor };
  }
});

export const completeAuthentication = createAsyncThunk('auth/completeAuthentication', async (payload) => {
  const response = await api.post(`/api/v1/user/authenticate`, payload);
  if (response.data.isError) {
    return response.data;
  } else {
    
    const { token, nextStep, nextAuthFactor } = response.data.data;

    return {token: token, currentAuthStep: nextStep, authFactorType: nextAuthFactor};
  }
});

export const getUser = createAsyncThunk('user/getUser', async () => {
  
  const response = await api.get(`/api/v1/user/getuser`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });
  const user = response.data;
  return user;
});

export const resendOTPReq = createAsyncThunk('auth/resendOTPReq', async (payload) => {
  const response = await api.post(`/api/v1/user/resendpin`, payload);
    return response.data;
});

/**
 * Change password service
 */
export const changePassword = createAsyncThunk('user/changePassword', async (payload) => {
  const response = await api.put('/api/v1/user/changepassword', payload);
  // Check for success & fails response
  if (response && response.status && response.status === 200) {
      return response.data;
  } else {
      return response;
  }
});
