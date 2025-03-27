// Load environment variables first
require("dotenv").config();

// Import required modules
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");

// Initialize Express application
const app = express();

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// Security best practice - hide Express server info
app.disable("x-powered-by");

// Serve static frontend files
app.use(express.static("dist"));

// Parse JSON bodies with size limit
app.use(express.json({ limit: "10kb" }));

/**
 * Enhanced request logging middleware
 * - Logs all requests with response time
 * - Includes request body for POST/PUT methods
 */
morgan.token("body", (req) => {
  return ["POST", "PUT"].includes(req.method) ? JSON.stringify(req.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

// ======================
// ROUTE HANDLERS
// ======================

/**
 * GET /api/persons
 * Retrieves all phonebook entries with optional performance metrics
 */
app.get("/api/persons", async (req, res, next) => {
  try {
    // Add caching headers (client-side cache for 1 minute)
    res.set("Cache-Control", "public, max-age=60");

    const persons = await Person.find({}).lean();
    res.json({
      success: true,
      count: persons.length,
      data: persons,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /info
 * Provides phonebook metadata with server information
 */
app.get("/info", async (req, res, next) => {
  try {
    const count = await Person.estimatedDocumentCount();
    res.type("html").send(`
      <div style="font-family: sans-serif">
        <h1>Phonebook Info</h1>
        <p>Total entries: ${count}</p>
        <p>Server time: ${new Date()}</p>
        <p>Node environment: ${process.env.NODE_ENV || "development"}</p>
      </div>
    `);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/persons/:id
 * Retrieves a single phonebook entry with enhanced error handling
 */
app.get("/api/persons/:id", async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id);

    if (!person) {
      return res.status(404).json({
        success: false,
        error: `Person with id ${req.params.id} not found`,
      });
    }

    res.json({
      success: true,
      data: person,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/persons
 * Creates a new phonebook entry with comprehensive validation
 */
app.post("/api/persons", async (req, res, next) => {
  try {
    const { name, number } = req.body;

    // Validate input
    if (!name || !number) {
      return res.status(400).json({
        success: false,
        error: "Both name and number are required",
        requiredFields: ["name", "number"],
      });
    }

    // Check for duplicates
    const exists = await Person.findOne({ name });
    if (exists) {
      return res.status(409).json({
        success: false,
        error: `${name} already exists in phonebook`,
        existingId: exists._id,
      });
    }

    const newPerson = new Person({ name, number });
    const savedPerson = await newPerson.save();

    res.status(201).json({
      success: true,
      data: savedPerson,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/persons/:id
 * Updates an existing phonebook entry with proper versioning
 */
app.put("/api/persons/:id", async (req, res, next) => {
  try {
    const { name, number } = req.body;
    const update = { number };

    // Prevent name changes through PUT
    if (name) {
      return res.status(400).json({
        success: false,
        error: "Name cannot be updated through this endpoint",
      });
    }

    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      update,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    );

    if (!updatedPerson) {
      return res.status(404).json({
        success: false,
        error: `Person with id ${req.params.id} not found`,
      });
    }

    res.json({
      success: true,
      data: updatedPerson,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/persons/:id
 * Deletes a phonebook entry with confirmation
 */
app.delete("/api/persons/:id", async (req, res, next) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(req.params.id);

    if (!deletedPerson) {
      return res.status(404).json({
        success: false,
        error: `Person with id ${req.params.id} not found`,
      });
    }

    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// ======================
// ERROR HANDLING
// ======================

/**
 * Handle 404 - Unknown endpoints
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    availableEndpoints: [
      { method: "GET", path: "/api/persons", description: "List all entries" },
      {
        method: "GET",
        path: "/api/persons/:id",
        description: "Get single entry",
      },
      { method: "POST", path: "/api/persons", description: "Create new entry" },
      { method: "PUT", path: "/api/persons/:id", description: "Update entry" },
      {
        method: "DELETE",
        path: "/api/persons/:id",
        description: "Delete entry",
      },
    ],
    documentation: process.env.API_DOCS_URL || "See documentation for details",
  });
});

/**
 * Centralized error handler
 */
app.use((error, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, error);

  // Handle different error types
  let status = 500;
  let message = "An unexpected error occurred";

  if (error.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  } else if (error.name === "ValidationError") {
    status = 422;
    message = "Validation failed";
  } else if (error.name === "MongoServerError" && error.code === 11000) {
    status = 409;
    message = "Duplicate entry detected";
  }

  res.status(status).json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
  });
});

// ======================
// SERVER INITIALIZATION
// ======================

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  server.close(() => process.exit(1));
});
