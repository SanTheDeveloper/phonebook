import { useState } from "react";

const PersonForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ name: "", number: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="person-form">
      {/* ... rest of the component remains the same ... */}
    </form>
  );
};

export default PersonForm;
