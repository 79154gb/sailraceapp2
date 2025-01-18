import axios from 'axios';

const API_URL = 'https://sailracerapp.com';
// http://192.168.0.10:3000 Ensure this is correct

// Set up interceptors
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});

axios.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});

export const login = async (email, password) => {
  try {
    console.log('Attempting to login to URL:', `${API_URL}/api/auth/login`);

    const response = await axios.post(
      `${API_URL}/api/auth/login`,
      {
        email,
        password,
      },
      {
        headers: {
          'Content-Type': 'application/json', // Explicitly set the Content-Type header
        },
      },
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      // The request was made, and the server responded with a status code outside the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made, but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('General Error', error.message);
    }
    console.error('Axios Error config:', error.config);
    throw new Error('Network error');
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
    const response = await axios.get(`${API_URL}/api/dinghy/manufacturers`, {
      headers: {
        Accept: 'application/json', // Set the Accept header to request JSON data
      },
    });
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
      `${API_URL}/api/dinghy/models/${encodeURIComponent(manufacturer)}`,
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
export const getUserKeelBoats = async userId => {
  try {
    const response = await axios.get(
      `${API_URL}/api/keelboat/user-keel-boats/${userId}`,
    );
    return response.data.boats;
  } catch (error) {
    // Handle 404 as a valid case where no boats are found
    if (error.response && error.response.status === 404) {
      console.log('No user keelboats found, returning empty array.');
      return []; // Return empty array or null based on preference
    }
    // For other errors, throw the error to be handled by the caller
    throw error;
  }
};

export const deleteUserBoat = async (
  userId,
  manufacturer,
  modelName,
  isKeelboat = false,
) => {
  try {
    const endpoint = isKeelboat
      ? `${API_URL}/api/keelboat/user-Keelboat-details/${userId}`
      : `${API_URL}/api/dinghy/user-boat-details/${userId}`;

    const response = await axios.delete(endpoint, {
      data: {manufacturer, model_name: modelName},
    });

    return response.data;
  } catch (error) {
    console.error('Failed to delete boat:', error);
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
export const saveRecordedActivity = async (userId, activityData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/activities/${userId}`,
      activityData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Failed to save activity:', error);
    throw error;
  }
};

export const likeActivity = async (userId, activityId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/activities/${activityId}/like`,
      {
        userId,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Failed to like activity:', error);
    throw error;
  }
};

export const addComment = async (userId, activityId, comment) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/activities/${userId}/${activityId}/comments`, // Ensure this matches the updated route
      {
        userId, // Include userId in the request body to satisfy backend requirements
        comment,
      },
    );
    return response.data;
  } catch (error) {
    console.error('Failed to add comment:', error);
    throw error;
  }
};

export const getComments = async (userId, activityId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/activities/${userId}/${activityId}/comments`,
    );

    console.log('Comments data received:', response.data); // Log the complete response

    // Check if comments data is directly under response.data or response.data.comments
    return response.data.comments || response.data; // Use response.data.comments if it's nested
  } catch (error) {
    console.error('Failed to fetch comments:', error);
    throw error;
  }
};

// Fetch keelboat manufacturers
export const getKeelboatManufacturers = async () => {
  try {
    console.log('Starting request to fetch keelboat manufacturers...');
    const response = await axios.get(`${API_URL}/api/keelboat/manufacturers`, {
      headers: {
        Accept: 'application/json', // Request JSON data
      },
    });
    console.log('Keelboat manufacturers response:', response.data);
    return response.data.manufacturers.map(manufacturer => ({
      label: manufacturer,
      value: manufacturer,
    }));
  } catch (error) {
    console.error('Error fetching keelboat manufacturers:', error);
    throw error;
  }
};

// Fetch keelboat models by manufacturer
export const getKeelboatModelsByManufacturer = async manufacturer => {
  try {
    console.log(
      `Starting request to fetch keelboat models for: ${manufacturer}`,
    );
    const response = await axios.get(
      `${API_URL}/api/keelboat/model/${encodeURIComponent(manufacturer)}`,
    );
    console.log('Keelboat models response:', response.data);
    return response.data.models.map(model => ({
      label: model.model, // Ensure 'model.model' is correct
      value: model.model,
      id: model.id,
    }));
  } catch (error) {
    console.error('Error fetching keelboat models:', error);
    throw error;
  }
};

export const getUserKeelboatDetails = async (userId, modelId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/keelboat/user-keelboat-details/${userId}/${modelId}`,
    );

    return response.data;
  } catch (error) {
    // Handle 404 without logging as an error, treat as "no data found"
    if (error.response && error.response.status === 404) {
      return null; // Return null to indicate absence of user-specific details
    }
    // Log unexpected errors
    console.error('Unexpected error fetching user keelboat details:', error);
    throw error;
  }
};

// Fetch specific keelboat details by keelboat ID
// Fetch specific keelboat details by manufacturer and model name
export const getKeelboatDetails = async (
  manufacturer,
  modelName,
  userId,
  modelId,
) => {
  try {
    console.log(
      `Fetching details for Manufacturer: ${manufacturer}, Model: ${modelName}, UserId: ${userId}, ModelId: ${modelId}`,
    );

    // Add userId and modelId as query parameters
    const response = await axios.get(
      `${API_URL}/api/keelboat/details/${encodeURIComponent(
        manufacturer,
      )}/${encodeURIComponent(modelName)}`,
      {
        params: {
          userId, // Optional: will be included only if defined
          modelId, // Optional: will be included only if defined
        },
      },
    );

    if (!response.data) {
      throw new Error('No data returned from API');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching keelboat details:', error);
    throw error;
  }
};

export const updateUserKeelboat = async (userId, keelboatDetails) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/keelboat/user-keelboat-details/${userId}`,
      keelboatDetails,
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update user keelboat details:', error);
    throw error;
  }
};

export const addUserKeelboat = async (userId, keelboatData) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/keelboat/user/${userId}/keelboats`,
      keelboatData,
    );
    return response.data;
  } catch (error) {
    console.error('Error adding keelboat:', error);
    throw error;
  }
};
// Fetch keelboat polars by manufacturer and model
export const getkeelboatPolars = async (manufacturer, modelName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/keelboat/polars?manufacturer=${encodeURIComponent(
        manufacturer,
      )}&modelName=${encodeURIComponent(modelName)}`,
    );
    return response.data.polars;
  } catch (error) {
    console.error('Error fetching keelboat polars:', error);
    throw error;
  }
};

// Fetch user-specific keelboat polars
export const getUserKeelBoatPolars = async (
  userId,
  manufacturer,
  modelName,
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/keelboat/user-polars/${userId}?manufacturer=${encodeURIComponent(
        manufacturer,
      )}&modelName=${encodeURIComponent(modelName)}`,
    );
    return response.data.userPolars;
  } catch (error) {
    console.error('Error fetching user keelboat polars:', error);
    throw error;
  }
};

// Update user-specific keelboat polars
export const updateUserKeelBoatPolars = async (userId, model_id, polars) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/keelboat/user-polars/${userId}`,
      {model_id, polars},
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user keelboat polars:', error);
    throw error;
  }
};
