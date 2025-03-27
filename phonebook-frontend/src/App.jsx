// App.jsx
import { useEffect, useState } from "react";
import personService from "./services/persons";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Notification from "./components/Notification";

/**
 * Main application component
 */
const App = () => {
  // State management
  const [persons, setPersons] = useState([]);
  const [formData, setFormData] = useState({ name: "", number: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const initialPersons = await personService.getAll();
        setPersons(initialPersons);
      } catch (error) {
        showNotification("Failed to load contacts", "error");
      }
    };

    fetchPersons();
  }, []);

  /**
   * Shows a notification message
   * @param {string} message - The message to display
   * @param {"success"|"error"} type - The type of notification
   */
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: null, type: null }), 5000);
  };

  /**
   * Handles form input changes
   * @param {React.ChangeEvent<HTMLInputElement>} event - The change event
   */
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Handles person submission
   * @param {React.FormEvent} event - The form submit event
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    const { name, number } = formData;

    if (!name || !number) {
      showNotification("Both name and number are required", "error");
      return;
    }

    try {
      const existingPerson = persons.find(
        (person) => person.name.toLowerCase() === name.toLowerCase()
      );

      if (existingPerson) {
        if (
          window.confirm(
            `${name} is already added. Replace the old number with the new one?`
          )
        ) {
          const updatedPerson = await personService.update(existingPerson.id, {
            ...existingPerson,
            number,
          });
          setPersons(
            persons.map((person) =>
              person.id === existingPerson.id ? updatedPerson : person
            )
          );
          showNotification(`Updated ${updatedPerson.name}'s number`, "success");
        }
      } else {
        const newPerson = await personService.create({ name, number });
        setPersons([...persons, newPerson]);
        showNotification(`Added ${newPerson.name}`, "success");
      }

      setFormData({ name: "", number: "" });
    } catch (error) {
      const message = error.response?.data?.error || "An error occurred";
      showNotification(message, "error");
    }
  };

  /**
   * Handles person deletion
   * @param {string} id - The ID of the person to delete
   */
  const handleDelete = async (id) => {
    const personToDelete = persons.find((person) => person.id === id);
    if (!personToDelete) {
      showNotification("This person has already been deleted", "error");
      return;
    }

    if (window.confirm(`Delete ${personToDelete.name}?`)) {
      try {
        await personService.remove(id);
        setPersons(persons.filter((person) => person.id !== id));
        showNotification(`Deleted ${personToDelete.name}`, "success");
      } catch (error) {
        if (error.response?.status === 404) {
          setPersons(persons.filter((person) => person.id !== id));
        }
        showNotification(
          `Failed to delete ${personToDelete.name}: ${error.message}`,
          "error"
        );
      }
    }
  };

  // Filter persons based on search term
  const filteredPersons = searchTerm
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : persons;

  return (
    <div className="app">
      <h1>Phonebook</h1>

      <Notification {...notification} />

      <Filter
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <h2>Add New Contact</h2>
      <PersonForm
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
      />

      <h2>Contacts</h2>
      <Persons persons={filteredPersons} onDelete={handleDelete} />
    </div>
  );
};

export default App;
