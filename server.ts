import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Initialize Database
const dbPath = path.join(process.cwd(), "dictionary.db");
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    definition TEXT NOT NULL,
    usage TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/words", (req, res) => {
    try {
      const stmt = db.prepare("SELECT * FROM words ORDER BY created_at DESC");
      const words = stmt.all();
      res.json(words);
    } catch (error) {
      console.error("Error fetching words:", error);
      res.status(500).json({ error: "Failed to fetch words" });
    }
  });

  app.post("/api/words", (req, res) => {
    try {
      const { word, definition, usage } = req.body;
      if (!word || !definition) {
        return res.status(400).json({ error: "Word and definition are required" });
      }

      // Check if word already exists to avoid duplicates (optional, but good UX)
      // For this specific request, "automatically adds... to vocabulary book", 
      // we might want to update the timestamp if it exists, or just ignore.
      // Let's just insert/ignore or insert new.
      
      const checkStmt = db.prepare("SELECT id FROM words WHERE word = ?");
      const existing = checkStmt.get(word);

      if (existing) {
        // Update the definition/usage and timestamp
        const updateStmt = db.prepare(`
          UPDATE words 
          SET definition = ?, usage = ?, created_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `);
        updateStmt.run(definition, usage, existing.id);
        res.json({ message: "Word updated", id: existing.id });
      } else {
        const insertStmt = db.prepare("INSERT INTO words (word, definition, usage) VALUES (?, ?, ?)");
        const info = insertStmt.run(word, definition, usage);
        res.json({ message: "Word added", id: info.lastInsertRowid });
      }
    } catch (error) {
      console.error("Error adding word:", error);
      res.status(500).json({ error: "Failed to add word" });
    }
  });
  
  app.delete("/api/words/:id", (req, res) => {
      try {
          const { id } = req.params;
          const deleteStmt = db.prepare("DELETE FROM words WHERE id = ?");
          deleteStmt.run(id);
          res.json({ message: "Word deleted" });
      } catch (error) {
          res.status(500).json({ error: "Failed to delete word" });
      }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if built)
    // For this environment, we mostly rely on dev mode, but good practice:
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
