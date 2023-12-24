import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isDeleted: false,
};

const isDeletedStateSlice = createSlice({
  name: 'isDeleted',
  initialState: initialState,
  reducers: {
    setDeletedFlag: (state, action) => {
        state.isDeleted = action.payload;
    },
    getIsDeleteFlag: (state) => {
        return state.isDeleted;
    }
  },
});

export const { setDeletedFlag, getIsDeleteFlag } = isDeletedStateSlice.actions;

export default isDeletedStateSlice.reducer;