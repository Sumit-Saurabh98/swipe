import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

// Define the structure of your auth user
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  genderPreference: string;
  bio?: string;
  image?: string;
  likes: string[];
  dislikes: string[];
  matches: string[];
  matchPassword?: (enteredPassword: string) => Promise<boolean>;
}

// Define the shape of your store
interface AuthStore {
  authUser: AuthUser | null;
  checkingAuth: boolean;
  loading: boolean;
  signup: (name: string, email: string, password: string, age: number, gender: string, genderPreference: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface ErrorResponse {
  message: string;
}

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  checkingAuth: true,
  loading: false,

  signup: async (name: string, email: string, password: string, age: number, gender: string, genderPreference: string) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post<{ user: AuthUser }>("/auth/signup", { name, email, password, age, gender, genderPreference });
      set({ authUser: res.data.user, loading: false });
      toast.success("Account created successfully");
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse).message || "Error creating account";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.post<{ user: AuthUser }>("/auth/login", { email, password });
      set({ authUser: res.data.user, loading: false });
      toast.success("Logged in successfully");
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse).message || "Error during login";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      set({ loading: false });
    }
  },

  logout: async () =>{
    try {
        const res = await axiosInstance.post<{ user: AuthUser }>("/auth/logout");
        if(res.status === 200){
            set({ authUser: null, checkingAuth: false });
            toast.success("Logged out successfully");
        }
    } catch (error) {
       if (error instanceof AxiosError && error.response) {
        const errorMessage = (error.response.data as ErrorResponse).message || "Error during logout";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
      set({ authUser: null, checkingAuth: false });
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ authUser: res.data.user, checkingAuth: false });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error checking auth:", error.message);
      } else {
        console.error("Unexpected error during auth check:", error);
      }
      set({ authUser: null, checkingAuth: false });
    }finally{
      set({ checkingAuth: false });
    }
  }
}));