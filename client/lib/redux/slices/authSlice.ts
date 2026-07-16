import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    try {
      const storedToken = localStorage.getItem("astralearn_token");
      const storedUser = localStorage.getItem("astralearn_user");
      return {
        token: storedToken,
        user: storedUser ? JSON.parse(storedUser) : null,
      };
    } catch {
      // Ignore storage read failures (e.g., privacy settings)
    }
  }
  return {
    user: null,
    token: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      if (typeof window !== "undefined") {
        localStorage.setItem("astralearn_token", token);
        localStorage.setItem("astralearn_user", JSON.stringify(user));
      }
    },
    logout(state) {
      state.user = null;
      state.token = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("astralearn_token");
        localStorage.removeItem("astralearn_user");
        localStorage.removeItem("astralearn_goal_id"); // Clean up session goal too
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
