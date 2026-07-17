import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
}

const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    try {
      const storedUser = localStorage.getItem("astralearn_user");
      return {
        user: storedUser ? JSON.parse(storedUser) : null,
      };
    } catch {
      // Ignore storage read failures (e.g., privacy settings)
    }
  }
  return {
    user: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ user: User }>
    ) {
      const { user } = action.payload;
      state.user = user;

      if (typeof window !== "undefined") {
        localStorage.setItem("astralearn_user", JSON.stringify(user));
      }
    },
    logout(state) {
      state.user = null;

      if (typeof window !== "undefined") {
        localStorage.removeItem("astralearn_user");
        localStorage.removeItem("astralearn_goal_id"); // Clean up session goal too
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
