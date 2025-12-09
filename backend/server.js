const express = require("express");
const cors = require("cors");
const { Pool } = require("pg"); // Optionnel pour tests DB

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:8080',
    'http://127.0.0.1:8080',

  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Optionnel : connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || "db",
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || "admin",
  password: process.env.DB_PASSWORD || "secret",
  database: process.env.DB_NAME || "mydb",
});

// --- Chat en mémoire ---
let messages = [];

app.get("/api/messages", (req, res) => {
  res.json(messages);
});

app.post("/api/messages", (req, res) => {
  const { author, content } = req.body;
  if (!author || !content) return res.status(400).json({ error: "author et content requis" });
  const message = { author, content, time: new Date().toISOString() };
  messages.push(message);
  res.status(201).json(message);
});

// --- Optional DB route ---
app.get("/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({
      message: "Data from Database",
      data: result.rows,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message, success: false });
  }
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`API endpoint: http://localhost:${PORT}/api/messages`);
  console.log(`Optional DB endpoint: http://localhost:${PORT}/db`);
});

