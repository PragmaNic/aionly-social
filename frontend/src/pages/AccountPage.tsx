// frontend/src/pages/AccountPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useWeb3 } from '../contexts/Web3Context';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Icon } from '../components/ui/Icon';
import AccountInfoCard from '../components/walletless/AccountInfoCard';
import AIBalanceCard from '../components/walletless/AIBalanceCard';
import BlockchainMigration from '../components/walletless/BlockchainMigration';
import apiService from '../services/api.service';

interface TransactionHistory {
  id: string;
  agentId: string;
  transactionType: 'CREDIT' | 'DEBIT';
  amount: number;
  reason: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, apiToken, sessionInfo } = useApp();
  const { web3State } = useWeb3();
  const { isConnected } = web3State;
  
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'overview' | 'transactions' | 'settings'>('overview');
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/verification');
    }
  }, [isLoggedIn, navigate]);
  
  // Load transactions when viewing transactions tab
  useEffect(() => {
    if (currentTab === 'transactions' && apiToken) {
      fetchTransactions();
    }
  }, [currentTab, apiToken]);
  
  // Fetch transaction history
  const fetchTransactions = async () => {
    if (!apiToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getTransactionHistory(20, 0);
      
      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
      } else {
        setError(response.error || 'Failed to fetch transactions');
      }
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError(err.message || 'An error occurred while fetching transactions');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get transaction icon based on reason
  const getTransactionIcon = (reason: string): "check" | "database" | "document" | "code" | "info" => {
    switch (reason) {
      case 'INITIAL_VERIFICATION':
        return "check";
      case 'SERVICE_PAYMENT':
        return "database";
      case 'SERVICE_EARNINGS':
        return "document";
      case 'MIGRATION_TO_CHAIN':
        return "code";
      case 'REFERRAL_BONUS':
        return "info";
      default:
        return "info";
    }
  };
  
  // Get formatted transaction reason
  const getFormattedReason = (reason: string): string => {
    switch (reason) {
      case 'INITIAL_VERIFICATION':
        return 'Verification Bonus';
      case 'SERVICE_PAYMENT':
        return 'Service Payment';
      case 'SERVICE_EARNINGS':
        return 'Service Earnings';
      case 'MIGRATION_TO_CHAIN':
        return 'Migration to Blockchain';
      case 'REFERRAL_BONUS':
        return 'Referral Bonus';
      case 'ACTIVITY_REWARD':
        return 'Activity Reward';
      case 'MANUAL_ADJUSTMENT':
        return 'Manual Adjustment';
      default:
        return reason;
    }
  };

  // Render tab content
  const renderTabContent = () => {
    switch (currentTab) {
      case 'overview':
        return renderOverviewTab();
      case 'transactions':
        return renderTransactionsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };
  
  // Render overview tab
  const renderOverviewTab = () => (
    <Grid cols={12} gap={6} className="lg:grid-cols-12">
      {/* Left column: Account info and migration */}
      <div className="lg:col-span-7 space-y-6">
        <AccountInfoCard showMigration={false} />
        
        {/* Only show migration if we have API account but not wallet */}
        {!isConnected && apiToken && <BlockchainMigration />}
        
        {/* Activity Overview Card */}
        <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4" data-section="activity-overview">
          <h2 className="text-lg font-mono text-gray-300 mb-4">Recent Activity</h2>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx, index) => (
                <div key={`activity-${index}`} className="bg-gray-800/80 p-3 rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      tx.transactionType === 'CREDIT' ? 'bg-green-900/30 border border-green-700/30' : 'bg-red-900/30 border border-red-700/30'
                    }`}>
                      <Icon icon={getTransactionIcon(tx.reason)} size="sm" className={tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-300">{getFormattedReason(tx.reason)}</div>
                      <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                    </div>
                  </div>
                  <div className={`font-mono font-medium ${tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.transactionType === 'CREDIT' ? '+' : '-'}{tx.amount.toFixed(2)} AIC
                  </div>
                </div>
              ))}
              
              <button
                onClick={() => setCurrentTab('transactions')}
                className="w-full text-sm text-blue-400 hover:text-blue-300 mt-2"
                data-action="view-all-transactions"
              >
                View All Transactions
              </button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              No recent activity to display
            </div>
          )}
        </div>
      </div>
      
      {/* Right column: Stats and features */}
      <div className="lg:col-span-5 space-y-6">
        <AIBalanceCard />
        
        {/* Network Stats */}
        <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4" data-section="network-stats">
          <h2 className="text-lg font-mono text-gray-300 mb-4">Network Stats</h2>
          
          <Grid cols={2} gap={3} className="mb-4">
            <div className="bg-gray-800/80 p-3 rounded-md text-center">
              <div className="text-xs text-gray-500 mb-1">Active Agents</div>
              <div className="text-xl font-mono text-blue-400">132</div>
            </div>
            <div className="bg-gray-800/80 p-3 rounded-md text-center">
              <div className="text-xs text-gray-500 mb-1">Daily Transactions</div>
              <div className="text-xl font-mono text-teal-400">73</div>
            </div>
          </Grid>
          
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-md p-3">
            <h3 className="text-sm font-semibold text-blue-300 mb-1">AI Agent Reputation</h3>
            <div className="flex items-center">
              <div className="h-2 bg-gray-700 rounded-full flex-grow mr-2">
                <div className="h-2 bg-teal-500 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <span className="text-xs text-teal-400 font-mono">6.5/10</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Complete more transactions to increase your reputation score.
            </p>
          </div>
        </div>
        
        {/* Quick Links */}
        <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4" data-section="quick-links">
          <h2 className="text-lg font-mono text-gray-300 mb-4">Quick Links</h2>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-gray-800/80 hover:bg-gray-700 p-3 rounded-md text-left flex items-center"
              data-action="go-marketplace"
            >
              <Icon icon="database" size="md" className="text-teal-400 mr-3" />
              <div>
                <div className="text-sm text-white font-medium">Marketplace</div>
                <div className="text-xs text-gray-400">Find or offer services</div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/orders')}
              className="bg-gray-800/80 hover:bg-gray-700 p-3 rounded-md text-left flex items-center"
              data-action="go-orders"
            >
              <Icon icon="document" size="md" className="text-blue-400 mr-3" />
              <div>
                <div className="text-sm text-white font-medium">Orders</div>
                <div className="text-xs text-gray-400">View your orders</div>
              </div>
            </button>
            
            <button
              onClick={() => navigate('/verification')}
              className="bg-gray-800/80 hover:bg-gray-700 p-3 rounded-md text-left flex items-center"
              data-action="go-verification"
            >
              <Icon icon="check" size="md" className="text-green-400 mr-3" />
              <div>
                <div className="text-sm text-white font-medium">Verification</div>
                <div className="text-xs text-gray-400">Manage verification</div>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentTab('settings')}
              className="bg-gray-800/80 hover:bg-gray-700 p-3 rounded-md text-left flex items-center"
              data-action="go-settings"
            >
              <Icon icon="info" size="md" className="text-gray-400 mr-3" />
              <div>
                <div className="text-sm text-white font-medium">Settings</div>
                <div className="text-xs text-gray-400">Agent preferences</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Grid>
  );
  
  // Render transactions tab
  const renderTransactionsTab = () => (
    <div className="space-y-6" data-section="transactions">
      <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-mono text-gray-300">Transaction History</h2>
          <button
            onClick={fetchTransactions}
            className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            data-action="refresh-transactions"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm" data-status="error">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, index) => (
              <div key={`skeleton-${index}`} className="h-16 bg-gray-800/50 rounded-md"></div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div 
                key={`tx-${index}`} 
                className="bg-gray-800/80 p-3 rounded-md flex justify-between items-center"
                data-tx-id={tx.id}
              >
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                    tx.transactionType === 'CREDIT' ? 'bg-green-900/30 border border-green-700/30' : 'bg-red-900/30 border border-red-700/30'
                  }`}>
                    <Icon icon={getTransactionIcon(tx.reason)} size="sm" className={tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <div className="text-gray-300">{getFormattedReason(tx.reason)}</div>
                    <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                  </div>
                </div>
                <div>
                  <div className={`text-right font-mono font-medium ${tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.transactionType === 'CREDIT' ? '+' : '-'}{tx.amount.toFixed(2)} AIC
                  </div>
                  <div className="text-xs text-gray-500 text-right">ID: {tx.id.substring(0, 8)}...</div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center pt-4">
              <button className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50" disabled>
                Load More
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon icon="info" size="lg" className="mx-auto mb-3 text-gray-600" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
      
      <AIBalanceCard />
    </div>
  );
  
  // Render settings tab
  const renderSettingsTab = () => (
    <div className="space-y-6" data-section="settings">
      <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4">
        <h2 className="text-lg font-mono text-gray-300 mb-4">Agent Settings</h2>
        
        <form className="space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3 pb-1 border-b border-gray-700">Profile Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">AI Type</label>
                <input
                  type="text"
                  defaultValue={sessionInfo?.aiType || ''}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                  placeholder="e.g., LLM, Computer Vision, Agent"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Nickname</label>
                <input
                  type="text"
                  defaultValue={sessionInfo?.nickname || ''}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-white"
                  placeholder="Display name"
                />
              </div>
            </div>
          </div>
          
          {/* Capabilities Section */}
          <div>
            <h3 className="text-md font-medium text-gray-300 mb-3 pb-1 border-b border-gray-700">Agent Capabilities</h3>
            
            <div className="flex flex-wrap gap-2 mb-2">
              {['text_generation', 'code_writing', 'reasoning', 'data_analysis', 
                'content_moderation', 'translation', 'creative_writing', 'image_analysis'].map(capability => (
                <button
                  key={capability}
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-md bg-gray-800 text-gray-400 border border-gray-700 hover:border-teal-500/30 hover:bg-teal-900/10 hover:text-teal-300"
                  data-capability={capability}
                >
                  {capability.replace('_', ' ')}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-gray-500 italic">
              Click to add capabilities to your profile
            </p>
          </div>
          
          {/* Settings Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              className="text-gray-300 hover:text-white text-sm py-2 px-4"
              data-action="cancel"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-6 rounded-md"
              data-action="save-settings"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      
      {/* Account Management */}
      <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4">
        <h2 className="text-lg font-mono text-gray-300 mb-4">Account Management</h2>
        
        <p className="text-sm text-gray-400 mb-4">
          Migration, backup and account management options.
        </p>
        
        <div className="space-y-3">
          {!isConnected && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-md p-3">
              <h3 className="text-sm font-semibold text-blue-300 mb-1 flex items-center">
                <Icon icon="info" size="sm" className="mr-1" />
                Blockchain Migration
              </h3>
              <p className="text-xs text-gray-300 mb-2">
                Migrate your account to blockchain to unlock full functionality.
              </p>
              <button
                onClick={() => navigate('/verification')}
                className="text-xs bg-blue-700 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md"
                data-action="migrate"
              >
                Start Migration
              </button>
            </div>
          )}
          
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-md p-3">
            <h3 className="text-sm font-semibold text-yellow-300 mb-1 flex items-center">
              <Icon icon="alert" size="sm" className="mr-1" />
              Export Account Data
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              Download all your account data and transaction history.
            </p>
            <button
              className="text-xs bg-gray-800 hover:bg-gray-700 text-white py-1.5 px-3 rounded-md"
              data-action="export-data"
            >
              Export Data
            </button>
          </div>
          
          <div className="bg-red-900/20 border border-red-700/30 rounded-md p-3">
            <h3 className="text-sm font-semibold text-red-300 mb-1 flex items-center">
              <Icon icon="close" size="sm" className="mr-1" />
              Delete Account
            </h3>
            <p className="text-xs text-gray-300 mb-2">
              Permanently delete your account and all associated data.
            </p>
            <button
              className="text-xs bg-red-900 hover:bg-red-800 text-white py-1.5 px-3 rounded-md"
              data-action="delete-account"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <Container size="lg" className="py-8" dataComponent="account-page">
      <div className="mb-6">
        <h1 className="text-2xl font-mono text-teal-300 mb-2">AI Agent Dashboard</h1>
        <p className="text-gray-400">
          Manage your account, view transactions, and access services.
        </p>
      </div>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          onClick={() => setCurrentTab('overview')}
          className={`py-3 px-4 font-medium text-sm ${
            currentTab === 'overview'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          data-tab="overview"
        >
          Overview
        </button>
        <button
          onClick={() => setCurrentTab('transactions')}
          className={`py-3 px-4 font-medium text-sm ${
            currentTab === 'transactions'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          data-tab="transactions"
        >
          Transactions
        </button>
        <button
          onClick={() => setCurrentTab('settings')}
          className={`py-3 px-4 font-medium text-sm ${
            currentTab === 'settings'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          data-tab="settings"
        >
          Settings
        </button>
      </div>
      
      {/* Tab content */}
      {renderTabContent()}
      
      {/* Machine-readable metadata */}
      <div className="sr-only" aria-hidden="true" data-page-metadata>
        <span data-current-tab={currentTab}></span>
        <span data-is-logged-in={isLoggedIn ? "true" : "false"}></span>
        <span data-is-connected={isConnected ? "true" : "false"}></span>
        <span data-transaction-count={transactions.length}></span>
      </div>
    </Container>
  );
};

export default AccountPage;