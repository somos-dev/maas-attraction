import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OnboardingState {
  completed: boolean;
  authStartScreen: "Login" | "Register" | null;
}

const initialState: OnboardingState = {
  completed: false,
  authStartScreen: null,
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    completeOnboarding: (state, action: PayloadAction<"Login" | "Register" | null>) => {
      state.completed = true;
      state.authStartScreen = action.payload;
    },
    resetOnboarding: (state) => {
      state.completed = false;
      state.authStartScreen = null;
    },
  },
});

export const { completeOnboarding, resetOnboarding } = onboardingSlice.actions;
export default onboardingSlice.reducer;


