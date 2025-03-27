/**
 * Search filter component for the phonebook
 * @param {Object} props - Component props
 * @param {string} props.searchTerm - Current filter value
 * @param {Function} props.handleSearchChange - Handler for filter input changes
 */
const Filter = ({ searchTerm, handleSearchChange }) => {
  return (
    <div>
      filter shown with{" "}
      <input
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search contacts..."
        aria-label="Search contacts"
      />
    </div>
  );
};

export default Filter;
