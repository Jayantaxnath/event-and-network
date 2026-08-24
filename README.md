# Event & Network Graph Platform

A real-time professional network visualization tool that maps connections between people across events, companies, and shared interests using a graph database.

## 🎯 Use Case

**Problem:** At large networking events, it's hard to know who to connect with and how you're linked to someone through mutual contacts.

**Solution:** Visualize your professional network as an interactive graph showing:
- How two people are connected (shortest path)
- Common events, companies, and topics
- Recommended connections based on shared interests
- Your proximity in the professional network

**Who it's for:** Event organizers, recruiters, networking professionals, team-building facilitators.

---

## 🔗 Why a Graph Database?

Traditional relational databases struggle with relationship queries on large networks. Graph databases excel because:

| Problem | Relational DB | Graph DB |
|---------|---------------|----------|
| Find path between 2 people | Multiple JOINs (slow) | Direct traversal (fast) |
| Find all connections 3 hops away | Complex nested queries | Single traversal query |
| Recommend similar people | Join-heavy logic | Direct neighbor analysis |
| Scale relationships | Index overhead | Native relationship queries |

**CognoDB** (our choice) is optimized for relationship queries, making real-time pathfinding and recommendations instant.

---

## ✨ Features

### Core
- **Event Explorer**: Browse events and view attendee networks
- **People Directory**: Search professionals and view profiles
- **Network Path Finder**: Visualize shortest connection between any two people
- **Interactive Graph Visualization**: ReactFlow-based graph rendering

### Advanced
- **Smart Filtering**: Filter by company, topic, or role
- **Recommendations**: AI-powered suggestions based on shared interests
- **Common Interests**: See what connects two professionals
- **Step-by-Step Path Breakdown**: Understand each connection

---

## 📊 Data Model

```
People
  ├── person_id (string)
  ├── name (string)
  ├── title (string)
  ├── bio (string)
  ├── company_id (FK)
  └── topics (array)

Events
  ├── event_id (string)
  ├── name (string)
  ├── date (datetime)
  ├── location (string)
  └── description (string)

Companies
  ├── company_id (string)
  ├── name (string)
  ├── industry (string)
  └── website (string)

Topics
  ├── topic_id (string)
  └── name (string)

Relationships
  ├── Person --ATTENDED--> Event
  ├── Person --WORKS_AT--> Company
  ├── Person --INTERESTED_IN--> Topic
  ├── Event --HOSTED_BY--> Company
  └── Company --FOCUSES_ON--> Topic
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+
- Python 3.9+
- CognoDB instance

### 1. CognoDB Setup

```bash
# [Leave instructions based on your CognoDB setup]
# Replace with actual instance creation steps

export COGNODB_URI="your-cognodb-uri"
export COGNODB_USER="your-username"
export COGNODB_PASSWORD="your-password"
```

### 2. Backend (FastAPI)

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env
cat > .env << EOF
COGNODB_URI=$COGNODB_URI
COGNODB_USER=$COGNODB_USER
COGNODB_PASSWORD=$COGNODB_PASSWORD
EOF

# Run server
uvicorn app:app --reload
# Server runs on http://localhost:8000
```

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Connect Frontend to Backend

In `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

Or for production (Vercel):
```
VITE_API_URL=https://your-render-backend.onrender.com
```

---

## 📡 API Endpoints

### People
```
GET /people
  → List all people

GET /people/{personId}
  → Get person details

GET /people/{personId}/common-interests?limit=20
  → Get people with shared interests

GET /people/{personA}/path-to/{personB}
  → Find shortest path between two people
  → Returns: {nodes: [...], relationships: [...]}
```

### Events
```
GET /events
  → List all events

GET /events/{eventId}
  → Get event details

GET /events/{eventId}/attendees
  → Get attendees for an event
```

### Network
```
GET /network/recommendations?personId=X&limit=10
  → Get recommended connections [placeholder]
```

---

## 🔑 Main Queries Explained

### 1. Find Shortest Path Between Two People
```cypher
MATCH path = shortestPath(
  (a:Person {id: 'person_1'})-[*]-(b:Person {id: 'person_2'})
)
RETURN path, length(path) as hops
```
**Why graph?** Direct traversal finds paths instantly, regardless of depth.

### 2. Get All Common Interests
```cypher
MATCH (p1:Person {id: 'person_1'})-[r:INTERESTED_IN]->(t:Topic)
MATCH (p2:Person)-[r2:INTERESTED_IN]->(t)
WHERE p2.id != 'person_1'
RETURN p2, t, count(*) as shared_count
```
**Why graph?** Relationships are traversable; no complex JOINs.

### 3. Recommend People at an Event
```cypher
MATCH (e:Event {id: 'event_1'})<-[a:ATTENDED]-(p:Person)
MATCH (p)-[r:INTERESTED_IN]->(t:Topic)
MATCH (me:Person {id: 'me'})-[r2:INTERESTED_IN]->(t)
WHERE p.id != 'me'
RETURN p, count(t) as shared_topics
ORDER BY shared_topics DESC
```
**Why graph?** Fast intersection queries on relationships.

---

## 🏗️ Project Structure

```
wexa-event-graph/
├── backend/
│   ├── app.py              # FastAPI main
│   ├── db.py               # CognoDB connection
│   ├── config.py           # Config/env vars
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, Events, People, Network, etc.
│   │   ├── components/     # UI components
│   │   ├── api/            # API client methods
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

---

## View 01 : Events list view, Person profile

![alt text](<view/Screenshot 2026-08-25 023435.png>)

## View 02 : Event attendees graph, Network path finder

![alt text](<view/Screenshot 2026-08-25 031823.png>)

---

## 🛠️ Development

```bash
# Run both backend and frontend simultaneously
# Terminal 1: Backend
cd backend && uvicorn app:app --reload

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## 🚢 Deployment

**Backend:** [Render](https://render.com)
- Push to GitHub
- Connect repo on Render
- Set environment variables
- Auto-deploys on git push

**Frontend:** [Vercel](https://vercel.com)
- Connect GitHub repo
- Set `VITE_API_URL` environment variable
- Auto-deploys on git push

---

## 📝 License

MIT

---

## 🤝 Contributing

[Leave blank or add contribution guidelines]

---

## 📧 Contact

[Add contact info if needed]