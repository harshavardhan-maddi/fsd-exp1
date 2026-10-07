// app.js

const express = require("express");

const app = express();
const PORT = 3000;

// ===============================
// MIDDLEWARE
// ===============================

// JSON parsing middleware
app.use(express.json());

// Logger middleware
function logger(req, res, next) {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
  );
  next();
}

// Request timing middleware
function timer(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Request completed in ${duration} ms`);
  });

  next();
}

// Apply middleware globally
app.use(logger);
app.use(timer);

// ===============================
// PART (A) - BASIC ROUTES
// ===============================

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to ExpressJS Routing Demo");
});

// Route parameter
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  res.send(`User ID: ${userId}`);
});

// Query parameters
app.get("/search", (req, res) => {
  const query = req.query.q || "";
  const limit = req.query.limit || "not specified";

  res.send(`Searching for '${query}', limit ${limit}`);
});

// URL building using req.originalUrl
app.get("/url-info", (req, res) => {
  res.json({
    originalUrl: req.originalUrl,
    method: req.method,
  });
});

// Redirect example
app.get("/home", (req, res) => {
  res.redirect("/");
});

// ===============================
// PART (B) - BOOK RESOURCE
// ===============================

let books = [
  {
    id: 1,
    title: "The Hobbit",
    author: "Tolkien",
  },
  {
    id: 2,
    title: "Dune",
    author: "Herbert",
  },
];

let nextId = 3;

// GET /books - Get all books
app.get("/books", (req, res) => {
  res.json(books);
});

// GET /books/:id - Get specific book
app.get("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const book = books.find((book) => book.id === id);

  if (!book) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  res.json(book);
});

// POST /books - Add new book
app.post("/books", (req, res) => {
  const { title, author } = req.body;

  // Validate input
  if (!title || !author) {
    return res.status(400).json({
      message: "Title and author are required",
    });
  }

  const newBook = {
    id: nextId++,
    title,
    author,
  };

  books.push(newBook);

  res.status(201).json(newBook);
});

// DELETE /books/:id - Delete book
app.delete("/books/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const index = books.findIndex((book) => book.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Book not found",
    });
  }

  books.splice(index, 1);

  res.status(204).send();
});

// ===============================
// PART (C) - ROUTE-SPECIFIC MIDDLEWARE
// ===============================

function checkApiKey(req, res, next) {
  if (req.headers["x-api-key"] === "12345") {
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
}

// Example route using route-specific middleware
app.get("/protected", checkApiKey, (req, res) => {
  res.json({
    message: "You have access to the protected route",
  });
});

// ===============================
// 404 HANDLER
// ===============================

app.use((req, res) => {
  res.status(404).send("Route Not Found");
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});