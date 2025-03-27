import { useEffect, useState } from "react";
import personService from "./services/persons";
import Filter from "./components/Filter";
import PersonForm from "./components/PersonForm";
import Persons from "./components/Persons";
import Notification from "./components/Notification";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    message: null,
    type: null,
  });

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const addPerson = (event) => {
    event.preventDefault();

    const existingPerson = persons.find(
      (person) => person.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added to the phonebook. Replace the old number with the new one?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        personService
          .update(existingPerson.id, updatedPerson)
          .then((returendPerson) => {
            setPersons(
              persons.map((person) =>
                person.id === existingPerson.id ? returendPerson : person
              )
            );
            setNewName("");
            setNewNumber("");
            setNotification({
              message: `Updated ${returendPerson.name}'s number`,
              type: "success",
            });
            setTimeout(() => {
              setNotification({ message: null, type: null });
            }, 5000);
          })
          .catch((error) => {
            setNotification({
              message: `Information of ${existingPerson.name} has already been removed from the server`,
              type: "error",
            });
            setTimeout(() => {
              setNotification({ message: null, type: null });
            }, 5000);
            setPersons(
              persons.filter((person) => person.id !== existingPerson.id)
            );
          });
      }
      return;
    }

    const personObject = {
      name: newName.trim(),
      number: newNumber.trim(),
    };

    personService.create(personObject).then((returnedPerson) => {
      setPersons(persons.concat(returnedPerson));
      setNewName("");
      setNewNumber("");
      setNotification({
        message: `Added ${returnedPerson.name}`,
        type: "success",
      });
      setTimeout(() => {
        setNotification({ message: null, type: null });
      }, 5000);
    });
  };

  const handleNameChange = (event) => {
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredPersons = searchTerm
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : persons;

  const handleDelete = (id) => {
    const person = persons.find((person) => person.id === id);

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

    if (window.confirm(`Are you sure you want to delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id));
          setNotification({
            message: `Deleted ${person.name}`,
            type: "success",
          });
          setTimeout(() => {
            setNotification({ message: null, type: null });
          }, 5000);
        })
        .catch((error) => {
          setNotification({
            message: `The person '${person.name}' was already removed from the server`,
            type: "error",
          });
          setTimeout(() => {
            setNotification({ message: null, type: null });
          }, 5000);
          setPersons(persons.filter((person) => person.id !== id));
        });
    }
  };

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={notification.message} type={notification.type} />
      <Filter searchTerm={searchTerm} handleSearchChange={handleSearchChange} />
      <h2>add a new</h2>
      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      <h2>Numbers</h2>
      <Persons persons={filteredPersons} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
