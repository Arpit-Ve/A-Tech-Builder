import axios from 'axios';

// Automatically use localhost during development, and the Render backend in production
const isDevelopment = process.env.NODE_ENV === 'development';
const API_URL = isDevelopment 
    ? 'http://localhost:5000' 
    : (process.env.REACT_APP_API_URL || 'https://a-tech-builder.onrender.com');

const api = axios.create({ baseURL: API_URL, timeout: 12000 });
export default api;
