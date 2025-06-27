import * as axios from "axios";

// const API_BASE_URL = "https://location-tracker-api-bluez44s-projects.vercel.app/";
const API_BASE_URL = "http://localhost:3000"; // Use your local server URL for development

const instance = axios.default.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export default instance;
