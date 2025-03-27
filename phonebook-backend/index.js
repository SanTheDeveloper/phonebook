// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const Person = require("./models/person");
const morgan = require("morgan");

// Initialize Express application
const app = express();

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// Serve static files from the "dist" directory (frontend build)
app.use(express.static("dist"));

// Parse JSON bodies in requests
app.use(express.json());

/**
 * Custom Morgan token to log request bodies
 * Only used for POST requests to avoid cluttering logs
 */
morgan.token("body", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});

/**
 * Request logger middleware with conditional formatting:
 * - Detailed log for POST requests (includes request body)
 * - Minimal log for other methods
 */
app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.body(req, res),
    ].join(" ");
  })
);

// ======================
// ROUTE HANDLERS
// ======================

/**
 * GET /api/persons
 * Returns all phonebook entries
 */
app.get("/api/persons", async (request, response) => {
  try {
    const persons = await Person.find({});
    response.json(persons);
  } catch (error) {
    console.error("Error fetching persons:", error);
    response.status(500).json({ error: "Failed to fetch persons" });
  }
});

/**
 * GET /info
 * Returns phonebook metadata (count and current time)
 */
app.get("/info", async (request, response) => {
  try {
    const count = await Person.countDocuments({});
    response.send(`
      <p>Phonebook has info for ${count} people</p>
      <p>${new Date()}</p>
    `);
  } catch (error) {
    console.error("Error fetching info:", error);
    response.status(500).json({ error: "Failed to fetch phonebook info" });
  }
});

/**
 * GET /api/persons/:id
 * Returns a single phonebook entry by ID
 */
app.get("/api/persons/:id", async (request, response) => {
  try {
    const person = await Person.findById(request.params.id);
    if (!person) {
      return response.status(404).json({ error: "Person not found" });
    }
    response.json(person);
  } catch (error) {
    console.error("Error fetching person:", error);
    response.status(400).json({ error: "Malformatted id" });
  }
});

/**
 * POST /api/persons
 * Creates a new phonebook entry
 */
app.post("/api/persons", async (request, response) => {
  const { name, number } = request.body;

  // Validate required fields
  if (!name || !number) {
    return response.status(400).json({
      error: "Both name and number are required",
    });
  }

  // Check for duplicate name
  const existingPerson = await Person.findOne({ name });
  if (existingPerson) {
    return response.status(400).json({
      error: "Name must be unique",
    });
  }

  try {
    const newPerson = new Person({ name, number });
    const savedPerson = await newPerson.save();
    response.status(201).json(savedPerson);
  } catch (error) {
    console.error("Error saving person:", error);
    response.status(500).json({
      error: "Failed to create person",
      details: error.message,
    });
  }
});

app.put("api/persons/:id", async (request, response) => {
  const { name, number } = request.body;

  try {
    const person = await Person.findById(request.params.id);
    if (!person) {
      response.status(404).json({ error: "Person not found" });
    }
    person.number = number;
    const updatedPerson = await person.save();
    response.json(updatedPerson);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/persons/:id
 * Deletes a phonebook entry by ID
 */
app.delete("/api/persons/:id", async (request, response) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(request.params.id);
    if (!deletedPerson) {
      return response.status(404).json({ error: "Person not found" });
    }
    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

// ======================
// ERROR HANDLING
// ======================

/**
 * Handle unknown endpoints
 */
const unknownEndpoint = (request, response) => {
  response.status(404).json({
    error: "Unknown endpoint",
    availableEndpoints: [
      "GET /api/persons",
      "GET /api/persons/:id",
      "POST /api/persons",
      "PUT /api/persons/:id",
      "DELETE /api/persons/:id",
    ],
  });
};
app.use(unknownEndpoint);

/**
 * Error handling middleware
 */
const errorHandler = (error, request, response, next) => {
  console.error("Error:", error.message);

  // Handle CastError (invalid ID format)
  if (error.name === "CastError") {
    return response.status(400).json({
      error: "Invalid ID format",
      details: "The provided ID is not valid",
    });
  }

  // Handle ValidationError
  if (error.name === "ValidationError") {
    return response.status(400).json({
      error: "Validation failed",
      details: error.message,
    });
  }

  // Handle other errors
  response.status(500).json({
    error: "Internal server error",
    details: error.message,
  });

  next(error);
};
app.use(errorHandler);

// ======================
// SERVER INITIALIZATION
// ======================

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
