// Import the mongoose library for MongoDB interaction
const mongoose = require("mongoose");

// Disable strict query mode to allow for more flexible queries
mongoose.set("strictQuery", false);

// Get the MongoDB connection URI from environment variables
const url = process.env.MONGODB_URI;

console.log("connecting to", url);

// Establish connection to MongoDB
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.error("error connecting to MongoDB:", error.message);
  });

// Define the schema for a Person document in MongoDB
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3, // Name must be at least 3 characters long
    required: true, // Name is a required field
  },
  number: {
    type: String,
    minlength: 8, // Phone number must be at least 8 characters long
    validate: {
      // Custom validator for phone number format (XX-XXXX... or XXX-XXXX...)
      validator: function (v) {
        return /^\d{2,3}-\d+$/.test(v);
      },
      // Custom error message if validation fails
      message: (props) => `${props.value} is not a valid phone number!`,
    },
    required: true, // Phone number is a required field
  },
});

// Transform the document when converting to JSON
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    // Convert _id (ObjectID) to id (string)
    returnedObject.id = returnedObject._id.toString();
    // Remove _id and __v fields from the returned object
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

// Create and export the Person model based on the schema
module.exports = mongoose.model("Person", personSchema);
