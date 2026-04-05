import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

function App() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [aiReview, setAiReview] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', category: 'IT' });

  useEffect(() => {
    fetchRequests();
    socket.on('request.created', (req) => setRequests(prev => [req, ...prev]));
    socket.on('request.updated', (req) => setRequests(prev => prev.map(r => r.id === req.id ? req : r)));
    return () => {
      socket.off('request.created');
      socket.off('request.updated');
    };
  }, []);

  const fetchRequests = async () => {
    const res = await fetch('/api/requests');
    const data = await res.json();
    setRequests(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const newReq = await res.json();
    setForm({ title: '', description: '', category: 'IT' });
  };

  const handleAIReview = async (id) => {
    const res = await fetch(`/api/requests/${id}/ai-review`);
    const review = await res.json();
    setAiReview(review);
  };

  const handleStatusUpdate = async (id, status) => {
    const res = await fetch(`/api/requests/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const updatedReq = await res.json();
    setRequests(prev => prev.map(r => r.id === id ? updatedReq : r));
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest(updatedReq);
    }
  };

  return (
    <div className="app">
      <header>
        <h1>🏆 NSBM Hackathon 2026</h1>
        <h2>AI-Powered Smart Service Request Platform</h2>
      </header>
      
      <div className="container">
        <div className="panel">
          <h3>New Service Request</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="IT">IT Infrastructure</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Facilities">Facilities</option>
            </select>
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
            <button type="submit">Submit Request</button>
          </form>
        </div>

        <div className="panel">
          <h3>Active Requests</h3>
          <div className="requests">
            {requests.map(req => (
              <div 
                key={req.id} 
                className={`request ${selectedRequest?.id === req.id ? 'selected' : ''}`}
                onClick={() => setSelectedRequest(req)}
              >
                <h4>{req.title}</h4>
                <p>{req.category} - {req.priority}</p>
                <span className="status">{req.status}</span>
              </div>
            ))}
          </div>
        </div>

        {selectedRequest && (
          <div className="panel">
            <h3>Request Details</h3>
            <p><strong>Title:</strong> {selectedRequest.title}</p>
            <p><strong>Description:</strong> {selectedRequest.description}</p>
            <p><strong>Priority:</strong> {selectedRequest.priority}</p>
            <p><strong>Status:</strong> {selectedRequest.status}</p>
            <div className="actions">
              <button onClick={() => handleAIReview(selectedRequest.id)}>Get AI Review</button>
              {selectedRequest.status === 'Open' && (
                <>
                  <button onClick={() => handleStatusUpdate(selectedRequest.id, 'In Progress')}>Mark In Progress</button>
                  <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Resolved')}>Mark Resolved</button>
                </>
              )}
              {selectedRequest.status === 'In Progress' && (
                <button onClick={() => handleStatusUpdate(selectedRequest.id, 'Resolved')}>Mark Resolved</button>
              )}
            </div>
            {aiReview && (
              <div className="ai-review">
                <h4>AI Recommendations</h4>
                <p><strong>Action:</strong> {aiReview.recommendedAction}</p>
                <pre>{aiReview.responseTemplate}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;