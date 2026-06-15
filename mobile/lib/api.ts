import axios from "axios";

export const API_URL = "https://findeat-production.up.railway.app";

export const api = axios.create({
  baseURL: API_URL,
});
