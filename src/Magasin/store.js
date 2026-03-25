
import { configureStore, createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: () => {
    return localStorage.getItem('CURRENT_USER_DATA') ?? null
  },
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;
      localStorage.setItem('CURRENT_USER_DATA', JSON.stringify(userData));
      return userData;
    },
    clearUser: () => null,
  },
});

export const { setUser, clearUser } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;
