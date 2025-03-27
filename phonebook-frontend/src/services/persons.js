// Import axios for making HTTP requests
import axios from "axios";

// Base URL for the persons API endpoint
const baseUrl = "/api/persons";

/**
 * Fetches all persons from the server
 * @returns {Promise} A promise that resolves to the array of person objects
 */
const getAll = () => {
  const request = axios.get(baseUrl);
  return request.then((response) => response.data);
};

/**
 * Creates a new person entry on the server
 * @param {Object} newPerson - The person object to create
 * @returns {Promise} A promise that resolves to the newly created person object
 */
const create = (newPerson) => {
  const request = axios.post(baseUrl, newPerson);
  return request.then((response) => response.data);
};

/**
 * Updates an existing person entry on the server
 * @param {string} id - The ID of the person to update
 * @param {Object} updatedPerson - The updated person object
 * @returns {Promise} A promise that resolves to the updated person object
 */
const update = (id, updatedPerson) => {
  const request = axios.put(`${baseUrl}/${id}`, updatedPerson);
  return request.then((response) => response.data);
};

/**
 * Deletes a person entry from the server
 * @param {string} id - The ID of the person to delete
 * @returns {Promise} A promise that resolves when deletion is complete
 * Note: The response.data might be empty depending on your API implementation
 */
const remove = (id) => {
  const request = axios.delete(`${baseUrl}/${id}`);
  return request.then((response) => response.data);
};

// Export all CRUD operations as an object
export default {
  getAll,
  create,
  update,
  remove,
};
