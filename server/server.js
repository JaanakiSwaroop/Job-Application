require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
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

// Multer (Memory Storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Initialize DB
initDb();

// Routes

// GET all jobs (Construct resume URL internally)
app.get('/api/jobs', async (req, res) => {
    try {
        const query = `
            SELECT id, company, role, status, date_applied, 
            CASE WHEN resume_path IS NOT NULL AND length(resume_path) > 0 THEN '/api/jobs/' || id || '/resume' ELSE null END as resume_path 
            FROM jobs ORDER BY id DESC
        `;
        const result = await pool.query(query);
        // We append the full URL if needed, but client handles relative paths fine usually.
        // Actually, client expects full URL or handling.
        // The query returns '/api/jobs/123/resume'.
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET Resume Content (Stream Base64 back as PDF)
app.get('/api/jobs/:id/resume', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT resume_path FROM jobs WHERE id = $1', [id]);

        if (result.rowCount === 0 || !result.rows[0].resume_path) {
            return res.status(404).send('Resume not found');
        }

        const base64Data = result.rows[0].resume_path;
        const buffer = Buffer.from(base64Data, 'base64');

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="resume_${id}.pdf"`);
        res.send(buffer);
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
            // Store as Base64 string
            resume_path = req.file.buffer.toString('base64');
        }

        const query = `
            INSERT INTO jobs (company, role, status, date_applied, resume_path) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, company, role, status, date_applied
        `;
        const values = [company, role, status, date_applied, resume_path];
        const result = await pool.query(query, values);

        // Return constructed object with path so frontend updates immediately
        const newJob = result.rows[0];
        if (resume_path) {
            newJob.resume_path = `/api/jobs/${newJob.id}/resume`;
        }

        res.status(201).json(newJob);
    } catch (error) {
        console.error("Error creating job:", error);
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
            updateQuery += `, resume_path = $${paramIndex}`;
            values.push(req.file.buffer.toString('base64'));
            paramIndex++;
        }

        updateQuery += ` WHERE id = $${paramIndex} RETURNING id, company, role, status, date_applied`;
        values.push(id);

        const result = await pool.query(updateQuery, values);

        if (result.rowCount === 0) return res.status(404).json({ error: 'Job not found' });

        const updatedJob = result.rows[0];
        // We can't easily check if it has a resume now without selecting it or knowing we just updated it.
        // For simplicity, return the path if we just uploaded one, or we might need to query if it exists.
        // But the frontend usually refetches or we can just send back what we know.
        // For now, if we uploaded, send path. If not, we don't know if previous existed from this select.
        // Let's keep it simple.
        if (req.file) {
            updatedJob.resume_path = `/api/jobs/${updatedJob.id}/resume`;
        }

        res.json(updatedJob);
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
