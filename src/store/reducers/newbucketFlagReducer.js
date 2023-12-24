import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  newbucketFlag: false,
  enquirybucketFlag: false,
};

const newbucketFlagSlice = createSlice({
  name: 'Bucket',
  initialState: initialState,
  reducers: {
    setNewBucketFlag: (state, action) => {
      state.newbucketFlag = action.payload;
    },
    getNewBucketFlag: (state) => {
      return state.newbucketFlag;
    },
    setEnquiryBucketFlag: (state, action) => {
      state.enquirybucketFlag = action.payload;
    },
    getEnquiryBucketFlag: (state) => {
      return state.enquirybucketFlag;
    }
  },
});

export const { setNewBucketFlag, getNewBucketFlag, setEnquiryBucketFlag } = newbucketFlagSlice.actions;

export default newbucketFlagSlice.reducer;