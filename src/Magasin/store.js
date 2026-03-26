
import { configureStore, createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: () => {
    const savedUser = localStorage.getItem('user');
    try {
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  },
  reducers: {
    setUser: (state, action) => {
      const userData = action.payload;
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    },
    clearUser: () => {
      localStorage.removeItem('user');
      return null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
});

export default store;
