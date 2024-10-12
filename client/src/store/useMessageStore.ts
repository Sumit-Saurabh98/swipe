import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { ErrorResponse } from "./useAuthStore";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  content: string;
}

export interface MessageStore {
  messages: Message[];
  loading: boolean;
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  loading: true,

  sendMessage: async (receiverId, content) => {
    try {
         set(state => ({
            messages: [...state.messages, {
                _id: String(Date.now()), 
                senderId: useAuthStore.getState().authUser?._id || "",
                receiverId: receiverId,
                content: content
            }]
    }))
      const res = await axiosInstance.post(`/messages/send-message`, {
        receiverId,
        content,
      });
      console.log("Message sent successfully", res.data);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage =
          (error.response.data as ErrorResponse).message ||
          "Error to fetch user profiles";
        console.log(errorMessage);
        toast.error(error.response.data.message || "Something went wrong");
      } else {
        toast.error("An unexpected error occurred during swipe right");
      }
    }
  },

  getMessages: async (userId) => {
    try {
      set({ loading: true });
      const res = await axiosInstance.get(`/messages/conversation/${userId}`);
      set({ messages: res.data.messages, loading: false });
    } catch (error) {
      console.log(error);
      set({ messages: [], loading: false });
    } finally {
      set({ loading: false });
    }
  },

  subscribeToMessages: async () =>{
    const socket = getSocket();
    socket.on("newMessage", ({message}) => {
        set((state) => ({ messages: [...state.messages, message] }))
    })
  },

  unsubscribeFromMessages: async () =>{
    const socket = getSocket();
    socket.off("newMessage");
  }
}));
