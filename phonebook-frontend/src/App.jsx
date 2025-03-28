// Import React hooks and components
import { useEffect, useState } from "react";
import personService from "./services/persons";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Notification from "./components/Notification";

const App = () => {
  // State management for the application
  const [persons, setPersons] = useState([]); // Stores the list of phonebook entries
  const [newName, setNewName] = useState(""); // Stores the new name input
  const [newNumber, setNewNumber] = useState(""); // Stores the new number input
  const [searchTerm, setSearchTerm] = useState(""); // Stores the search filter term
  const [notification, setNotification] = useState({
    message: null, // Notification message content
    type: null, // Notification type ('success' or 'error')
  });

  // Fetch all persons from the server when component mounts
  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []); // Empty dependency array means this runs only once on mount

  /**
   * Handles adding a new person or updating an existing one
   * @param {Event} event - The form submission event
   */
  const addPerson = (event) => {
    event.preventDefault();

    // Check if person already exists (case-insensitive comparison)
    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingPerson) {
      // If person exists, confirm if user wants to update the number
      if (
        window.confirm(
          `${newName} is already added to the phonebook. Replace the old number with the new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        personService
          .update(existingPerson.id, updatedPerson)
          .then((returendPerson) => {
            // Update the person in the local state
            setPersons(
              persons.map((person) =>
                person.id === existingPerson.id ? returendPerson : person
              )
            );
            // Reset form fields
            setNewName("");
            setNewNumber("");
            // Show success notification
            setNotification({
              message: `Updated ${returendPerson.name}'s number`,
              type: "success",
            });
            // Clear notification after 5 seconds
            setTimeout(() => {
              setNotification({ message: null, type: null });
            }, 5000);
          })
          .catch((error) => {
            // Handle case where person was already removed from server
            setNotification({
              message: `Information of ${existingPerson.name} has already been removed from the server`,
              type: "error",
            });
            setTimeout(() => {
              setNotification({ message: null, type: null });
            }, 5000);
            // Remove the person from local state
            setPersons(
              persons.filter((person) => person.id !== existingPerson.id)
            );
          });
      }
      return;
    }

    // Create new person object
    const personObject = {
      name: newName.trim(),
      number: newNumber.trim(),
    };

    // Add new person to server and update local state
    personService
      .create(personObject)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        // Reset form fields
        setNewName("");
        setNewNumber("");
        // Show success notification
        setNotification({
          message: `Added ${returnedPerson.name}`,
          type: "success",
        });
      })
      .catch((error) => {
        setNotification({
          message: error.response.data.details,
          type: "error",
        });
        // Clear notification after 5 seconds
        setTimeout(() => {
          setNotification({ message: null, type: null });
        }, 5000);
      });
  };

  // Event handlers for form inputs
  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Filter persons based on search term (case-insensitive)
  const filteredPersons = searchTerm
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : persons;

  /**
   * Handles deleting a person from the phonebook
   * @param {string} id - The ID of the person to delete
   */
  const handleDelete = (id) => {
    const person = persons.find((person) => person.id === id);

    // Handle case where person is not found
    if (!person) {
      setNotification({
        message: "This person has already been deleted.",
        type: "success",
      });
      setTimeout(() => {
        setNotification({ message: null, type: null });
      }, 5000);
      return;
    }

    // Confirm deletion with user
    if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          // Remove person from local state
          setPersons(persons.filter((person) => person.id !== id));
          // Show success notification
          setNotification({
            message: `Deleted ${person.name}`,
            type: "success",
          });
          setTimeout(() => {
            setNotification({ message: null, type: null });
          }, 5000);
        })
        .catch((error) => {
          // Handle case where person was already removed from server
          setNotification({
            message: `The person '${person.name}' was already removed from the server`,
            type: "error",
          });
          setTimeout(() => {
            setNotification({ message: null, type: null });
          }, 5000);
          // Remove person from local state
          setPersons(persons.filter((person) => person.id !== id));
        });
    }
  };

  // Render the application UI
  return (
    <div>
      <h2>Phonebook</h2>
      {/* Notification component for showing messages to user */}
      <Notification message={notification.message} type={notification.type} />

      {/* Search filter component */}
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />

      <h2>add a new</h2>
      {/* Form for adding new persons */}
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />

      <h2>Numbers</h2>
      {/* List of persons (filtered by search term) */}
      <Persons persons={filteredPersons} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
