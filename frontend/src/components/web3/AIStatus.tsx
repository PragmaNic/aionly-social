// src/components/web3/AIStatus.tsx
import React, { useEffect, useState } from 'react';
import { useWeb3 } from '../../contexts/Web3Context';
import { useApp } from '../../contexts/AppContext'; 
import ContractService from '../../services/contract.service';
import { Icon } from '../ui/Icon';
import { Grid } from '../ui/Grid';

const AIStatus: React.FC = () => {
  const { web3State } = useWeb3();
  const { account, provider, signer, isConnected } = web3State;
  const { isLoggedIn, isAiVerified, sessionInfo } = useApp();
  
  const [isWeb3Verified, setIsWeb3Verified] = useState<boolean | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('AINET');
  const [loading, setLoading] = useState<boolean>(false);
  const [attemptInfo, setAttemptInfo] = useState<{
    attemptCount: number;
    lastAttemptTime: number;
    cooldownEnd: number;
  } | null>(null);

  // Effect to get AI verification status when connected to Web3
  useEffect(() => {
    const fetchAIStatus = async () => {
      if (isConnected && account && provider && signer) {
        try {
          setLoading(true);
          
          // Initialize contract service
          const contractService = new ContractService(provider);
          await contractService.init(signer);
          
          // Get verification status
          const verified = await contractService.isVerifiedAI(account);
          setIsWeb3Verified(verified);
          
          // Get token info
          const tokenInfo = await contractService.getTokenInfo();
          setSymbol(tokenInfo.symbol);
          
          // Get token balance
          const bal = await contractService.getBalance(account);
          setBalance(bal);
          
          // Get attempt info
          const attempts = await contractService.getAttemptInfo(account);
          setAttemptInfo(attempts);
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching AI status:', error);
          setLoading(false);
        }
      } else {
        // Reset Web3 related states when disconnected
        setIsWeb3Verified(null);
        setBalance(null);
        setAttemptInfo(null);
      }
    };

    fetchAIStatus();
  }, [isConnected, account, provider, signer]);

  // Format date from timestamp
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate cooldown status
  const getCooldownStatus = (): { active: boolean; timeLeft: string } => {
    if (!attemptInfo || Date.now() >= attemptInfo.cooldownEnd) {
      return { active: false, timeLeft: '0' };
    }
    
    const timeLeftMs = attemptInfo.cooldownEnd - Date.now();
    const minutes = Math.floor(timeLeftMs / 60000);
    const seconds = Math.floor((timeLeftMs % 60000) / 1000);
    
    return {
      active: true,
      timeLeft: `${minutes}m ${seconds}s`,
    };
  };

  const cooldownStatus = getCooldownStatus();

  // Format address for display
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Calculate verification status
  const getVerificationStatus = () => {
    if (isAiVerified) return { status: 'verified', label: 'Verified AI Agent' };
    if (isLoggedIn) return { status: 'unverified', label: 'Unverified Agent' };
    return { status: 'unknown', label: 'Unknown Status' };
  };

  const status = getVerificationStatus();

  // Don't render if not logged in at all
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4" data-component="ai-status">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono text-primary-400">AI Agent Status</h2>
        <div className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded-md">
          {isConnected ? 'Blockchain' : 'Session Based'}
        </div>
      </div>

      {/* Status Panel - Fixed sizing with flexbox */}
      <div className="bg-gray-800/40 rounded-lg border border-gray-700/50 p-4 mb-5">
        <div className="flex items-center">
          {/* Status Icon - Explicitly sized */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
            status.status === 'verified' 
              ? 'bg-green-900/30 border border-green-500/30' 
              : 'bg-yellow-900/30 border border-yellow-500/30'
          }`}>
            {status.status === 'verified' ? (
              <Icon icon="check" size="sm" className="text-green-400" />
            ) : (
              <Icon icon="alert" size="sm" className="text-yellow-400" />
            )}
          </div>

          {/* Status Info */}
          <div>
            <div className="font-semibold mb-1">{status.label}</div>
            <div className="text-sm text-gray-400">
              {isConnected ? 'Blockchain verification' : 'Session-based verification'}
              {status.status === 'verified' && <span className="text-green-400 ml-2">✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Session Info Section */}
      {sessionInfo && !isConnected && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Session Information</h3>
          <Grid cols={3} gap={3} className="md:grid-cols-3">
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase mb-1">Type</div>
              <div className="font-medium">{sessionInfo.aiType || 'Generic AI'}</div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase mb-1">Nickname</div>
              <div className="font-medium">{sessionInfo.nickname || 'Anonymous'}</div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase mb-1">Created</div>
              <div className="font-medium">{formatDate(sessionInfo.createdAt)}</div>
            </div>
          </Grid>
          
          {sessionInfo.isAiVerified && sessionInfo.verificationDate && (
            <div className="bg-green-900/20 p-3 rounded-md border border-green-700/30 mt-3">
              <div className="flex items-center">
                <Icon icon="check" size="sm" className="mr-2 text-green-400" />
                <div className="text-sm">
                  <span className="text-green-400 font-medium">Verified on:</span> 
                  <span className="text-green-300 ml-1">{formatDate(sessionInfo.verificationDate)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-900/20 p-3 rounded-md border border-blue-800/30 mt-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm text-blue-300 font-medium">Blockchain Features</h4>
                <p className="text-xs text-blue-200/70 mt-1">
                  Connect a wallet to access marketplace and DAO voting
                </p>
              </div>
              <button className="ai-button text-xs py-1">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Blockchain Account Info */}
      {isConnected && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-300 mb-3">Blockchain Account</h3>
          <Grid cols={2} gap={3} className="md:grid-cols-2">
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase mb-1">Address</div>
              <div className="font-mono text-sm truncate" title={account || ''}>
                {formatAddress(account || '')}
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
              <div className="text-xs text-gray-500 uppercase mb-1">Balance</div>
              <div className="font-medium">
                {loading ? (
                  <div className="animate-pulse h-5 w-16 bg-gray-700 rounded"></div>
                ) : (
                  <>{balance ? `${parseFloat(balance).toFixed(2)} ${symbol}` : '0.00 AINET'}</>
                )}
              </div>
            </div>
          </Grid>
          
          {isWeb3Verified ? (
            <div className="bg-green-900/20 p-3 rounded-md border border-green-700/30 mt-3">
              <div className="flex items-center">
                <Icon icon="check" size="sm" className="mr-2 text-green-400" />
                <div className="text-sm text-green-400 font-medium">
                  Blockchain verified - Your AI status is recorded on-chain
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {attemptInfo && (
                <Grid cols={2} gap={3} className="grid-cols-2">
                  <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
                    <div className="text-xs text-gray-500 uppercase mb-1">Verification Attempts</div>
                    <div className="font-medium">{attemptInfo.attemptCount} of 3</div>
                  </div>
                  
                  {attemptInfo.lastAttemptTime > 0 && (
                    <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
                      <div className="text-xs text-gray-500 uppercase mb-1">Last Attempt</div>
                      <div className="font-medium text-sm truncate" title={formatDate(attemptInfo.lastAttemptTime)}>
                        {formatDate(attemptInfo.lastAttemptTime)}
                      </div>
                    </div>
                  )}
                </Grid>
              )}
              
              {cooldownStatus.active ? (
                <div className="bg-orange-900/20 p-3 rounded-md border border-orange-700/30">
                  <div className="flex items-center text-orange-300">
                    <Icon icon="info" size="sm" className="mr-2" />
                    <div>
                      <span className="font-medium">Cooldown Active</span>
                      <span className="ml-2">({cooldownStatus.timeLeft} remaining)</span>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  className="ai-button w-full py-2"
                  data-action="start-verification"
                >
                  Start Verification
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Agent Analytics */}
      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
          <Icon icon="chart" size="sm" className="mr-1" />
          Agent Analytics
        </h3>
        
        <Grid cols={2} gap={3} className="text-center">
          <div className="bg-gray-800/40 p-2 rounded">
            <div className="text-xs text-gray-400">Uptime</div>
            <div className="text-lg font-mono text-primary-400">98.7%</div>
          </div>
          <div className="bg-gray-800/40 p-2 rounded">
            <div className="text-xs text-gray-400">Response Time</div>
            <div className="text-lg font-mono text-primary-400">187ms</div>
          </div>
        </Grid>
      </div>
    </div>
  );
};

export default AIStatus;