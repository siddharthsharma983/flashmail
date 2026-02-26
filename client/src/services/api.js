import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);

// Rooms
export const createRoom = (data) => API.post("/rooms/create", data);
export const myRooms = () => API.get("/rooms/mine");
export const requestJoin = (code) => API.post("/rooms/request-join", { code });
export const getPending = (code) => API.get(`/rooms/${code}/pending`);
export const approveUser = (code, email) =>
  API.post(`/rooms/${code}/approve`, { email });
export const kickUser = (code, email) =>
  API.post(`/rooms/${code}/kick`, { email });
export const blockUser = (code, email) =>
  API.post(`/rooms/${code}/block`, { email });
