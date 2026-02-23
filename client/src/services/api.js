import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers["x-auth-token"] = token;
  }
  return req;
});

// Fixed: Changed /signup to /register to match backend routes
export const login = (formData) => API.post("/auth/login", formData);
export const signup = (formData) => API.post("/auth/register", formData);
export const sendEmail = (emailData) => API.post("/emails/send", emailData);
export const getInbox = (email) => API.get(`/emails/inbox/${email}`);
