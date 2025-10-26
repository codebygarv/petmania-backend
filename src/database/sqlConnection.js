const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Create or connect to database
const db = new sqlite3.Database(
  path.resolve(__dirname, "mydb.sqlite"),
  (err) => {
    if (err) {
      console.error("Error opening database", err.message);
    } else {
      console.log("Connected to SQLite database.");
    }
  }
);

db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS otp_store (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT,
        otp TEXT,
        expires_at INTEGER
      )
    `);
});

module.exports = db;
