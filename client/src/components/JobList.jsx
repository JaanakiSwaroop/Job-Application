import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FileText, Trash2, Edit, ExternalLink, Calendar, Building } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/jobs';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(API_URL);
            setJobs(response.data);
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (id) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            setJobs(jobs.filter(job => job.id !== id));
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading applications...</div>;

    return (
        <div className="job-grid">
            {jobs.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                    <h2>No applications yet</h2>
                    <p>Start tracking your journey by adding a new job application.</p>
                </div>
            ) : (
                jobs.map((job, index) => (
                    <div key={job.id} className="card" style={{ animation: `fadeIn 0.5s ease-out forwards ${index * 0.1}s`, opacity: 0 }}>
                        <div className="job-card_header">
                            <div>
                                <div className="job-role">{job.role}</div>
                                <div className="job-company">
                                    <Building size={14} />
                                    {job.company}
                                </div>
                            </div>
                            <span className={`status-badge status-${job.status.split(' ')[0]}`}>{job.status}</span>
                        </div>

                        <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <Calendar size={14} />
                            Applied on {job.date_applied}
                        </div>

                        <div className="job-actions">
                            {job.resume_path && (
                                <a href={`http://localhost:3000${job.resume_path}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" title="View Resume">
                                    <FileText size={16} />
                                </a>
                            )}
                            <Link to={`/edit/${job.id}`} className="btn btn-secondary" title="Edit">
                                <Edit size={16} />
                            </Link>
                            <button onClick={() => deleteJob(job.id)} className="btn btn-danger" title="Delete">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default JobList;
