import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  search: '',
};

const searchStateSlice = createSlice({
  name: 'search',
  initialState: initialState,
  reducers: {
    setSearch: (state, action) => {
        state.search = action.payload;
    },
    getSearch: (state) => {
        return state.search;
    }
  },
});

export const { setSearch, getSearch } = searchStateSlice.actions;

export default searchStateSlice.reducer;