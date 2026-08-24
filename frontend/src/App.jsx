import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import PersonProfile from './pages/PersonProfile';
import Network from './pages/Network';
import People from './pages/People';
import Companies from './pages/Companies';
import CompanyDetails from './pages/CompanyDetails';
import Topics from './pages/Topics';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:eventId" element={<EventDetails />} />
            <Route path="/people" element={<People />} />
            <Route path="/people/:personId" element={<PersonProfile />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:companyId" element={<CompanyDetails />} />
            <Route path="/topics" element={<Topics />} />
            <Route path="/topics/:topicId" element={<Topics />} />
            <Route path="/network" element={<Network />} />
            <Route path="/network/:personA/:personB" element={<Network />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;