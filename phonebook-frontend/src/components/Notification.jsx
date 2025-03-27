/**
 * Displays notification messages with different styles based on type
 * @param {Object} props - Component props
 * @param {string|null} props.message - The notification message to display
 * @param {'success'|'error'|null} props.type - The type of notification (determines styling)
 */
const Notification = ({ message, type }) => {
  // Don't render anything if there's no message
  if (message === null) {
    return null;
  }

  return (
    <div className={`notification ${type}`} role="alert">
      {message}
    </div>
  );
};

export default Notification;
