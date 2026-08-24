# EventConnect Frontend

A graph-powered event discovery and professional networking web application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
Create a `.env` file in the frontend directory with:
```
VITE_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

## Features

- **Home Dashboard**: Featured events, statistics, and personalized recommendations
- **Events Discovery**: Browse and search events with filtering
- **Event Details**: View event information, topics, and attendees
- **Smart Recommendations**: AI-powered people recommendations based on graph analysis
- **"Why" Explanations**: Understand why you should meet specific people
- **Person Profiles**: View professional profiles and similar connections
- **Network Graph**: Interactive visualization of connection paths using React Flow

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- React Flow (@xyflow/react)
- Native fetch API

## Demo Flow

1. Start on Home page to see featured events
2. Navigate to Events to browse all events
3. Click on an event to see details
4. View "People You Should Meet" recommendations
5. Click "Why?" to understand the recommendation
6. Click "View Network Path" to see the connection graph
7. Explore person profiles and similar connections