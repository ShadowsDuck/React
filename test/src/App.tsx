// src/App.jsx
import { useState } from 'react';
import { CardListView } from './components/CardListView';
import './App.css'; // You might want to create an App.css or just use index.css

// Dummy Card component (enhanced with subtle shadow)
const Card = ({ children, className }) => (
  <div className={`rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

// Dummy Button component (enhanced with better hover states)
const Button = ({ onClick, className, children }) => (
  <button onClick={onClick} className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${className}`}>
    {children}
  </button>
);

export default function App() {
  const [activeView, setActiveView] = useState('card');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 text-center sm:text-left">
          <h1 className="text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Event Conflict Resolution
          </h1>
          <p className="text-gray-400 text-lg">
            Visualize and resolve {0} events with staff conflicts
          </p>
        </header>

        {/* View Selector Tabs */}
        <nav className="flex gap-4 mb-10 justify-center sm:justify-start">
          <Button
            onClick={() => setActiveView('card')}
            className={`${
              activeView === 'card'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            Card View
          </Button>
        </nav>

        {/* Main Content Area */}
        <Card className="bg-gray-800 border border-gray-700 p-0 overflow-hidden">
          {activeView === 'card' && <CardListView />}
        </Card>
      </div>
    </div>
  );
}