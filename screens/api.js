// api.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000'; // Replace with your actual local IP and port

export const login = async (email, password) => {
  console.log('Login function called with:', email, password);
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    console.log('Response from server:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error occurred:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const register = async (username, email, password) => {
  console.log('Register function called with:', username, email, password);
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
    });
    console.log('Response from server:', response.data);
    return response.data;
  } catch (error) {
    console.log('Error occurred:', error);
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const getManufacturers = async () => {
  try {
    const response = await axios.get(
      'http://localhost:3000/api/dinghy/manufacturers',
    );
    return response.data.manufacturers.map(manufacturer => ({
      label: manufacturer,
      value: manufacturer,
    }));
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    throw error;
  }
};

export const getModelsByManufacturer = async manufacturer => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/dinghy/models/${manufacturer}`,
    );
    return response.data.models.map(model => ({
      label: model,
      value: model,
    }));
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};
