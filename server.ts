import express from "express";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initial default mocks
const DEFAULT_MOCK_ENTRIES = [
  { name: "SONIC_91", password: "191", score: 238, userStickers: "[]", timestamp: Date.now() - 86400000 * 3, isMock: true },
  { name: "Mario_Bros", password: "333", score: 215, userStickers: "[]", timestamp: Date.now() - 86400000 * 2, isMock: true },
  { name: "ALEX_KIDD", password: "148", score: 185, userStickers: "[]", timestamp: Date.now() - 86400000 * 5, isMock: true },
  { name: "SHINOBI_16", password: "777", score: 142, userStickers: "[]", timestamp: Date.now() - 86400000 * 1, isMock: true },
  { name: "GOLDEN_AXE", password: "412", score: 108, userStickers: "[]", timestamp: Date.now() - 86400000 * 10, isMock: true },
  { name: "MASTER_BOY", password: "520", score: 55, userStickers: "[]", timestamp: Date.now() - 86400000 * 12, isMock: true },
];

const FALLBACK_FILE = path.join(process.cwd(), "local_rankings.json");

// Fallback logic
function getFallbackRankings(): any[] {
  if (fs.existsSync(FALLBACK_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(FALLBACK_FILE, "utf8"));
    } catch (_) {
      return DEFAULT_MOCK_ENTRIES;
    }
  }
  // Initialize fallback file
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(DEFAULT_MOCK_ENTRIES, null, 2), "utf8");
  } catch (_) {}
  return DEFAULT_MOCK_ENTRIES;
}

function saveFallbackRanking(entry: any) {
  let list = getFallbackRankings();
  // Filter out matching name/password to avoid duplicates
  list = list.filter((e: any) => !(e.name === entry.name && !e.isMock));
  list.push({
    name: entry.name,
    password: entry.password,
    score: entry.score,
    userStickers: entry.userStickers,
    timestamp: entry.timestamp,
    isMock: false
  });
  // Sort descending
  list.sort((a: any, b: any) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.timestamp - a.timestamp;
  });
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(list, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to local backup file:", err);
  }
}

// Database Connection Manager
let dbPool: mysql.Pool | null = null;
let dbInitialized = false;

async function getDbPool() {
  if (dbInitialized) return dbPool;

  let host = process.env.DB_HOST;
  let user = process.env.DB_USER;
  let password = process.env.DB_PASSWORD;
  let database = process.env.DB_NAME;
  let port = parseInt(process.env.DB_PORT || "3306", 10);
  let useSsl = process.env.DB_SSL === "true";

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      host = url.hostname;
      port = parseInt(url.port || "3306", 10);
      user = url.username ? decodeURIComponent(url.username) : undefined;
      password = url.password ? decodeURIComponent(url.password) : undefined;
      database = url.pathname ? decodeURIComponent(url.pathname.substring(1)) : undefined;
      
      // Auto-detect and force SSL for cloud hosts (Aiven, AWS, Clever Cloud, Heroku, etc.)
      if (
        url.searchParams.get("ssl-mode") || 
        url.searchParams.get("ssl") || 
        url.hostname.includes("aivencloud") || 
        url.hostname.includes("cleardb") || 
        url.hostname.includes("aws") ||
        url.hostname.includes("database.azure")
      ) {
        useSsl = true;
      }
    } catch (e: any) {
      console.error("Failed to parse DATABASE_URL:", e.message);
    }
  }

  if (!host || !user || !database) {
    console.log("Database environment variables are not fully configured. Using file-based fallback.");
    dbInitialized = true;
    return null;
  }

  try {
    console.log(`Connecting to MySQL database at ${host}:${port} (Database: ${database}, SSL: ${useSsl})`);
    dbPool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
    });

    // Test query and table creation
    const conn = await dbPool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS album_rankings (
        name VARCHAR(50) NOT NULL,
        password VARCHAR(10) NOT NULL,
        score INT NOT NULL,
        user_stickers MEDIUMTEXT NOT NULL,
        timestamp BIGINT NOT NULL,
        is_mock BOOLEAN DEFAULT FALSE,
        PRIMARY KEY (name, password)
      )
    `);

    // Verify if there's any data. If not, seed default mocks.
    const [rows]: any = await conn.query("SELECT COUNT(*) as count FROM album_rankings");
    if (rows[0].count === 0) {
      console.log("Seeding default mock entries into MySQL...");
      for (const entry of DEFAULT_MOCK_ENTRIES) {
        await conn.query(`
          INSERT IGNORE INTO album_rankings (name, password, score, user_stickers, timestamp, is_mock)
          VALUES (?, ?, ?, ?, ?, TRUE)
        `, [entry.name, entry.password, entry.score, entry.userStickers, entry.timestamp]);
      }
    }

    conn.release();
    console.log("Successfully connected to MySQL Database!");
  } catch (err: any) {
    console.error("MySQL connection error: ", err.message);
    dbPool = null;
  }

  dbInitialized = true;
  return dbPool;
}

// REST API Endpoints
app.get("/api/health", (req, res) => {
  const isDbConfigured = !!(process.env.DATABASE_URL || (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME));
  res.json({
    status: "ok",
    database: {
      configured: isDbConfigured,
      connected: !!dbPool,
    }
  });
});

// Fetch all rankings
app.get("/api/rankings", async (req, res) => {
  const pool = await getDbPool();
  if (pool) {
    try {
      const [rows]: any = await pool.query(`
        SELECT name, password, score, user_stickers as userStickers, timestamp, is_mock as isMock
        FROM album_rankings
        ORDER BY score DESC, timestamp DESC
      `);
      // Convert isMock from database TINYINT to proper boolean
      const mapped = rows.map((row: any) => ({
        ...row,
        isMock: !!row.isMock
      }));
      return res.json(mapped);
    } catch (err: any) {
      console.error("Database query failed, serving file backup:", err.message);
    }
  }
  // Fallback
  return res.json(getFallbackRankings());
});

// Save or update a ranking
app.post("/api/rankings", async (req, res) => {
  const { name, password, score, userStickers, timestamp } = req.body;
  if (!name || !password) {
    return res.status(400).json({ error: "Missing required fields: name, password" });
  }

  const formattedName = name.trim().toUpperCase().slice(0, 15);
  const formattedPassword = password.trim();

  const entry = {
    name: formattedName,
    password: formattedPassword,
    score: Number(score) || 0,
    userStickers: typeof userStickers === "string" ? userStickers : JSON.stringify(userStickers || []),
    timestamp: Number(timestamp) || Date.now(),
  };

  // Always write locally as back-up cache
  saveFallbackRanking(entry);

  const pool = await getDbPool();
  if (pool) {
    try {
      await pool.query(`
        INSERT INTO album_rankings (name, password, score, user_stickers, timestamp, is_mock)
        VALUES (?, ?, ?, ?, ?, FALSE)
        ON DUPLICATE KEY UPDATE
          score = VALUES(score),
          user_stickers = VALUES(user_stickers),
          timestamp = VALUES(timestamp),
          is_mock = FALSE
      `, [entry.name, entry.password, entry.score, entry.userStickers, entry.timestamp]);
      return res.json({ success: true, saved_to: "database" });
    } catch (err: any) {
      console.error("Failed to insert into MySQL:", err.message);
      return res.json({ success: true, saved_to: "file_backup", error: err.message });
    }
  }

  return res.json({ success: true, saved_to: "file" });
});

async function main() {
  // Vite integration middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Critical server bootstrap error:", err);
});
