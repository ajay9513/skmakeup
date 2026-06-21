import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUserDto } from '@sk-makeup/shared';

interface AuthState {
  accessToken: string | null;
  user: AuthUserDto | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: sessionStorage.getItem('accessToken'),
  user: sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null,
  isAuthenticated: !!sessionStorage.getItem('accessToken'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ accessToken: string; user: AuthUserDto }>) {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      sessionStorage.setItem('accessToken', action.payload.accessToken);
      sessionStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
      state.isAuthenticated = false;
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
