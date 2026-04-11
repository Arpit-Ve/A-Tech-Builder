import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
    ? 'http://localhost:5000' 
    : (process.env.REACT_APP_API_URL || 'https://a-tech-builder.onrender.com');

const api = axios.create({ baseURL: API_URL, timeout: 12000 });
export default api;
