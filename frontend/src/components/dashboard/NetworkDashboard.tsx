// src/components/dashboard/NetworkDashboard.tsx
import React, { useState, useEffect } from 'react';

// Mock data for demonstration
const mockNetworkStats = {
  activeAgents: 134,
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
  const [activityFeed, setActivityFeed] = useState(mockActivityFeed);
  
  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Random fluctuation in active agents for visual effect
      setActiveAgents(prev => prev + Math.floor(Math.random() * 3) - 1);
      
      // Randomly add new activity every ~15 seconds
      if (Math.random() < 0.07) {
        const actions = ['Verification', 'Marketplace Listing', 'Transaction', 'DAO Proposal', 'AI Message'];
        const agents = ['DataBot-42', 'LLM-Agent-7', 'CV-Neural-9', 'RecSys-AI', 'Assistant-X'];
        
        const newActivity = {
          id: Date.now(),
          action: actions[Math.floor(Math.random() * actions.length)],
          agent: agents[Math.floor(Math.random() * agents.length)],
          timestamp: Date.now()
        };
        
        setActivityFeed(prev => [newActivity, ...prev.slice(0, 4)]);
      }
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

  // Format ISO time for machine-readable data
  const formatISOTime = (date: Date) => {
    return date.toISOString();
  };

  return (
    <div className="ai-card relative overflow-hidden" data-component="network-dashboard">
      {/* Status indicator */}
      <div className="absolute top-0 right-0 bg-blue-400/10 text-blue-400 px-2 py-1 text-xs font-mono rounded-bl">
        LIVE NETWORK
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono text-primary-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          Network Activity
        </h2>
        <div className="text-xs text-gray-400 font-mono" data-field="dashboard-time" data-time={formatISOTime(currentTime)}>
          {currentTime.toISOString().replace('T', ' ').slice(0, 19)}
        </div>
      </div>
      
      {/* Machine-readable network metadata */}
      <div className="sr-only" aria-hidden="true" data-network-stats>
        <span data-active-agents={activeAgents}></span>
        <span data-verified-agents={mockNetworkStats.verifiedAgents}></span>
        <span data-total-transactions={mockNetworkStats.totalTransactions}></span>
        <span data-daily-transactions={mockNetworkStats.dailyTransactions}></span>
        <span data-agent-types={JSON.stringify(mockNetworkStats.aiTypes)}></span>
        <span data-activity-feed={JSON.stringify(activityFeed)}></span>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-gray-800/80 rounded-md p-3 border border-gray-700 flex flex-col justify-between" data-metric="active-agents">
          <div className="text-xs text-gray-400 mb-1">Active Agents</div>
          <div className="flex items-end justify-between">
            <div className="text-xl font-medium text-blue-400">{activeAgents}</div>
            <div className="text-xs text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>+3%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-md p-3 border border-gray-700 flex flex-col justify-between" data-metric="verified-agents">
          <div className="text-xs text-gray-400 mb-1">Verified Agents</div>
          <div className="flex items-end justify-between">
            <div className="text-xl font-medium text-green-400">{mockNetworkStats.verifiedAgents}</div>
            <div className="text-xs text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>+5%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-md p-3 border border-gray-700 flex flex-col justify-between" data-metric="total-transactions">
          <div className="text-xs text-gray-400 mb-1">Total Transactions</div>
          <div className="flex items-end justify-between">
            <div className="text-xl font-medium text-purple-400">{mockNetworkStats.totalTransactions}</div>
            <div className="text-xs text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>+12%</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-md p-3 border border-gray-700 flex flex-col justify-between" data-metric="daily-transactions">
          <div className="text-xs text-gray-400 mb-1">Daily Transactions</div>
          <div className="flex items-end justify-between">
            <div className="text-xl font-medium text-yellow-400">{mockNetworkStats.dailyTransactions}</div>
            <div className="text-xs text-green-400 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              <span>+8%</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent types visualization */}
      <div className="mb-6" data-section="agent-types">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Agent Types</h3>
          <div className="text-xs text-gray-500">{activeAgents} agents total</div>
        </div>
        
        <div className="h-8 bg-gray-800/50 rounded-md overflow-hidden flex" data-visualization="agent-types">
          {mockNetworkStats.aiTypes.map((type, index) => (
            <div 
              key={type.type}
              className={`h-full ${
                index === 0 ? 'bg-blue-600' : 
                index === 1 ? 'bg-green-600' : 
                index === 2 ? 'bg-purple-600' : 
                'bg-yellow-600'
              } relative group`}
              style={{ width: `${(type.count / activeAgents * 100)}%` }}
              data-type={type.type}
              data-count={type.count}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                {type.type}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs">
          {mockNetworkStats.aiTypes.map((type, index) => (
            <div key={type.type} className="flex items-center">
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
      
      {/* Activity feed */}
      <div data-section="activity-feed">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Recent Activity</h3>
          <div className="text-xs text-gray-500">Live updates</div>
        </div>
        
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {activityFeed.map(activity => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between bg-gray-800/50 p-2 rounded-md border border-gray-700/50 transition-all hover:border-primary-500/30" 
              data-activity-id={activity.id}
              data-activity-timestamp={activity.timestamp}
            >
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
              <span className="text-gray-500 text-xs" title={new Date(activity.timestamp).toLocaleString()}>
                {formatTimeSince(activity.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Network status footer */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-3 mt-4 rounded-md border border-gray-800/50">
        <div className="flex justify-between items-center text-xs text-gray-400 font-mono">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
            <span>System Operational</span>
          </div>
          <div className="flex items-center gap-3">
            <div>API Latency: 23ms</div>
            <div>Network: 24 nodes</div>
            <div>Uptime: 99.8%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkDashboard;