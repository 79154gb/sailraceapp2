import axios from 'axios';

const API_URL = 'http://127.0.0.1:3000'; // http://192.168.0.10:3000 Ensure this is correct

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : new Error('Network error');
  }
};

export const register = async (username, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
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
    throw error;
  }
};

export const getModelsByManufacturer = async manufacturer => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/models/${manufacturer}`,
    );
    return response.data.models.map(model => ({
      label: model.model_name,
      value: model.model_name,
      id: model.id,
    }));
  } catch (error) {
    throw error;
  }
};

export const addBoatToUserAccount = async (
  userId,
  manufacturer,
  modelName,
  boat_name,
  sail_number,
) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      {
        manufacturer,
        modelName,
        boat_name,
        sail_number,
      },
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserBoatDetails = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      {
        params: {manufacturer, modelName},
      },
    );
    return response.data.boatDetails;
  } catch (error) {
    throw error;
  }
};

export const updateUserBoatDetails = async (userId, boatDetails) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      boatDetails,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserBoats = async userId => {
  try {
    const response = await axios.get(
      `${API_URL}/api/dinghy/user-boats/${userId}`,
    );
    return response.data.boats;
  } catch (error) {
    throw error;
  }
};

export const deleteUserBoat = async (userId, manufacturer, modelName) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/dinghy/user-boat-details/${userId}`,
      {
        data: {manufacturer, model_name: modelName},
      },
    );
    return response.data;
  } catch (error) {
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
    throw error;
  }
};

export const updateUserBoatPolars = async (userId, model_id, polars) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/dinghy/user-polars/${userId}`,
      {model_id, polars},
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const uploadActivity = async (userId, file) => {
  try {
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    });

    const response = await axios.post(
      `${API_URL}/api/activities/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error('Failed to upload activity:', error);
    throw error;
  }
};

// Function to get user activities
export const getUserActivities = async userId => {
  try {
    const response = await axios.get(`${API_URL}/api/activities/${userId}`);
    return response.data.activities;
  } catch (error) {
    throw error;
  }
};
export const deleteActivity = async (userId, activityId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/activities/${userId}/${activityId}`,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to delete activity:', error);
    throw error;
  }
};
