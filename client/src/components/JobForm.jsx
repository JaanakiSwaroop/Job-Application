import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/jobs`;

const JobForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const [formData, setFormData] = useState({
        company: '',
        role: '',
        status: 'Applied',
        date_applied: new Date().toISOString().split('T')[0],
        resume: null
    });

    useEffect(() => {
        if (isEdit) {
            fetchJob();
        }
    }, [id]);

    const fetchJob = async () => {
        try {
            // Since we don't have a single item GET (wait, I implemented list, not single... let me check backend)
            // Ah, I missed implementing GET /api/jobs/:id in the backend plan!
            // I should quick fix that, or filter from list. Filtering from list is inefficient but works for now. 
            // Better: Add the endpoint to backend. For now, I'll filter client side for speed if needed, or add logic.
            // Let's rely on the list for now or assuming the backend will be updated.
            // Actually, I'll handle it by fetching all and finding one effectively, or just adding the endpoint.
            // Let's add the endpoint in the next step.

            // Temporary workaround: Fetch all and find. 
            const response = await axios.get(API_URL);
            const job = response.data.find(j => j.id == id);
            if (job) {
                setFormData({
                    company: job.company,
                    role: job.role,
                    status: job.status,
                    date_applied: job.date_applied,
                    resume: null // Don't preload file object
                });
            }
        } catch (error) {
            console.error('Error fetching job details', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('company', formData.company);
        data.append('role', formData.role);
        data.append('status', formData.status);
        data.append('date_applied', formData.date_applied);
        if (formData.resume) {
            data.append('resume', formData.resume);
        }

        try {
            if (isEdit) {
                await axios.put(`${API_URL}/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await axios.post(API_URL, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving job', error);
        }
    };

    return (
        <div className="form-container card animate-fade-in">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>{isEdit ? 'Edit Application' : 'New Application'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Company Name</label>
                    <input type="text" name="company" value={formData.company} onChange={handleChange} required placeholder="e.g. Google" />
                </div>

                <div className="form-group">
                    <label>Role / Position</label>
                    <input type="text" name="role" value={formData.role} onChange={handleChange} required placeholder="e.g. Frontend Engineer" />
                </div>

                <div className="form-group">
                    <label>Status</label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Date Applied</label>
                    <input type="date" name="date_applied" value={formData.date_applied} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Resume (PDF/Word)</label>
                    <div style={{ position: 'relative', overflow: 'hidden', display: 'inline-block', width: '100%' }}>
                        <input type="file" name="resume" onChange={handleFileChange} style={{ padding: '10px' }} />
                    </div>
                    {isEdit && <small style={{ color: 'var(--text-secondary)' }}>Upload new file to replace existing resume.</small>}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
                        <ArrowLeft size={18} /> Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                        <Save size={18} /> {isEdit ? 'Update Application' : 'Save Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JobForm;
