# 🏆 NSBM Hackathon 2026
## AI-Powered Smart Service Request Platform

A modern, AI-driven service request platform demonstrating real-time operations, intelligent decision-making, and Generative AI capabilities.

### Features
- 🤖 AI-powered request prioritization using OpenAI GPT
- ⚡ Real-time updates with WebSocket
- 🎨 Modern React frontend
- 🚀 Express backend with microservices architecture
- 📊 Web dashboard for monitoring

### Project Structure
- `backend/` - Node.js/Express API with AI agent and SQLite database
- `frontend/` - React web application for request management
- `mobile/` - React Native Expo mobile app
- `web/` - Static web dashboard

### Setup
1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Set up OpenAI API key:
   ```bash
   export OPENAI_API_KEY=your-api-key
   ```

3. Start the platform:
   ```bash
   npm run dev
   ```

4. Open:
   - **Web Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:4000
   - **Web Dashboard**: Open `web/index.html` in browser
   - **Mobile App** (optional): `cd mobile && npm start` then scan QR code

### Mobile Setup
For mobile testing:
1. Update `mobile/App.js` API_BASE to your computer's IP
2. Install Expo Go on your phone
3. Run `npm start` in mobile folder
4. Scan QR code with Expo Go

### AI Capabilities
- Automatic priority classification
- Intelligent response suggestions
- Agentic behavior for request handling

### Technologies
- Backend: Node.js, Express, Socket.IO, OpenAI
- Frontend: React, Vite
- Web: HTML/CSS/JavaScript