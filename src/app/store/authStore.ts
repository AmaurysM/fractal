import { persist } from "zustand/middleware";
import { create } from "zustand";
import { User } from "../../../types/types";

type AuthStore = {
  user: User | null;
  loadingUser: true | false;
  setUser: (user: User | null) => void;
};

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  loadingUser: false,
  setUser: (newUser: User | null) => {
    set({
      user: newUser,
    });
  },
}));
