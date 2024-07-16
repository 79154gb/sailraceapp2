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
    const response = await axios.get(`${API_URL}/api/dinghy/manufacturers`);
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
      `${API_URL}/api/dinghy/models/${manufacturer}`,
    );
    console.log('Response from getModelsByManufacturer:', response.data); // Log the response for debugging
    return response.data.models.map((model, index) => ({
      label: model,
      value: model,
      id: index + 1, // Create a dummy id for now since the original response doesn't contain ids
    }));
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
};

export const addBoatToUserAccount = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      {manufacturer, modelName},
    );
    return response.data;
  } catch (error) {
    console.error('Error adding boat to user account:', error);
    throw error;
  }
};

export const getUserBoatDetails = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      {params: {manufacturer, modelName}},
    );
    return response.data.boatDetails;
  } catch (error) {
    console.error('Error fetching boat details:', error);
    throw error;
  }
};

export const updateUserBoatDetails = async (userId, boatDetails) => {
  try {
    const response = await axios.put(
      `http://localhost:3000/api/dinghy/user-boat-details/${userId}`,
      boatDetails,
    );
    return response.data;
  } catch (error) {
    console.error('Error updating boat details:', error);
    throw error;
  }
};

export const getUserBoats = async userId => {
  try {
    const response = await axios.get(
      `http://localhost:3000/api/dinghy/user-boats/${userId}`,
    );
    return response.data.boats;
  } catch (error) {
    console.error('Error fetching user boats:', error);
    throw error;
  }
};

export const deleteUserBoat = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.delete(
      `http://localhost:3000/api/dinghy/user-boat-details/${userId}`,
      {
        data: {
          manufacturer,
          model_name: modelName,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting boat from user account:', error);
    throw error;
  }
};
export const getBoatPolars = async (manufacturer, modelName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/polars?manufacturer=${encodeURIComponent(
        manufacturer,
      )}&modelName=${encodeURIComponent(modelName)}`,
    );
    return response.data.polars;
  } catch (error) {
    console.error('Error fetching boat polars:', error);
    throw error;
  }
};

export const getUserBoatPolars = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/user-polars/${userId}?manufacturer=${encodeURIComponent(
        manufacturer,
      )}&modelName=${encodeURIComponent(modelName)}`,
    );
    return response.data.userPolars;
  } catch (error) {
    console.error('Error fetching user boat polars:', error);
    throw error;
  }
};

export const updateUserBoatPolars = async (userId, polars) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/dinghy/user-polars/${userId}`,
      {polars},
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user boat polars:', error);
    throw error;
  }
};
