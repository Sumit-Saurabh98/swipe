import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ErrorResponse, useAuthStore } from "./useAuthStore";
import { AuthUser } from "./useAuthStore";

interface UserStore {
  loading: boolean;
  updateProfile: (name: string, age: number, bio: string, gender: string, genderPreference: string, image: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  loading: false,

updateProfile: async (name: string, age: number, bio: string, gender: string, genderPreference: string, image: string) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.put<AuthUser>("/users/update-profile", { name, age, bio, gender, genderPreference, image });
      useAuthStore.getState().setAuthUser(res.data.user); 
      console.log("updating profile check: ",res.data);
      toast.success("Profile updated successfully");
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error updating profile";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },
}));
