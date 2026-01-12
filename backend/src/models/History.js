import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.sqlite");

db.run(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    image TEXT,
    result TEXT,
    confidence REAL,
    remedy TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
