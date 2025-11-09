import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchItems = async () => {
  const response = await apiClient.get('/items');
  return response.data;
};

export const fetchItemById = async (id) => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

export const updateItem = async (id, data) => {
  const response = await apiClient.put(`/items/${id}`, data);
  return response.data;
};