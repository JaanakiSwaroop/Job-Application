import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JobList from './components/JobList';
import JobForm from './components/JobForm';
import { PlusCircle, Briefcase } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="container">
        <header className="animate-fade-in">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: '8px', display: 'flex' }}>
              <Briefcase color="white" size={24} />
            </div>
            <h1>JobTracker</h1>
          </Link>
          <Link to="/add" className="btn btn-primary">
            <PlusCircle size={20} />
            <span>Add Application</span>
          </Link>
        </header>

        <main className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <Routes>
            <Route path="/" element={<JobList />} />
            <Route path="/add" element={<JobForm />} />
            <Route path="/edit/:id" element={<JobForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
