const Persons = ({ persons = [], onDelete }) => {
  if (!persons.length) {
    return <p>No contacts to display</p>;
  }

  return (
    <ul className="persons-list">
      {persons.map((person) => (
        <li key={person.id} className="person-item">
          <span className="person-info">
            {person.name} - {person.number}
          </span>
          <button
            className="delete-button"
            onClick={() => onDelete(person.id)}
            aria-label={`Delete ${person.name}`}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Persons;
