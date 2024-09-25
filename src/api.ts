// src/api.ts
import express from "express";
import pool from "./db";
import cors from "cors"; // Import cors

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Endpoint to fetch all block hashes
app.get("/block-hashes", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT block_hash, fetched_at FROM block_hashes ORDER BY fetched_at DESC"
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error("Error fetching block hashes:", error);
    res.status(500).send("Error fetching block hashes");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
