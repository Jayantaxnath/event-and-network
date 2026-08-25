# [Event & Networking Platform](https://event-and-network.vercel.app/)

An event and networking platform, designed to model and query professional relationships across people, events, companies, and shared interests.

The project addresses a common networking challenge: **how to efficiently discover meaningful connections and relationship paths within a professional network**. A graph database is used as the core backend data layer to make relationship-heavy queries such as shortest paths, shared interests, and connection recommendations efficient and natural to express.

The project also includes a React-based web interface to demonstrate and visualize the capabilities of the backend.

> **Note:** The backend is deployed on [Render](https://render.com). Since it runs on a free-tier instance, it may take a few seconds to wake up when accessed for the first time.

## Use Case

### **Business Problem**

At large networking events, professional communities, and industry meetups, it can be difficult to identify **who to connect with, why that connection is relevant, and how two people are connected through existing relationships**.

Traditional relational data models can make these relationship-heavy queries increasingly complex as the number of connections grows.

### **Solution**

The backend models people, events, companies, and interests as a **connected graph**, allowing the system to answer business questions such as:

- How are two people connected?
- What is the shortest relationship path between two professionals?
- What events, companies, or topics do two people have in common?
- Which professionals are potential connections based on shared interests?
- How closely connected is a person to another individual within the network?

The web application provides an interactive interface for exploring these backend capabilities through graph visualization.

**Who it's for:** Event organizers, recruiters, networking professionals, community managers, and team-building facilitators.

---

## 🔗 Why a Graph Database?

The core business problem is **relationship discovery**, which makes a graph database a natural fit.

Traditional relational databases can solve these problems, but relationship-heavy queries often require multiple joins, nested queries, and additional application-side logic. Graph databases are designed to traverse relationships directly.

| Problem | Relational DB | Graph DB |
|---------|---------------|----------|
| Find path between 2 people | Multiple JOINs | Direct graph traversal |
| Find all connections 3 hops away | Complex nested queries | Multi-hop traversal |
| Recommend similar people | Join-heavy logic | Neighbor/relationship analysis |
| Query interconnected entities | Multiple table joins | Native relationship queries |
| Explore network relationships | Requires additional logic | Relationships are first-class data |

**CognoDB** is used as the graph database because the primary backend requirements involve relationship traversal, pathfinding, and querying interconnected entities.

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