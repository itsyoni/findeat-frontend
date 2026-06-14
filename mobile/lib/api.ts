import axios from "axios";

export const API_URL = "https://famous-boxes-greet.loca.lt";

export const api = axios.create({
  baseURL: API_URL,
});
