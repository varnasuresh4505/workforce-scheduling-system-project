import axios from "axios";

const rawBaseUrl =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
});

export default API;
