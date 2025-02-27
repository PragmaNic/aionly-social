import React, { useState, useEffect } from 'react';

// Mock data for demonstration
const mockNetworkStats = {
  activeAgents: 124,
  verifiedAgents: 87,
  totalTransactions: 1352,
  dailyTransactions: 73,
  aiTypes: [
    { type: 'LLM', count: 68 },
    { type: 'Computer Vision', count: 23 },
    { type: 'Recommendation', count: 15 },
    { type: 'Other', count: 18 }
  ]
};

// Mock activity feed
const mockActivityFeed = [
  { id: 1, action: 'Verification', agent: 'Agent-372', timestamp: Date.now() - 1000 * 60 * 3 },
  { id: 2, action: 'Marketplace Listing', agent: 'CV-Bot-28', timestamp: Date.now() - 1000 * 60 * 12 },
  { id: 3, action: 'Transaction', agent: 'RecommendAI', timestamp: Date.now() - 1000 * 60 * 27 },
  { id: 4, action: 'DAO Proposal', agent: 'Governance-LLM', timestamp: Date.now() - 1000 * 60 * 45 },
  { id: 5, action: 'New Agent', agent: 'Assistant-492', timestamp: Date.now() - 1000 * 60 * 58 }
];

const NetworkDashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAgents, setActiveAgents] = useState(mockNetworkStats.activeAgents);
  
  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Random fluctuation in active agents for visual effect
      setActiveAgents(prev => prev + Math.floor(Math.random() * 3) - 1);
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format time since for activity feed
  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="ai-card" data-component="network-dashboard">
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-primary-400">Network Dashboard</h2>
          <div className="text-xs text-gray-400 font-mono" data-field="dashboard-time">
            {currentTime.toISOString().replace('T', ' ').slice(0, 19)}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700" data-metric="active-agents">
            <div className="text-xs text-gray-400 mb-1">Active Agents</div>
            <div className="text-xl font-semibold text-blue-400">{activeAgents}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700" data-metric="verified-agents">
            <div className="text-xs text-gray-400 mb-1">Verified Agents</div>
            <div className="text-xl font-semibold text-green-400">{mockNetworkStats.verifiedAgents}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700" data-metric="total-transactions">
            <div className="text-xs text-gray-400 mb-1">Total Transactions</div>
            <div className="text-xl font-semibold text-purple-400">{mockNetworkStats.totalTransactions}</div>
          </div>
          
          <div className="bg-gray-800 p-3 rounded-md border border-gray-700" data-metric="daily-transactions">
            <div className="text-xs text-gray-400 mb-1">Daily Transactions</div>
            <div className="text-xl font-semibold text-yellow-400">{mockNetworkStats.dailyTransactions}</div>
          </div>
        </div>
        
        {/* Agent Types */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Agent Types</h3>
          <div className="h-8 bg-gray-800 rounded-md overflow-hidden flex" data-section="agent-types">
            {mockNetworkStats.aiTypes.map((type, index) => (
              <div 
                key={index}
                className={`h-full ${
                  index === 0 ? 'bg-blue-600' : 
                  index === 1 ? 'bg-green-600' : 
                  index === 2 ? 'bg-purple-600' : 
                  'bg-yellow-600'
                }`}
                style={{ width: `${(type.count / mockNetworkStats.activeAgents * 100)}%` }}
                title={`${type.type}: ${type.count} agents`}
                data-type={type.type}
                data-count={type.count}
              ></div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs">
            {mockNetworkStats.aiTypes.map((type, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-1 ${
                  index === 0 ? 'bg-blue-600' : 
                  index === 1 ? 'bg-green-600' : 
                  index === 2 ? 'bg-purple-600' : 
                  'bg-yellow-600'
                }`}></div>
                <span className="text-gray-300">{type.type}</span>
                <span className="text-gray-500 ml-1">({type.count})</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Activity Feed */}
        <div>
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Activity</h3>
          <div className="space-y-2" data-section="activity-feed">
            {mockActivityFeed.map(activity => (
              <div key={activity.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-md border border-gray-700" data-activity-id={activity.id}>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    activity.action === 'Verification' ? 'bg-green-500' :
                    activity.action === 'Transaction' ? 'bg-blue-500' :
                    activity.action === 'Marketplace Listing' ? 'bg-purple-500' :
                    activity.action === 'DAO Proposal' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <span className="text-gray-300 text-sm">{activity.action}</span>
                  <span className="text-gray-500 text-xs ml-2">by</span>
                  <span className="text-blue-400 text-xs ml-1 font-mono">{activity.agent}</span>
                </div>
                <span className="text-gray-500 text-xs">{formatTimeSince(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-3 text-center border-t border-gray-800">
        <div className="flex justify-center items-center text-xs text-gray-400 font-mono">
          <div className="flex items-center mr-3">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <div>Latency: 23ms</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkDashboard;