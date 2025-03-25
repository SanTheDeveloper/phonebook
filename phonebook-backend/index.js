require("dotenv").config();
// Import the Express library
const express = require("express");
const morgan = require("morgan");
const app = express();
// const cors = require("cors");

// Serve static files from the "dist" directory
app.use(express.static("dist"));

/* // Enable CORS for all routes
app.use(cors()); */

// Middleware to parse JSON data in requests
app.use(express.json());

// Define custom token for POST requests
morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

// Custom middleware to choose logging format based on request method
const requestLogger = (req, res, next) => {
  if (req.method === "POST") {
    morgan(
      ":method :url :status :res[content-length] - :response-time ms :body"
    )(req, res, next);
  } else {
    morgan("tiny")(req, res, next);
  }
};

// Use morgan with custom format including the body token
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// Hardcoded phonebook data
let persons = [
  { id: "1", name: "Arto Hellas", number: "040-123456" },
  { id: "2", name: "Ada Lovelace", number: "39-44-5323523" },
  { id: "3", name: "Dan Abramov", number: "12-43-234345" },
  { id: "4", name: "Mary Poppendieck", number: "39-23-6423122" },
];

// 3.1: Return all phonebook entries
app.get("/api/persons", (request, response) => {
  response.json(persons); // Send the entire phonebook as JSON
});

// 3.2: Display info about the phonebook
app.get("/info", (request, response) => {
  const currentTime = new Date(); // Get the current date and time
  const entryCount = persons.length; // Get the number of entries in the phonebook
  response.send(
    `<p>Phonebook has info for ${entryCount} people</p>
     <p>${currentTime}</p>`
  );
});

// 3.3: Fetch a single phonebook entry by ID
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id; // Extract the ID from the URL
  const person = persons.find((p) => p.id === id); // Find the person with the matching ID

  if (person) {
    response.json(person); // Send the person's data as JSON
  } else {
    response.status(404).end(); // Send a 404 error if the person is not found
  }
});

// 3.4: Delete a phonebook entry by ID
app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id; // Extract the ID from the URL
  persons = persons.filter((p) => p.id !== id); // Remove the person with the matching ID
  response.status(204).end(); // Send a 204 (No Content) response
});

// 3.5: Add a new phonebook entry
app.post("/api/persons", (request, response) => {
  const body = request.body; // Extract the request body

  // 3.6: Error handling for missing name or number
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "name or number is missing" });
  }

  // 3.6: Error handling for duplicate names
  const nameExists = persons.some((p) => p.name === body.name);
  if (nameExists) {
    return response.status(400).json({ error: "name must be unique" });
  }

  // Generate a new ID using Math.random
  const newId = Math.floor(Math.random() * 1000000).toString();

  // Create a new person object
  const newPerson = {
    id: newId,
    name: body.name,
    number: body.number,
  };

  // Add the new person to the phonebook
  persons = persons.concat(newPerson);

  // Send the new person's data as JSON
  response.json(newPerson);
});

// Middleware for handling unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" }); // Return 404 for undefined routes
};

// Apply unknown endpoint handler for unmatched routes
app.use(unknownEndpoint);

// Start the server on port 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
