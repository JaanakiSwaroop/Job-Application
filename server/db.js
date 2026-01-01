require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const initDb = async () => {
    try {
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS jobs (
                id SERIAL PRIMARY KEY,
                company TEXT NOT NULL,
                role TEXT NOT NULL,
                status TEXT NOT NULL,
                date_applied TEXT NOT NULL,
                resume_path TEXT
            );
        `;
        await pool.query(createTableQuery);
        console.log("Database initialized and 'jobs' table ready.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};

module.exports = { pool, initDb };
