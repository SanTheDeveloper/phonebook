const Notification = ({ message, type = "info" }) => {
  if (!message) return null;

  return (
    <div className={`notification notification--${type}`} role="alert">
      {message}
    </div>
  );
};

export default Notification;
