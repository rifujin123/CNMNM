import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://192.168.4.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getTokenFromStorage();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response && response.data) return response.data;
    return response;
  },
  (error) => {
    console.error(
      "API Error:",
      error.response ? error.response.data : error.message,
    );
    throw error;
  },
);

export default apiClient;
