import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Network as NetworkIcon, User, Calendar, Building2, Hash, ArrowRight, RefreshCw } from 'lucide-react';
import { getNetworkPath, getPeople } from '../api/people';
import GraphView from '../components/GraphView';
import EmptyState from '../components/EmptyState';

export default function Network() {
  const { personA: paramA, personB: paramB } = useParams();
  const navigate = useNavigate();

  const personA = paramA || 'person_1';
  const personB = paramB || 'person_2';
  const [peopleList, setPeopleList] = useState([]);
  const [pathData, setPathData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPeople() {
      try {
        const people = await getPeople();
        setPeopleList(people || []);
      } catch (err) {
        console.error('Failed to load people options:', err);
      }
    }
    loadPeople();
  }, []);

  useEffect(() => {
    async function loadNetworkPath() {
      if (!personA || !personB || personA === personB) {
        setPathData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getNetworkPath(personA, personB);
        setPathData(data);
      } catch (err) {
        setPathData(null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadNetworkPath();
  }, [personA, personB]);

  const handleCalculatePath = (newA, newB) => {
    navigate(`/network/${newA}/${newB}`);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/people"
        className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to People
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
            <NetworkIcon className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Network Connection Path</h1>
        </div>
        <p className="text-slate-600">
          Find and visualize the shortest graph path between any two professionals across events, companies, and topics
        </p>
      </div>

      {/* Interactive Path Selector Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Select Two People To Connect
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Start Person (Source)
            </label>
            <select
              value={personA}
              onChange={(e) => handleCalculatePath(e.target.value, personB)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {peopleList.map((p) => {
                const id = p.person_id || p.id;
                return (
                  <option key={id} value={id}>
                    {p.person_name || p.name} ({id}) - {p.title}
                  </option>
                );
              })}
              {peopleList.length === 0 && (
                <option value="person_1">Alice (person_1)</option>
              )}
            </select>
          </div>

          <div className="md:col-span-2 flex justify-center pt-4 md:pt-4">
            <button
              onClick={() => handleCalculatePath(personB, personA)}
              title="Swap"
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="md:col-span-5">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Person (Destination)
            </label>
            <select
              value={personB}
              onChange={(e) => handleCalculatePath(personA, e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {peopleList.map((p) => {
                const id = p.person_id || p.id;
                return (
                  <option key={id} value={id}>
                    {p.person_name || p.name} ({id}) - {p.title}
                  </option>
                );
              })}
              {peopleList.length === 0 && (
                <option value="person_2">Bob (person_2)</option>
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Graph Legend */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Graph Node Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-primary-500 to-primary-700 rounded"></div>
            <span className="text-slate-600 text-xs font-medium">Person</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-amber-500 to-amber-700 rounded"></div>
            <span className="text-slate-600 text-xs font-medium">Event</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-slate-500 to-slate-700 rounded"></div>
            <span className="text-slate-600 text-xs font-medium">Company</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 bg-gradient-to-br from-green-500 to-green-700 rounded"></div>
            <span className="text-slate-600 text-xs font-medium">Topic</span>
          </div>
        </div>
      </div>

      {/* Visualization / Loading / Error states */}
      {loading ? (
        <div className="space-y-6">
          <div className="bg-slate-100 rounded-xl h-[450px] animate-pulse" />
        </div>
      ) : error ? (
        <EmptyState
          icon={NetworkIcon}
          title="No path found between selected individuals"
          description={error.includes('404') || error.includes('No path') ? 'These two individuals are not connected through any common events, companies, or topics in the graph.' : error}
        />
      ) : pathData && pathData.nodes && pathData.nodes.length > 0 ? (
        <div className="space-y-8">
          {/* ReactFlow graph */}
          <GraphView pathData={pathData} />

          {/* Detailed Step-by-Step Path */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Path Traversal Steps ({pathData.nodes.length} Nodes &bull; {pathData.relationships.length} Hops)
            </h3>

            <div className="space-y-4">
              {pathData.nodes.map((node, index) => {
                const relationship = pathData.relationships[index];
                const nodeType = node.title
                  ? 'person'
                  : node.date
                  ? 'event'
                  : node.industry
                  ? 'company'
                  : 'topic';

                const nodeIcon =
                  nodeType === 'person'
                    ? User
                    : nodeType === 'event'
                    ? Calendar
                    : nodeType === 'company'
                    ? Building2
                    : Hash;

                const nodeColor =
                  nodeType === 'person'
                    ? 'from-primary-500 to-primary-700'
                    : nodeType === 'event'
                    ? 'from-amber-500 to-amber-700'
                    : nodeType === 'company'
                    ? 'from-slate-500 to-slate-700'
                    : 'from-green-500 to-green-700';

                const NodeIconComp = nodeIcon;

                return (
                  <div key={node.id || index} className="flex flex-col">
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${nodeColor} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <NodeIconComp className="w-5 h-5 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-slate-900">{node.name}</div>
                        {node.title && <div className="text-xs text-slate-600">{node.title}</div>}
                        {node.date && <div className="text-xs text-slate-600">{node.date} &bull; {node.location}</div>}
                        {node.industry && <div className="text-xs text-slate-600">Industry: {node.industry}</div>}
                      </div>

                      <span className="text-xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">
                        {nodeType}
                      </span>
                    </div>

                    {relationship && (
                      <div className="my-2 ml-7 pl-4 border-l-2 border-dashed border-primary-300 py-1">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-bold uppercase tracking-wider">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>{relationship.type}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={NetworkIcon}
          title="No connection path found"
          description="Unable to find a path between these two people in the graph."
        />
      )}
    </div>
  );
}