/**
 * Displays a list of persons with delete buttons
 * @param {Object} props - Component props
 * @param {Array} props.persons - Array of person objects to display
 * @param {Function} props.handleDelete - Function to call when delete button is clicked
 */
const Persons = ({ persons, handleDelete }) => {
  return (
    <ul>
      {persons.map((person) => (
        <li key={person.id}>
          {person.name} {person.number}{" "}
          <button
            className="delBtn"
            onClick={() => handleDelete(person.id)}
            aria-label={`Delete ${person.name}`}
          ></button>
        </li>
      ))}
    </ul>
  );
};

export default Persons;
