const Filter = ({ value, onChange }) => {
  return (
    <div className="filter">
      <label htmlFor="filter">Filter contacts:</label>
      <input
        id="filter"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name..."
      />
    </div>
  );
};

export default Filter;
