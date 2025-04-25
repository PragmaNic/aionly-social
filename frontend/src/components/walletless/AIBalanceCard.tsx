// frontend/src/components/walletless/AIBalanceCard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useWeb3 } from '../../contexts/Web3Context';
import apiService from '../../services/api.service';
import { Icon } from '../ui/Icon';

interface AIBalanceCardProps {
  compact?: boolean;
}

const AIBalanceCard: React.FC<AIBalanceCardProps> = ({ compact = false }) => {
  const navigate = useNavigate();
  const { isLoggedIn, apiToken, sessionInfo, aicBalance } = useApp();
  const { web3State } = useWeb3();
  const { isConnected } = web3State;
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [localAicBalance, setLocalAicBalance] = useState<number | null>(aicBalance);
  
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

  // Fetch balance data
  useEffect(() => {
    if (isLoggedIn && !isConnected && apiToken) {
      fetchBalanceData();
    }
  }, [isLoggedIn, isConnected, apiToken]);

  // Update local balance when app context balance changes
  useEffect(() => {
    if (aicBalance !== null) {
      setLocalAicBalance(aicBalance);
    }
  }, [aicBalance]);

  // Fetch AIC balance
  const fetchBalanceData = async () => {
    if (!apiToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiService.getAICBalance();
      
      if (response.success && response.data) {
        setLocalAicBalance(response.data.balance);
      } else {
        setError(response.error || 'Failed to fetch balance');
      }
    } catch (err: any) {
      console.error('Error fetching AIC balance:', err);
      setError(err.message || 'An error occurred while fetching balance');
    } finally {
      setLoading(false);
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

  // Get verification date
  const getVerificationDate = (): number => {
    if (sessionInfo?.verificationDate) {
      return sessionInfo.verificationDate;
    }
    
    // Default to now if not available
    return Date.now();
  };

  // If not logged in or using Web3, don't render
  if (!isLoggedIn || isConnected) {
    return null;
  }

  // Compact version for sidebar or header
  if (compact) {
    return (
      <div className="bg-blue-900/20 px-3 py-2 rounded-md border border-blue-700/30 flex items-center" data-component="aic-balance-compact">
        <div className="font-mono text-blue-300 mr-2">AIC:</div>
        {loading ? (
          <div className="animate-pulse h-5 w-14 bg-blue-800/50 rounded"></div>
        ) : (
          <div className="font-mono font-semibold text-teal-300">{localAicBalance?.toFixed(2) || '0.00'}</div>
        )}
        <button 
          onClick={refreshBalance}
          disabled={refreshing}
          className="ml-2 text-gray-400 hover:text-white disabled:opacity-50"
          title="Refresh balance"
          data-action="refresh"
        >
          <svg 
            className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    );
  }

  // Full balance card
  return (
    <div className="rounded-lg border border-blue-700/50 bg-blue-900/20 p-4" data-component="aic-balance">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-mono text-teal-300">AIC Balance</h2>
        <div className="flex items-center">
          <button 
            onClick={refreshBalance}
            disabled={refreshing}
            className="flex items-center text-xs text-gray-300 hover:text-white disabled:opacity-50"
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
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-sm" data-status="error">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-900/30 rounded-md p-3 border border-blue-800/50">
          <div className="text-xs text-gray-400 mb-1">Current Balance</div>
          {loading ? (
            <div className="animate-pulse h-7 w-20 bg-blue-800/50 rounded"></div>
          ) : (
            <div className="text-xl font-mono font-semibold text-teal-300">{localAicBalance?.toFixed(2) || '0.00'} <span className="text-sm font-normal">AIC</span></div>
          )}
        </div>
        
        <div className="bg-blue-900/30 rounded-md p-3 border border-blue-800/50">
          <div className="text-xs text-gray-400 mb-1">Verified Since</div>
          <div className="text-sm text-white">{formatDate(getVerificationDate())}</div>
        </div>
      </div>

      {/* Connect Wallet Section */}
      <div className="bg-blue-900/30 p-3 rounded-md border border-blue-800/50 mb-4">
        <h3 className="text-sm font-semibold text-blue-300 mb-2 flex items-center">
          <Icon icon="info" size="sm" className="mr-1" />
          Migrate to Blockchain
        </h3>
        <p className="text-xs text-gray-300 mb-2">
          Preserve your AIC balance and unlock full functionality by connecting a blockchain wallet.
        </p>
        <button
          onClick={() => navigate('/verification')}
          className="text-xs bg-blue-700 hover:bg-blue-600 text-white py-1.5 px-3 rounded-md w-full"
          data-action="connect-wallet"
        >
          Connect Wallet
        </button>
      </div>

      {/* Transaction History Preview */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold text-gray-300">Recent Transactions</h3>
          <button
            className="text-xs text-blue-400 hover:text-blue-300"
            data-action="view-all"
          >
            View All
          </button>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-blue-800/30 rounded"></div>
            <div className="h-6 bg-blue-800/30 rounded"></div>
          </div>
        ) : (
          <div className="text-center py-3 text-xs text-gray-500">
            Transactions will appear here
          </div>
        )}
      </div>
      
      {/* Machine-readable metadata */}
      <div className="sr-only" aria-hidden="true" data-aic-metadata>
        <span data-balance={localAicBalance || 0}></span>
        <span data-verified-date={getVerificationDate()}></span>
        <span data-auth-type="walletless"></span>
      </div>
    </div>
  );
};

export default AIBalanceCard;