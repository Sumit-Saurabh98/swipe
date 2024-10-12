import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ErrorResponse } from "./useAuthStore";
import { AuthUser } from "./useAuthStore";
import { getSocket } from "../socket/socket.client";

export interface Match {
  _id: string;
  name: string;
  image: string;
}

export interface MatchStore {
  isLoadingMyMatches: boolean;
  isLoadingUserProfiles: boolean;
  matches: Match[];
  userProfiles: AuthUser[];
  swipeFeedback: string | null;
  getMyMatches: () => Promise<void>;
  getUserProfiles: () => Promise<void>;
  swipeLeft: (user: AuthUser) => Promise<void>;
  swipeRight: (user: AuthUser) => Promise<void>;
  subscribeToNewMatches: () => void;
  unsubscribeFromNewMatches: () => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  matches: [],
  isLoadingMyMatches: false,
  isLoadingUserProfiles: false,
  userProfiles: [],
  swipeFeedback: null,

  getMyMatches: async () => {
    try {
      set({ isLoadingMyMatches: true });
      const res = await axiosInstance.get("/matches");
      set({ matches: res.data.matches, isLoadingMyMatches: false });
    } catch (error) {
      set({ matches: [] });
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error to fetch matches";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isLoadingMyMatches: false });
    }
  },

  getUserProfiles: async () => {
    try {
      set({ isLoadingUserProfiles: true });
      const res = await axiosInstance.get("/matches/user-profiles");
      set({ userProfiles: res.data.users, isLoadingUserProfiles: false });
    } catch (error) {
      set({ userProfiles: [] });
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error to fetch user profiles";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ isLoadingUserProfiles: false });
    }
  },

  swipeLeft: async (user) => {
    try {
      set({ swipeFeedback: "passed" });
      await axiosInstance.post("/matches/swipe-left/" + user._id);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error to fetch user profiles";
        console.log(errorMessage);
        toast.error("Failed to swipe left");
      } else {
        toast.error("An unexpected error occurred during swipe left");
      }
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 1500);
    }
  },

  swipeRight: async (user) => {
    try {
      set({ swipeFeedback: "liked" });
      await axiosInstance.post("/matches/swipe-right/" + user._id);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error to fetch user profiles";
        console.log(errorMessage);
        toast.error("Failed to swipe right");
      } else {
        toast.error("An unexpected error occurred during swipe right");
      }
    } finally {
      setTimeout(() => {
        set({ swipeFeedback: null });
      }, 1500);
    }
  },

  subscribeToNewMatches: () => {
    try {
      const socket = getSocket();
      socket.on("newMatch", (newMatch) => {
        set((state) => ({
          matches: [...state.matches, newMatch],
        }));
        toast.success("You got anew match!");
      });
    } catch (error) {
      console.log(error);
    }
  },

  unsubscribeFromNewMatches: () => {
    try {
      const socket = getSocket();
      socket.off("newMatch");
    } catch (error) {
      console.log(error);
    }
  },
}));
