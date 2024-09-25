import pool from "./db";

(async () => {
  try {
    console.log("Attempting to connect to the database...");
    const res = await pool.query("SELECT NOW()");
    console.log("Database connection successful:", res.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
})();
