import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/analiseDeProjetos'
});


api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.log('Token expirado ou inválido');
            
        }
        return Promise.reject(error);
    }
);

export default api;