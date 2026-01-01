require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { pool, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.send('Job Tracker API is running. Go to /api/jobs to see data.');
});

// Cloudinary Config
// It automatically picks up CLOUDINARY_URL from .env
// We can just verify or explicitly configure if needed, but env is standard.

// Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize DB
initDb();

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, filename) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'raw', // Treat as raw file to avoid PDF corruption
                folder: 'job-applications',
                use_filename: true,
                unique_filename: true,
                filename_override: filename
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        uploadStream.end(buffer);
    });
};

// Routes

// GET all jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST new job
app.post('/api/jobs', upload.single('resume'), async (req, res) => {
    try {
        const { company, role, status, date_applied } = req.body;
        let resume_path = null;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            resume_path = result.secure_url;
        }

        const query = `
            INSERT INTO jobs (company, role, status, date_applied, resume_path) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *
        `;
        const values = [company, role, status, date_applied, resume_path];
        const result = await pool.query(query, values);

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update job
app.put('/api/jobs/:id', upload.single('resume'), async (req, res) => {
    try {
        const { id } = req.params;
        const { company, role, status, date_applied } = req.body;

        let updateQuery = 'UPDATE jobs SET company = $1, role = $2, status = $3, date_applied = $4';
        let values = [company, role, status, date_applied];
        let paramIndex = 5;

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
            updateQuery += `, resume_path = $${paramIndex}`;
            values.push(result.secure_url);
            paramIndex++;
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
        values.push(id);

        const result = await pool.query(updateQuery, values);

        if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE job
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

        if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
