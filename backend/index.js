const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const OpenAI = require('openai');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Initialize OpenAI (use your API key)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

app.use(cors());
app.use(express.json());

app.get('/api/requests', (req, res) => {
  db.all("SELECT * FROM requests ORDER BY createdAt DESC", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post('/api/requests', async (req, res) => {
  const { title, description, category } = req.body;
  const id = `REQ-${Date.now()}`;
  
  // Use AI to classify priority
  const priority = await classifyPriority(description);
  
  const request = {
    id,
    title,
    description,
    category,
    priority,
    status: "Open",
    assignedTo: "Service Desk",
    createdAt: new Date().toISOString()
  };

  db.run(`
    INSERT INTO requests (id, title, description, category, priority, status, assignedTo, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [request.id, request.title, request.description, request.category, request.priority, request.status, request.assignedTo, request.createdAt], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    io.emit('request.created', request);
    res.json(request);
  });
});

app.post('/api/requests/:id/update', (req, res) => {
  const { status, assignedTo } = req.body;
  
  db.run(
    "UPDATE requests SET status = ?, assignedTo = ? WHERE id = ?",
    [status || 'Open', assignedTo || 'Service Desk', req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }
      
      // Get updated request
      db.get("SELECT * FROM requests WHERE id = ?", [req.params.id], (err, request) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        io.emit('request.updated', request);
        res.json(request);
      });
    }
  );
});

async function classifyPriority(description) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Classify service request priority as Low, Medium, High, or Critical based on urgency and impact." },
        { role: "user", content: description }
      ],
      max_tokens: 10
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI classification error:', error);
    return 'Medium'; // fallback
  }
}

async function generateAIReview(request) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Provide a brief action plan and response template for this service request." },
        { role: "user", content: `Request: ${request.title} - ${request.description}` }
      ],
      max_tokens: 200
    });
    return {
      recommendedAction: response.choices[0].message.content.trim(),
      responseTemplate: `Dear team,\n\nRegarding ${request.title}: ${response.choices[0].message.content.trim()}\n\nBest regards,\nService Desk`
    };
  } catch (error) {
    console.error('AI review error:', error);
    return {
      recommendedAction: "Escalate to appropriate team for investigation.",
      responseTemplate: "We have received your request and are working on it."
    };
  }
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`AI Service Backend running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
