const Persons = ({ persons, handleDelete }) => {
  return (
    <ul>
      {persons.map((person) => (
        <li key={person.id}>
          {person.name} {person.number}{" "}
          <button className="delBtn" onClick={() => handleDelete(person.id)}>
            {""}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Persons;
