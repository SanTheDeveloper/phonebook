// services/persons.js
import axios from "axios";

const baseUrl = "/api/persons";

/**
 * Service for handling person-related API calls
 */
const personService = {
  /**
   * Fetch all persons from the server
   * @returns {Promise<Array<Person>>} List of persons
   */
  getAll: async () => {
    try {
      const response = await axios.get(baseUrl);
      return response.data.data; // Adjusted for the new API response format
    } catch (error) {
      console.error("Failed to fetch persons:", error);
      throw error;
    }
  },

  /**
   * Create a new person
   * @param {Person} newPerson - The person to create
   * @returns {Promise<Person>} The created person
   */
  create: async (newPerson) => {
    try {
      const response = await axios.post(baseUrl, newPerson);
      return response.data.data;
    } catch (error) {
      console.error("Failed to create person:", error);
      throw error;
    }
  },

  /**
   * Update an existing person
   * @param {string} id - The ID of the person to update
   * @param {Person} updatedPerson - The updated person data
   * @returns {Promise<Person>} The updated person
   */
  update: async (id, updatedPerson) => {
    try {
      const response = await axios.put(`${baseUrl}/${id}`, updatedPerson);
      return response.data.data;
    } catch (error) {
      console.error(`Failed to update person ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a person
   * @param {string} id - The ID of the person to delete
   * @returns {Promise<void>}
   */
  remove: async (id) => {
    try {
      await axios.delete(`${baseUrl}/${id}`);
    } catch (error) {
      console.error(`Failed to delete person ${id}:`, error);
      throw error;
    }
  },
};

export default personService;
