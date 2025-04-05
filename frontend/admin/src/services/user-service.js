// services/user-service.js
import axios from "axios";

const API_URL = "http://localhost:3003/users";  // Adjust URL based on your backend


// Create a new user
export const createUser = async (username, email, password) => {
  try {
    const response = await axios.post(API_URL, { username, email, password });
    return response.data; // Return the success message and user data
  } catch (error) {
    throw error.response.data;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/${email}`);
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


// Get a user by ID
export const getUser = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update a user
export const updateUser = async (userId, username, email, password) => {
  try {
    const response = await axios.patch(`${API_URL}/${userId}`, { username, email, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Update user privilege
export const updateUserPrivilege = async (userId, isAdmin) => {
  try {
    const response = await axios.patch(`${API_URL}/${userId}/privilege`, { isAdmin });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Delete a user
export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};


const userService = {
  createUser,
  getUserByEmail,
  getUser,
  getAllUsers,
  updateUser,
  updateUserPrivilege,
  deleteUser,
};

export default userService;