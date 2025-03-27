/**
 * Form component for adding new persons to the phonebook
 * @param {Object} props - Component props
 * @param {string} props.newName - Current value of name input
 * @param {string} props.newNumber - Current value of number input
 * @param {Function} props.handleNameChange - Handler for name input changes
 * @param {Function} props.handleNumberChange - Handler for number input changes
 * @param {Function} props.addPerson - Handler for form submission
 */
const PersonForm = ({
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
  addPerson,
}) => {
  return (
    <form onSubmit={addPerson}>
      <div>
        name:{" "}
        <input
          value={newName}
          onChange={handleNameChange}
          placeholder="Enter name"
          required
        />
      </div>
      <div>
        number:{" "}
        <input
          value={newNumber}
          onChange={handleNumberChange}
          placeholder="Enter phone number"
          required
        />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  );
};

export default PersonForm;
