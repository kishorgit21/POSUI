import { createSlice } from '@reduxjs/toolkit';

const dialogSlice = createSlice({
  name: 'isDialog',
  initialState: {
    isOpen: false,
  },
  reducers: {
    openDialog: state => {
      state.isOpen = true;
    },
    closeDialog: state => {
      state.isOpen = false;
    },
  },
});

export const { openDialog, closeDialog } = dialogSlice.actions;
export default dialogSlice.reducer;