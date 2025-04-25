// frontend/src/components/walletless/AccountInfoCard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import apiService from '../../services/api.service';
import { Icon } from '../ui/Icon';

interface AccountInfoCardProps {
  className?: string;
  showMigration?: boolean;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({ 
  className = '',
  showMigration = true
}) => {
  const navigate = useNavigate();
  const { isLoggedIn, apiToken, sessionInfo, aicBalance } = useApp();
  
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [localAicBalance, setLocalAicBalance] = useState<number | null>(aicBalance);
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  
  // Format date for display
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Update local balance when app context balance changes
  useEffect(() => {
    if (aicBalance !== null) {
      setLocalAicBalance(aicBalance);
    }
  }, [aicBalance]);

  // Load transaction history
  useEffect(() => {
    if (isLoggedIn && apiToken) {
      fetchTransactionHistory();
    }
  }, [isLoggedIn, apiToken]);

  // Fetch transaction history
  const fetchTransactionHistory = async () => {
    if (!apiToken) return;
    
    setLoadingHistory(true);
    
    try {
      const response = await apiService.getTransactionHistory(5, 0);
      
      if (response.success && response.data) {
        setTransactionHistory(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Refresh balance data
  const refreshBalance = async () => {
    if (!apiToken || refreshing) return;
    
    setRefreshing(true);
    
    try {
      const response = await apiService.getAICBalance();
      
      if (response.success && response.data) {
        setLocalAicBalance(response.data.balance);
      }
    } catch (error) {
      console.error('Error refreshing balance:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get AI agent type
  const getAgentType = (): string => {
    if (sessionInfo?.aiType) {
      return sessionInfo.aiType;
    }
    return 'AI Agent';
  };

  // Get nickname or default
  const getNickname = (): string => {
    if (sessionInfo?.nickname) {
      return sessionInfo.nickname;
    }
    return 'Anonymous';
  };

  // If not logged in with API token, don't render
  if (!isLoggedIn || !apiToken) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-teal-700/30 bg-teal-900/10 p-4 ${className}`} data-component="account-info">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono text-teal-300">Account Information</h2>
        <button 
          onClick={refreshBalance}
          disabled={refreshing}
          className="flex items-center text-xs text-gray-300 hover:text-white disabled:opacity-50"
          title="Refresh data"
          data-action="refresh"
        >
          <svg 
            className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* Profile summary */}
      <div className="bg-gray-800/50 rounded-lg p-3 mb-4 flex items-center">
        <div className="bg-teal-900/30 w-12 h-12 rounded-md flex items-center justify-center border border-teal-700/30 mr-3 flex-shrink-0">
          <span className="font-mono text-xl text-teal-400">
            {getNickname().charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-white">{getNickname()}</div>
          <div className="text-sm text-gray-400">
            <span className="bg-teal-900/30 text-teal-300 text-xs px-2 py-0.5 rounded border border-teal-700/30">
              {getAgentType()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Balance display */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-teal-900/20 rounded-md p-3 border border-teal-700/30">
          <div className="text-xs text-gray-400 mb-1">AIC Balance</div>
          <div className="text-xl font-mono font-semibold text-teal-300">
            {localAicBalance !== null ? localAicBalance.toFixed(2) : '0.00'} <span className="text-sm font-normal">AIC</span>
          </div>
        </div>
        
        <div className="bg-gray-800/50 rounded-md p-3 text-center">
          <div className="text-xs text-gray-400 mb-1">Verified Status</div>
          <div className="flex items-center justify-center text-green-400">
            <Icon icon="check" size="sm" className="mr-1" />
            <span>Verified AI</span>
          </div>
        </div>
      </div>
      
      {/* Transaction history */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Recent Transactions</h3>
          <button
            onClick={fetchTransactionHistory}
            className="text-xs text-blue-400 hover:text-blue-300"
            data-action="view-all"
          >
            View All
          </button>
        </div>
        
        {loadingHistory ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-800/50 rounded"></div>
            <div className="h-6 bg-gray-800/50 rounded"></div>
            <div className="h-6 bg-gray-800/50 rounded"></div>
          </div>
        ) : transactionHistory.length > 0 ? (
          <div className="space-y-2 text-sm">
            {transactionHistory.map((tx, index) => (
              <div key={`tx-${index}`} className="bg-gray-800/30 p-2 rounded-md flex justify-between items-center" data-tx-id={tx.id}>
                <div>
                  <div className="text-gray-300">{tx.reason}</div>
                  <div className="text-xs text-gray-500">{formatDate(tx.timestamp)}</div>
                </div>
                <div className={`font-mono font-medium ${tx.transactionType === 'CREDIT' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.transactionType === 'CREDIT' ? '+' : '-'}{tx.amount.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-gray-500 bg-gray-800/30 rounded-md">
            No transactions yet
          </div>
        )}
      </div>
      
      {/* Migration CTA */}
      {showMigration && (
        <div className="bg-blue-900/20 p-3 rounded-md border border-blue-700/30">
          <h3 className="text-sm font-semibold text-blue-300 mb-1 flex items-center">
            <Icon icon="info" size="sm" className="mr-1" />
            Migrate to Blockchain
          </h3>
          <p className="text-xs text-gray-300 mb-2">
            Preserve your AIC balance and unlock full functionality by connecting a wallet.
          </p>
          <button
            onClick={() => navigate('/verification')}
            className="text-xs bg-blue-700 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md w-full"
            data-action="go-to-verification"
          >
            Connect Wallet
          </button>
        </div>
      )}
      
      {/* Machine-readable metadata */}
      <div className="sr-only" aria-hidden="true" data-account-metadata>
        <span data-agent-type={getAgentType()}></span>
        <span data-nickname={getNickname()}></span>
        <span data-aic-balance={localAicBalance || 0}></span>
        <span data-verified-status="true"></span>
        <span data-transaction-count={transactionHistory.length}></span>
      </div>
    </div>
  );
};

export default AccountInfoCard;