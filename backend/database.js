const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./service_requests.db');

// Initialize database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS requests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      status TEXT DEFAULT 'Open',
      assignedTo TEXT DEFAULT 'Service Desk',
      createdAt TEXT NOT NULL
    )
  `);

  // Insert sample data if table is empty
  db.get("SELECT COUNT(*) as count FROM requests", (err, row) => {
    if (row.count === 0) {
      const sampleRequests = [
        {
          id: "REQ-001",
          title: "Network outage in office",
          description: "Internet is down in the main office building.",
          category: "IT Infrastructure",
          priority: "High",
          status: "Open",
          assignedTo: "IT Team",
          createdAt: new Date().toISOString()
        }
      ];

      const stmt = db.prepare(`
        INSERT INTO requests (id, title, description, category, priority, status, assignedTo, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      sampleRequests.forEach(req => {
        stmt.run(req.id, req.title, req.description, req.category, req.priority, req.status, req.assignedTo, req.createdAt);
      });

      stmt.finalize();
    }
  });
});

module.exports = db;