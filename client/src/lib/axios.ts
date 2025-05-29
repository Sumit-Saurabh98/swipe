import axios from "axios";

// TODO: update during deployment
export const axiosInstance = axios.create({
	baseURL: import.meta.env.MODE === "development" ? "http://localhost:8083/api" : "/api",
	withCredentials: true,
});